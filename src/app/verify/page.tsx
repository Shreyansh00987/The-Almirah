'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import confetti from 'canvas-confetti';
import { api } from '@/lib/api';
import { DocumentRecord, DocumentVerificationPayload } from '@/lib/types';
import { DocumentViewer } from '@/components/verify/DocumentViewer';
import { FieldEditor } from '@/components/verify/FieldEditor';
import { ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function VerifyContent() {
  const searchParams = useSearchParams();
  const docId = searchParams.get('id') || 'SYN-01';

  const [document, setDocument] = useState<DocumentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFieldKey, setActiveFieldKey] = useState<string | null>(null);
  const [confirmedSuccess, setConfirmedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const doc = await api.getDocumentById(docId);
      if (doc) {
        setDocument(doc);
      } else {
        const all = await api.getDocuments();
        if (all.length > 0) setDocument(all[0]);
      }
      setLoading(false);
    }
    load();
  }, [docId]);

  const handleConfirm = async (payload: DocumentVerificationPayload) => {
    try {
      const updated = await api.confirmDocument(payload);
      setDocument(updated);
      setConfirmedSuccess(true);
      // Fire celebratory settling confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#B48226', '#D97706', '#5A3822']
      });
    } catch (err) {
      console.error("Failed to confirm", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-stone-200 border-t-[#5A3822] rounded-full animate-spin"></div>
        <p className="font-serif text-lg text-stone-700">Loading document twin...</p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h2 className="font-serif text-2xl text-stone-900">Document Not Found</h2>
        <p className="text-stone-500 text-sm">The requested document could not be located in local storage.</p>
        <Link 
          href="/"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-[#5A3822] text-[#FAF7F2] rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Almirah</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb / Top Bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="flex items-center space-x-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors p-1 rounded"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Almirah</span>
          </Link>
          <span className="text-stone-300">/</span>
          <span className="text-xs font-mono text-stone-700 font-bold">{document.id}</span>
        </div>

        {confirmedSuccess && (
          <div className="flex items-center space-x-3 bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-xl text-emerald-800 text-xs shadow-xs animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">Successfully filed into {document.confirmed_drawer || 'Cabinet'} drawer!</span>
            <Link
              href={`/?drawer=${document.confirmed_drawer}`}
              className="underline font-bold hover:text-emerald-950 flex items-center ml-2"
            >
              <span>Open Drawer</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        )}
      </div>

      {/* Side-by-Side Verification Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Document Scan Viewer */}
        <div className="lg:col-span-6 xl:col-span-7 h-[780px]">
          <DocumentViewer
            document={document}
            activeFieldKey={activeFieldKey}
            onSelectBox={(key) => setActiveFieldKey(key)}
          />
        </div>

        {/* Right: Field Editor & Single-Tap Confirmation */}
        <div className="lg:col-span-6 xl:col-span-5 h-[780px]">
          <FieldEditor
            document={document}
            activeFieldKey={activeFieldKey}
            onHoverField={(key) => setActiveFieldKey(key)}
            onConfirm={handleConfirm}
          />
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-stone-200 border-t-[#5A3822] rounded-full animate-spin"></div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
