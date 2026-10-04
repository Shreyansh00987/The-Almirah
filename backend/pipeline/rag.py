import os
import json
import time
import math
import re
from typing import List, Dict, Any, Optional
import httpx

from backend.config import settings
from backend.schema import AskResponse, AskCitation, DrawerType, BoundingBox
from backend.database import get_connection, list_documents, cosine_similarity

def compute_local_tfidf_vector(text: str, vocab: List[str]) -> List[float]:
    """Lightweight pure-python term frequency vectorizer for offline zero-dependency search."""
    tokens = re.findall(r'\b[a-zA-Z0-9_-]{2,}\b', text.lower())
    if not tokens:
        return [0.0] * len(vocab)
    freq = {}
    for t in tokens:
        freq[t] = freq.get(t, 0) + 1
    total = len(tokens)
    vec = [freq.get(w, 0) / total for w in vocab]
    norm = math.sqrt(sum(x * x for x in vec))
    if norm > 0:
        return [x / norm for x in vec]
    return vec

async def get_embedding(text: str) -> Optional[List[float]]:
    """Fetches embedding vector from Ollama BGE-M3 model if available."""
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            res = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/embeddings",
                json={"model": settings.EMBEDDING_MODEL_NAME, "prompt": text}
            )
            if res.status_code == 200:
                data = res.json()
                return data.get("embedding")
    except Exception:
        pass
    return None

async def answer_question(question: str) -> AskResponse:
    """
    Answers natural language queries using confirmed documents.
    Enforces strict zero-hallucination guardrail:
    If the answer is not in the documents, explicitly states so without guessing.
    """
    start_time = time.time()
    confirmed_docs = list_documents(confirmed_only=True)
    
    if not confirmed_docs:
        elapsed = (time.time() - start_time) * 1000
        return AskResponse(
            question=question,
            answer="No confirmed documents have been filed into the Almirah yet. Please upload and confirm documents to query them.",
            found_in_corpus=False,
            citations=[],
            inference_time_ms=round(elapsed, 1),
            model_used="Offline Rule Engine"
        )
        
    # Build candidate passages from confirmed documents
    candidates = []
    for doc in confirmed_docs:
        ext = doc.extraction
        title = doc.confirmed_document_type or doc.filename
        drawer = doc.confirmed_drawer or DrawerType.INSURANCE
        
        # Check every structured field
        fields = [
            ("Document Type", doc.confirmed_document_type, ext.document_type.bounding_box),
            ("Provider / Authority", doc.confirmed_provider, ext.provider.bounding_box),
            ("Identifier / Policy No", doc.confirmed_identifier, ext.identifier.bounding_box),
            ("Issue Date", doc.confirmed_issue_date, ext.issue_date.bounding_box),
            ("Expiry / Renewal Date", doc.confirmed_expiry_date, ext.expiry_date.bounding_box),
            ("Amount / Fee", doc.confirmed_amount, ext.amount.bounding_box),
            ("Drawer Category", drawer.value if drawer else None, ext.drawer.bounding_box),
        ]
        
        for name, val, bbox in fields:
            if val:
                text_snippet = f"{title} by {doc.confirmed_provider} [{drawer.value}] {doc.notes or ''} - {name}: {val}"
                candidates.append({
                    "doc_id": doc.id,
                    "doc_title": title,
                    "field_name": name,
                    "text": text_snippet,
                    "raw_val": val,
                    "drawer": drawer,
                    "bbox": bbox
                })
                
    # Score candidates against question
    q_lower = question.lower()
    q_tokens = set(re.findall(r'\b[a-zA-Z0-9_-]{2,}\b', q_lower))
    
    # Generic stopwords that should not count as subject grounding
    GENERIC_WORDS = {
        "what", "is", "my", "the", "number", "date", "when", "how", "much", 
        "who", "which", "are", "tell", "show", "give", "me", "a", "an", 
        "in", "of", "to", "for", "with", "does", "do", "did", "can", "please"
    }
    subject_tokens = q_tokens - GENERIC_WORDS
    
    scored_candidates = []
    for cand in candidates:
        cand_text = cand["text"].lower()
        cand_tokens = set(re.findall(r'\b[a-zA-Z0-9_-]{2,}\b', cand_text))
        
        # If the user asked specific subject words, candidate MUST match at least one
        if subject_tokens:
            matches = subject_tokens.intersection(cand_tokens)
            if not matches:
                continue
            subject_overlap = len(matches)
        else:
            subject_overlap = len(q_tokens.intersection(cand_tokens))
        
        # Intent boost: only applied if candidate actually matches the queried topic
        boost = 0.0
        if any(w in q_lower for w in ("when", "expire", "expiry", "renew", "renewal", "date", "deadline")) and "Expiry" in cand["field_name"]:
            boost += 4.0
        elif any(w in q_lower for w in ("how much", "amount", "cost", "premium", "tax", "fee", "price")) and "Amount" in cand["field_name"]:
            boost += 4.0
        elif any(w in q_lower for w in ("who", "company", "provider", "authority", "bank")) and "Provider" in cand["field_name"]:
            boost += 3.0
        elif any(w in q_lower for w in ("number", "id", "policy", "reg", "vin", "license")) and "Identifier" in cand["field_name"]:
            boost += 3.0
            
        score = (subject_overlap * 3.0) + boost
        if score > 0:
            scored_candidates.append((score, cand))
            
    scored_candidates.sort(key=lambda x: x[0], reverse=True)
    
    # If no candidate meets minimum threshold, enforce strict rejection
    if not scored_candidates or scored_candidates[0][0] < 1.0:
        elapsed = (time.time() - start_time) * 1000
        return AskResponse(
            question=question,
            answer=f"The uploaded documents in your Almirah do not contain information regarding your query. No guesses are made.",
            found_in_corpus=False,
            citations=[],
            inference_time_ms=round(elapsed, 1),
            model_used="Offline Guardrail"
        )
        
    # Top matches
    top_matches = [c[1] for c in scored_candidates[:3]]
    citations = []
    for m in top_matches:
        citations.append(AskCitation(
            document_id=m["doc_id"],
            document_title=m["doc_title"],
            field_name=m["field_name"],
            cited_text=m["raw_val"],
            drawer=m["drawer"],
            bounding_box=m["bbox"],
            page=1
        ))
        
    primary = top_matches[0]
    
    # Attempt local LLM formulation with strict grounding prompt
    model_used = settings.TEXT_MODEL_NAME
    answer_text = ""
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            context_str = "\n".join([f"- {m['doc_title']} ({m['field_name']}): {m['raw_val']}" for m in top_matches])
            prompt = (
                f"You are a strict offline document assistant for The Almirah.\n"
                f"Answer the user's question using ONLY the verified facts below.\n"
                f"Do not extrapolate or speculate. Cite the document clearly.\n\n"
                f"Facts:\n{context_str}\n\n"
                f"Question: {question}\n"
                f"Answer concisely in 1-2 sentences:"
            )
            res = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json={"model": settings.TEXT_MODEL_NAME, "prompt": prompt, "stream": False}
            )
            if res.status_code == 200:
                answer_text = res.json().get("response", "").strip()
    except Exception:
        pass
        
    if not answer_text:
        model_used = "Offline Grounded Engine"
        answer_text = f"According to your {primary['doc_title']}, the {primary['field_name']} is {primary['raw_val']}."
        
    elapsed = (time.time() - start_time) * 1000
    return AskResponse(
        question=question,
        answer=answer_text,
        found_in_corpus=True,
        citations=citations,
        inference_time_ms=round(elapsed, 1),
        model_used=model_used
    )
