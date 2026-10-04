import asyncio
from backend.database import list_documents, get_drawers_summary, get_document
from backend.pipeline.rag import answer_question

async def test():
    print("Testing database...")
    docs = list_documents()
    print(f"Total documents: {len(docs)}")
    assert len(docs) == 9, f"Expected 9, got {len(docs)}"
    
    drawers = get_drawers_summary()
    print(f"Total drawers: {len(drawers)}")
    for d in drawers:
        print(f"  Drawer: {d.drawer.value}, Docs: {d.total_documents}, Urgency: {d.urgency.value}, Nearest: {d.nearest_deadline_days} days")
        
    print("\nTesting Ask / RAG...")
    # Test valid question
    res1 = await answer_question("When does my car insurance expire?")
    print(f"Question: {res1.question}")
    print(f"Answer: {res1.answer}")
    print(f"Found: {res1.found_in_corpus}, Citations: {len(res1.citations)}")
    if res1.citations:
        c = res1.citations[0]
        print(f"  Cited: {c.document_title} - {c.field_name}: {c.cited_text}")
    assert res1.found_in_corpus, "Should find car insurance"
    assert len(res1.citations) > 0, "Should have citation"
    
    # Test out-of-corpus question (must refuse to guess)
    res2 = await answer_question("What is my passport number?")
    print(f"\nQuestion: {res2.question}")
    print(f"Answer: {res2.answer}")
    print(f"Found: {res2.found_in_corpus}, Citations: {len(res2.citations)}")
    assert not res2.found_in_corpus, "Should NOT find passport"
    assert "not contain" in res2.answer.lower(), "Should explicitly refuse to guess"
    
    print("\nAll Backend tests passed successfully!")

if __name__ == "__main__":
    asyncio.run(test())
