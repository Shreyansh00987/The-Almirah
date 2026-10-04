'use client';

import React from 'react';
import { X, ExternalLink, Calendar, Hash, Building2, FolderArchive, ShieldCheck, AlertCircle } from 'lucide-react';
import { DocumentRecord } from '@/lib/types';
import Link from 'next/link';

interface DocumentModalProps {
  document: DocumentRecord | null;
  onClose: () => void;
  highlightField?: string | null;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  document: doc,
  onClose,
  highlightField,
}) => {
  if (!doc) return null;

  const isRed = doc.urgency === 'red';
  const isAmber = doc.urgency === 'amber';

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-doc-title"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <h3 id="modal-doc-title" className="font-serif text-xl font-bold text-paper-light">
                {doc.confirmed_document_type}
              </h3>
              {doc.is_synthetic && (
                <span className="text-[10px] bg-amber-950/80 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-700">
                  Synthetic sample
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Cabinet Drawer: <strong className="text-brass">{doc.confirmed_drawer}</strong> · ID: <span className="font-mono text-slate-300">{doc.confirmed_identifier}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href={`/verify?id=${doc.id}`}
              className="text-xs px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-paper-light border border-slate-600 flex items-center space-x-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-brass" />
              <span>Verify / Edit</span>
            </Link>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:ring-2 focus:ring-amber-500"
              aria-label="Close document modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split View */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Document Scan View */}
          <div className="md:col-span-7 bg-slate-950 p-4 flex items-center justify-center overflow-auto border-r border-slate-800">
            <div className="relative shadow-2xl rounded max-h-[680px]">
              <img
                src={doc.image_url || `/synthetic/${doc.filename}`}
                alt={doc.confirmed_document_type || doc.filename}
                className="max-h-[660px] w-auto block rounded select-none shadow"
              />
              {/* Highlight specific bounding box if provided */}
              {highlightField && doc.extraction && (doc.extraction as any)[highlightField]?.bounding_box && (
                <div
                  className="absolute border-2 border-brass bg-brass/30 ring-4 ring-amber-400/50 rounded pointer-events-none animate-pulse"
                  style={{
                    top: `${((doc.extraction as any)[highlightField].bounding_box.ymin / 1000) * 100}%`,
                    left: `${((doc.extraction as any)[highlightField].bounding_box.xmin / 1000) * 100}%`,
                    width: `${(((doc.extraction as any)[highlightField].bounding_box.xmax - (doc.extraction as any)[highlightField].bounding_box.xmin) / 1000) * 100}%`,
                    height: `${(((doc.extraction as any)[highlightField].bounding_box.ymax - (doc.extraction as any)[highlightField].bounding_box.ymin) / 1000) * 100}%`,
                  }}
                />
              )}
            </div>
          </div>

          {/* Verified Metadata Panel */}
          <div className="md:col-span-5 p-6 bg-slate-900 overflow-y-auto space-y-5">
            {/* Urgency Status Banner */}
            <div className={`p-4 rounded-lg border ${
              isRed 
                ? 'bg-red-950/60 border-signal-red text-red-200' 
                : isAmber
                ? 'bg-amber-950/60 border-amber-600 text-amber-200'
                : 'bg-slate-800/80 border-slate-700 text-slate-300'
            }`}>
              <div className="flex items-center space-x-2 font-bold text-sm">
                {isRed ? (
                  <AlertCircle className="w-4 h-4 text-signal-red" />
                ) : isAmber ? (
                  <Calendar className="w-4 h-4 text-amber-400" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                )}
                <span>
                  {doc.confirmed_expiry_date 
                    ? `Deadline: ${doc.confirmed_expiry_date}` 
                    : 'Permanent Record'}
                </span>
              </div>
              {typeof doc.days_until_deadline === 'number' && (
                <p className="text-xs mt-1 font-medium">
                  {doc.days_until_deadline < 0 
                    ? `Overdue by ${Math.abs(doc.days_until_deadline)} days!` 
                    : `${doc.days_until_deadline} days remaining until required action.`}
                </p>
              )}
            </div>

            {/* Fact List */}
            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-950/60 rounded border border-slate-800">
                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold block mb-0.5">
                  Authority / Provider
                </span>
                <span className="text-paper-light font-medium text-sm">
                  {doc.confirmed_provider}
                </span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded border border-slate-800">
                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold block mb-0.5">
                  Identifier / Policy No.
                </span>
                <span className="text-brass font-mono font-bold text-sm">
                  {doc.confirmed_identifier}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950/60 rounded border border-slate-800">
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold block mb-0.5">
                    Issue Date
                  </span>
                  <span className="text-slate-200 font-medium">
                    {doc.confirmed_issue_date || 'N/A'}
                  </span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded border border-slate-800">
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold block mb-0.5">
                    Amount / Fee
                  </span>
                  <span className="text-slate-200 font-medium">
                    {doc.confirmed_amount || 'N/A'}
                  </span>
                </div>
              </div>

              {doc.notes && (
                <div className="p-3 bg-slate-950/60 rounded border border-slate-800">
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold block mb-0.5">
                    Filing Memorandum
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {doc.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
              <span>SHA-256: </span>
              <code className="font-mono text-slate-400">{doc.checksum}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
