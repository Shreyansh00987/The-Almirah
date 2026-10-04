'use client';

import React, { useState } from 'react';
import { 
  CheckCircle, AlertCircle, Calendar, Hash, Building2, 
  FileText, DollarSign, FolderArchive, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { DocumentRecord, DrawerType, DocumentVerificationPayload } from '@/lib/types';

interface FieldEditorProps {
  document: DocumentRecord;
  activeFieldKey: string | null;
  onHoverField: (key: string | null) => void;
  onConfirm: (payload: DocumentVerificationPayload) => Promise<void>;
}

export const FieldEditor: React.FC<FieldEditorProps> = ({
  document: doc,
  activeFieldKey,
  onHoverField,
  onConfirm,
}) => {
  const [docType, setDocType] = useState(doc.confirmed_document_type || doc.extraction.document_type.value || '');
  const [provider, setProvider] = useState(doc.confirmed_provider || doc.extraction.provider.value || '');
  const [identifier, setIdentifier] = useState(doc.confirmed_identifier || doc.extraction.identifier.value || '');
  const [issueDate, setIssueDate] = useState(doc.confirmed_issue_date || doc.extraction.issue_date.value || '');
  const [expiryDate, setExpiryDate] = useState(doc.confirmed_expiry_date || doc.extraction.expiry_date.value || '');
  const [amount, setAmount] = useState(doc.confirmed_amount || doc.extraction.amount.value || '');
  const [drawer, setDrawer] = useState<DrawerType>(
    doc.confirmed_drawer || (doc.extraction.drawer.value as DrawerType) || 'Insurance'
  );
  const [notes, setNotes] = useState(doc.notes || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onConfirm({
        id: doc.id,
        document_type: docType,
        provider,
        identifier,
        issue_date: issueDate || null,
        expiry_date: expiryDate || null,
        amount: amount || null,
        drawer,
        notes: notes || null,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderConfidenceBadge = (confidence: number) => {
    const pct = Math.round(confidence * 100);
    if (pct >= 90) {
      return (
        <span className="inline-flex items-center text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          {pct}% Confident
        </span>
      );
    } else if (pct >= 85) {
      return (
        <span className="inline-flex items-center text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
          {pct}% Moderate
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full animate-pulse">
          <AlertCircle className="w-3 h-3 mr-1" />
          {pct}% Verify OCR
        </span>
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-[#E2DDD3] p-6 shadow-xs overflow-y-auto">
      <div className="border-b border-[#E2DDD3] pb-4 mb-5">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Verify Extracted Facts
          </h2>
          {doc.is_confirmed ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Confirmed in Almirah</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Pending Human Confirmation</span>
            </span>
          )}
        </div>
        <p className="text-xs text-stone-500 mt-1 leading-relaxed">
          Open-source models read the document scan. Confirm or correct the fields below. Nothing becomes an active deadline until you tap confirm.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        {/* Document Type Field */}
        <div 
          onMouseEnter={() => onHoverField('document_type')}
          onMouseLeave={() => onHoverField(null)}
          className={`p-3.5 rounded-xl border transition-all ${
            activeFieldKey === 'document_type' 
              ? 'bg-[#FAF8F4] border-[#B48226] ring-2 ring-[#B48226]/30' 
              : 'bg-[#FAF8F4] border-[#E2DDD3] hover:border-stone-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <label className="flex items-center space-x-2 text-xs font-semibold text-stone-700 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-[#B48226]" />
              <span>Document Type</span>
            </label>
            {renderConfidenceBadge(doc.extraction.document_type.confidence)}
          </div>
          <input
            type="text"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full bg-white border border-[#E2DDD3] rounded-lg px-3 py-2 text-sm text-stone-900 font-medium focus:border-[#B48226] focus:ring-1 focus:ring-[#B48226]"
            required
          />
        </div>

        {/* Issuing Authority / Provider */}
        <div 
          onMouseEnter={() => onHoverField('provider')}
          onMouseLeave={() => onHoverField(null)}
          className={`p-3.5 rounded-xl border transition-all ${
            activeFieldKey === 'provider' 
              ? 'bg-[#FAF8F4] border-[#B48226] ring-2 ring-[#B48226]/30' 
              : 'bg-[#FAF8F4] border-[#E2DDD3] hover:border-stone-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <label className="flex items-center space-x-2 text-xs font-semibold text-stone-700 uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-[#B48226]" />
              <span>Issuing Authority / Provider</span>
            </label>
            {renderConfidenceBadge(doc.extraction.provider.confidence)}
          </div>
          <input
            type="text"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full bg-white border border-[#E2DDD3] rounded-lg px-3 py-2 text-sm text-stone-900 font-medium focus:border-[#B48226] focus:ring-1 focus:ring-[#B48226]"
            required
          />
        </div>

        {/* Identifier / Policy / Certificate Number */}
        <div 
          onMouseEnter={() => onHoverField('identifier')}
          onMouseLeave={() => onHoverField(null)}
          className={`p-3.5 rounded-xl border transition-all ${
            activeFieldKey === 'identifier' 
              ? 'bg-[#FAF8F4] border-[#B48226] ring-2 ring-[#B48226]/30' 
              : 'bg-[#FAF8F4] border-[#E2DDD3] hover:border-stone-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <label className="flex items-center space-x-2 text-xs font-semibold text-stone-700 uppercase tracking-wider">
              <Hash className="w-3.5 h-3.5 text-[#B48226]" />
              <span>Policy / Registration / ID Number</span>
            </label>
            {renderConfidenceBadge(doc.extraction.identifier.confidence)}
          </div>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full bg-white border border-[#E2DDD3] rounded-lg px-3 py-2 text-sm text-stone-900 font-mono font-bold focus:border-[#B48226] focus:ring-1 focus:ring-[#B48226]"
            required
          />
        </div>

        {/* Dates Row (Issue Date & Expiry Date) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Issue Date */}
          <div 
            onMouseEnter={() => onHoverField('issue_date')}
            onMouseLeave={() => onHoverField(null)}
            className={`p-3.5 rounded-xl border transition-all ${
              activeFieldKey === 'issue_date' 
                ? 'bg-[#FAF8F4] border-[#B48226] ring-2 ring-[#B48226]/30' 
                : 'bg-[#FAF8F4] border-[#E2DDD3] hover:border-stone-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center space-x-1.5 text-xs font-semibold text-stone-700 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-[#B48226]" />
                <span>Date of Issue</span>
              </label>
              {renderConfidenceBadge(doc.extraction.issue_date.confidence)}
            </div>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full bg-white border border-[#E2DDD3] rounded-lg px-3 py-2 text-sm text-stone-900 font-medium focus:border-[#B48226] focus:ring-1 focus:ring-[#B48226]"
            />
          </div>

          {/* Expiry Date (The Critical Deadline Field) */}
          <div 
            onMouseEnter={() => onHoverField('expiry_date')}
            onMouseLeave={() => onHoverField(null)}
            className={`p-3.5 rounded-xl border transition-all ${
              activeFieldKey === 'expiry_date' 
                ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-300' 
                : 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center space-x-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>Expiry / Renewal Date</span>
              </label>
              {renderConfidenceBadge(doc.extraction.expiry_date.confidence)}
            </div>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 text-sm text-stone-900 font-bold focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Amount and Cabinet Drawer Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Amount / Fee */}
          <div 
            onMouseEnter={() => onHoverField('amount')}
            onMouseLeave={() => onHoverField(null)}
            className={`p-3.5 rounded-xl border transition-all ${
              activeFieldKey === 'amount' 
                ? 'bg-[#FAF8F4] border-[#B48226] ring-2 ring-[#B48226]/30' 
                : 'bg-[#FAF8F4] border-[#E2DDD3] hover:border-stone-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center space-x-1.5 text-xs font-semibold text-stone-700 uppercase tracking-wider">
                <DollarSign className="w-3.5 h-3.5 text-[#B48226]" />
                <span>Fee / Amount</span>
              </label>
              {renderConfidenceBadge(doc.extraction.amount.confidence)}
            </div>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. ₹ 18,450.00"
              className="w-full bg-white border border-[#E2DDD3] rounded-lg px-3 py-2 text-sm text-stone-900 font-medium focus:border-[#B48226] focus:ring-1 focus:ring-[#B48226]"
            />
          </div>

          {/* Assigned Cabinet Drawer */}
          <div 
            onMouseEnter={() => onHoverField('drawer')}
            onMouseLeave={() => onHoverField(null)}
            className={`p-3.5 rounded-xl border transition-all ${
              activeFieldKey === 'drawer' 
                ? 'bg-[#FAF8F4] border-[#B48226] ring-2 ring-[#B48226]/30' 
                : 'bg-[#FAF8F4] border-[#E2DDD3] hover:border-stone-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center space-x-1.5 text-xs font-semibold text-stone-700 uppercase tracking-wider">
                <FolderArchive className="w-3.5 h-3.5 text-[#B48226]" />
                <span>Cabinet Drawer</span>
              </label>
              {renderConfidenceBadge(doc.extraction.drawer.confidence)}
            </div>
            <select
              value={drawer}
              onChange={(e) => setDrawer(e.target.value as DrawerType)}
              className="w-full bg-white border border-[#E2DDD3] rounded-lg px-3 py-2 text-sm text-stone-900 font-medium focus:border-[#B48226] focus:ring-1 focus:ring-[#B48226]"
            >
              <option value="Insurance">Insurance</option>
              <option value="Property">Property</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Warranties">Warranties</option>
              <option value="Identity">Identity</option>
            </select>
          </div>
        </div>

        {/* Special Notes / Memorandum */}
        <div className="p-3.5 rounded-xl bg-[#FAF8F4] border border-[#E2DDD3]">
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            Filing Memorandum &amp; Special Terms
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Add personal notes or filing instructions..."
            className="w-full bg-white border border-[#E2DDD3] rounded-lg px-3 py-2 text-sm text-stone-900 font-medium focus:border-[#B48226] focus:ring-1 focus:ring-[#B48226] resize-none"
          />
        </div>

        {/* Primary Action Button: 1-Tap Confirmation */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center space-x-3 py-3.5 px-6 rounded-xl bg-[#5A3822] hover:bg-[#482C1B] text-[#FAF7F2] font-serif font-bold text-base shadow-sm focus:ring-4 focus:ring-amber-400/30 transition-all cursor-pointer group"
          >
            <CheckCircle className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>{submitting ? 'Filing into Drawer...' : 'Confirm & File into Almirah'}</span>
            <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-center text-[11px] text-stone-500 mt-2">
            Confirming commits the expiry date to your 3D cabinet deadlines and offline vector index.
          </p>
        </div>
      </form>
    </div>
  );
};
