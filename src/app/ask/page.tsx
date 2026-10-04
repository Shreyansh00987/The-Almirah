'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { AskResponse, AskCitation, DocumentRecord } from '@/lib/types';
import { DocumentModal } from '@/components/common/DocumentModal';
import { 
  Send, Sparkles, AlertCircle, HelpCircle, ExternalLink, 
  Clock, ShieldAlert, FileText, CheckCircle2, Mic, Printer 
} from 'lucide-react';
import Link from 'next/link';

export default function AskPage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AskResponse | null>(null);
  const [selectedCitationDoc, setSelectedCitationDoc] = useState<DocumentRecord | null>(null);
  const [highlightFieldKey, setHighlightFieldKey] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const suggestedQuestions = [
    "When does my car insurance expire?",
    "What is my property tax assessment number?",
    "What is the warranty period on the water purifier?",
    "How much is my health insurance premium?",
    "What is my passport number?", // Tests strict zero-hallucination guardrail
  ];

  const handleAsk = async (queryText?: string) => {
    const q = (queryText || question).trim();
    if (!q) return;

    if (queryText) setQuestion(queryText);
    setLoading(true);
    setResponse(null);

    try {
      const res = await api.askQuestion(q);
      setResponse(res);
    } catch (err) {
      console.error("Ask query failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceQuery = () => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuestion(transcript);
        setIsListening(false);
        handleAsk(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } else {
      alert("Speech recognition not supported in this browser. Please type your query.");
    }
  };

  const openCitationInModal = async (citation: AskCitation) => {
    const doc = await api.getDocumentById(citation.document_id);
    if (doc) {
      // Map field name back to field key
      let fieldKey = 'document_type';
      const fn = citation.field_name.toLowerCase();
      if (fn.includes('expiry') || fn.includes('date')) fieldKey = 'expiry_date';
      else if (fn.includes('amount') || fn.includes('fee')) fieldKey = 'amount';
      else if (fn.includes('id') || fn.includes('number') || fn.includes('policy')) fieldKey = 'identifier';
      else if (fn.includes('provider') || fn.includes('authority')) fieldKey = 'provider';

      setHighlightFieldKey(fieldKey);
      setSelectedCitationDoc(doc);
    }
  };

  const printEmergencyIndex = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="font-serif text-3xl font-bold text-paper-light">
            Ask Your Almirah
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Grounded local semantic search across verified documents. Every response cites the exact document scan and region.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={printEmergencyIndex}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors"
            title="Print Emergency Index"
          >
            <Printer className="w-3.5 h-3.5 text-brass" />
            <span>Emergency Index</span>
          </button>
        </div>
      </div>

      {/* Query Input Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl space-y-4">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }} 
          className="flex items-center space-x-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. When does my car insurance expire?"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-4 pr-12 py-3 text-sm text-paper-light focus:border-brass focus:ring-1 focus:ring-brass font-medium shadow-inner"
            />
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={handleVoiceQuery}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-slate-800 transition-colors ${
                isListening ? 'text-signal-red animate-pulse' : 'text-slate-400 hover:text-brass'
              }`}
              title="Voice Query (Whisper / Speech)"
              aria-label="Voice Query"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-5 py-3 rounded-lg bg-walnut-600 hover:bg-walnut-500 disabled:opacity-50 text-paper-light font-serif font-bold text-sm shadow-md border border-walnut-400 flex items-center space-x-2 transition-all cursor-pointer"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-paper-light border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Send className="w-4 h-4 text-brass-light" />
            )}
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>

        {/* Suggested Queries */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Suggested Verification Prompts:
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleAsk(q)}
                className="text-xs px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-paper-light border border-slate-700/80 transition-colors text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Answer and Citations Card */}
      {response && (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl space-y-5 animate-fadeIn">
          {/* Answer Header & Guardrail Flag */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-brass" />
              <span className="font-serif font-bold text-paper-light text-base">
                Local RAG Answer
              </span>
            </div>

            <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono">
              <span>Latency: <strong className="text-slate-300">{response.inference_time_ms} ms</strong></span>
              <span>·</span>
              <span>Engine: <strong className="text-emerald-400">{response.model_used}</strong></span>
            </div>
          </div>

          {/* Answer Prose */}
          <div className={`text-base leading-relaxed ${
            response.found_in_corpus 
              ? 'text-paper-light font-sans' 
              : 'text-amber-200 bg-amber-950/30 p-3.5 rounded border border-amber-800/60 font-medium'
          }`}>
            {response.answer}
          </div>

          {/* Citations Linking to Regions */}
          {response.citations.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Verified Document Citations (Click to view region):
                </span>
                <span className="text-[11px] text-slate-500">
                  {response.citations.length} Grounded Source{response.citations.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {response.citations.map((c, idx) => (
                  <div
                    key={idx}
                    onClick={() => openCitationInModal(c)}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-brass transition-all cursor-pointer group shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-serif font-bold text-paper-light group-hover:text-brass-light transition-colors">
                          {c.document_title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-brass border border-slate-700">
                          {c.drawer}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        <span>{c.field_name}: </span>
                        <strong className="text-slate-200 font-mono">{c.cited_text}</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 mt-2 border-t border-slate-900">
                      <span>Source: Page {c.page} Region</span>
                      <span className="text-brass group-hover:underline flex items-center font-medium">
                        <span>Inspect Region</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strict Zero-Guess Guardrail Footnote */}
          {!response.found_in_corpus && (
            <div className="flex items-start space-x-2 text-xs text-slate-400 pt-1">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Zero-guess guardrail active: The model refuses to extrapolate or hallucinate when verified facts are not found in your filed documents.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Focus Document Modal */}
      <DocumentModal
        document={selectedCitationDoc}
        onClose={() => setSelectedCitationDoc(null)}
        highlightField={highlightFieldKey}
      />
    </div>
  );
}
