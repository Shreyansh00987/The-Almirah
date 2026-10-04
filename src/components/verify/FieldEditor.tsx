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
        <span className="inline-flex items-center text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
          {pct}% Confident
        </span>
      );
    } else if (pct >= 85) {
      return (
        <span className="inline-flex items-center text-[11px] font-semibold text-amber-300 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded">
          {pct}% Moderate
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center text-[11px] font-bold text-signal-red bg-red-950/70 border border-signal-red px-2 py-0.5 rounded animate-pulse">
          <AlertCircle className="w-3 h-3 mr-1" />
          {pct}% Verify OCR
        </span>
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg border border-slate-800 p-6 shadow-xl overflow-y-auto">
      <div className="border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-paper-light">
            Verify Extracted Facts
          </h2>
          {doc.is_confirmed ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-emerald-900/60 border border-emerald-700 text-xs font-semibold text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Confirmed in Almirah</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-amber-950/80 border border-amber-700 text-xs font-semibold text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Pending Human Confirmation</span>
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Open-source models read the document scan. Confirm or correct the fields below. Nothing becomes an active deadline until you tap confirm.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 flex-1">
        {/* Document Type Field */}
        <div 
          onMouseEnter={() => onHoverField('document_type')}
          onMouseLeave={() => onHoverField(null)}
          className={`p-3.5 rounded-lg border transition-all ${
            activeFieldKey === 'document_type' 
              ? 'bg-slate-800 border-brass ring-1 ring-brass' 
              : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-brass" />
              <span>Document Type</span>
            </label>
            {renderConfidenceBadge(doc.extraction.document_type.confidence)}
          </div>
          <input
            type="text"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-paper-light font-medium focus:border-brass focus:ring-1 focus:ring-brass"
            required
          />
        </div>

        {/* Issuing Authority / Provider */}
        <div 
          onMouseEnter={() => onHoverField('provider')}
          onMouseLeave={() => onHoverField(null)}
          className={`p-3.5 rounded-lg border transition-all ${
            activeFieldKey === 'provider' 
              ? 'bg-slate-800 border-brass ring-1 ring-brass' 
              : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-brass" />
              <span>Issuing Authority / Provider</span>
            </label>
            {renderConfidenceBadge(doc.extraction.provider.confidence)}
          </div>
          <input
            type="text"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-paper-light font-medium focus:border-brass focus:ring-1 focus:ring-brass"
            required
          />
        </div>

        {/* Identifier / Policy / Certificate Number */}
        <div 
          onMouseEnter={() => onHoverField('identifier')}
          onMouseLeave={() => onHoverField(null)}
          className={`p-3.5 rounded-lg border transition-all ${
            activeFieldKey === 'identifier' 
              ? 'bg-slate-800 border-brass ring-1 ring-brass' 
              : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <Hash className="w-3.5 h-3.5 text-brass" />
              <span>Policy / Registration / ID Number</span>
            </label>
            {renderConfidenceBadge(doc.extraction.identifier.confidence)}
          </div>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-paper-light font-mono font-medium focus:border-brass focus:ring-1 focus:ring-brass"
            required
          />
        </div>

        {/* Dates Row (Issue Date & Expiry Date) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Issue Date */}
          <div 
            onMouseEnter={() => onHoverField('issue_date')}
            onMouseLeave={() => onHoverField(null)}
            className={`p-3.5 rounded-lg border transition-all ${
              activeFieldKey === 'issue_date' 
                ? 'bg-slate-800 border-brass ring-1 ring-brass' 
                : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-brass" />
                <span>Date of Issue</span>
              </label>
              {renderConfidenceBadge(doc.extraction.issue_date.confidence)}
            </div>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-paper-light font-medium focus:border-brass focus:ring-1 focus:ring-brass"
            />
          </div>

          {/* Expiry Date (The Critical Deadline Field) */}
          <div 
            onMouseEnter={() => onHoverField('expiry_date')}
            onMouseLeave={() => onHoverField(null)}
            className={`p-3.5 rounded-lg border transition-all ${
              activeFieldKey === 'expiry_date' 
                ? 'bg-slate-800 border-brass ring-1 ring-brass' 
                : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center space-x-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Expiry / Renewal Date</span>
              </label>
              {renderConfidenceBadge(doc.extraction.expiry_date.confidence)}
            </div>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full bg-slate-900 border border-amber-600/70 rounded px-3 py-2 text-sm text-paper-light font-medium focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>
        </div>

        {/* Amount and Cabinet Drawer Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Amount / Fee */}
          <div 
            onMouseEnter={() => onHoverField('amount')}
            onMouseLeave={() => onHoverField(null)}
            className={`p-3.5 rounded-lg border transition-all ${
              activeFieldKey === 'amount' 
                ? 'bg-slate-800 border-brass ring-1 ring-brass' 
                : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <DollarSign className="w-3.5 h-3.5 text-brass" />
                <span>Fee / Amount</span>
              </label>
              {renderConfidenceBadge(doc.extraction.amount.confidence)}
            </div>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. ₹ 18,450.00"
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-paper-light font-medium focus:border-brass focus:ring-1 focus:ring-brass"
            />
          </div>

          {/* Assigned Cabinet Drawer */}
          <div 
            onMouseEnter={() => onHoverField('drawer')}
            onMouseLeave={() => onHoverField(null)}
            className={`p-3.5 rounded-lg border transition-all ${
              activeFieldKey === 'drawer' 
                ? 'bg-slate-800 border-brass ring-1 ring-brass' 
                : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <FolderArchive className="w-3.5 h-3.5 text-brass" />
                <span>Cabinet Drawer</span>
              </label>
              {renderConfidenceBadge(doc.extraction.drawer.confidence)}
            </div>
            <select
              value={drawer}
              onChange={(e) => setDrawer(e.target.value as DrawerType)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-paper-light font-medium focus:border-brass focus:ring-1 focus:ring-brass"
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
        <div className="p-3.5 rounded-lg bg-slate-950/50 border border-slate-800">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Filing Memorandum & Special Terms
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Add personal notes or filing instructions..."
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-paper-light font-medium focus:border-brass focus:ring-1 focus:ring-brass resize-none"
          />
        </div>

        {/* Primary Action Button: 1-Tap Confirmation */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center space-x-3 py-3.5 px-6 rounded-lg bg-walnut-600 hover:bg-walnut-500 text-paper-light font-serif font-bold text-base shadow-xl border border-walnut-400 focus:ring-4 focus:ring-amber-500/50 transition-all cursor-pointer group"
          >
            <CheckCircle className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>{submitting ? 'Filing into Drawer...' : 'Confirm & File into Almirah'}</span>
            <ArrowRight className="w-4 h-4 text-brass-light group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-center text-[11px] text-slate-400 mt-2">
            Confirming commits the expiry date to your 3D cabinet deadlines and offline vector index.
          </p>
        </div>
      </form>
    </div>
  );
};
