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
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-doc-title"
    >
      <div className="bg-white border border-[#E2DDD3] rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden text-stone-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2DDD3] bg-[#FAF8F5]">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <h3 id="modal-doc-title" className="font-serif text-xl font-bold text-stone-900">
                {doc.confirmed_document_type}
              </h3>
              {doc.is_synthetic && (
                <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                  Synthetic sample
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500">
              Cabinet Drawer: <strong className="text-[#5A3822]">{doc.confirmed_drawer}</strong> · ID: <span className="font-mono text-stone-700 font-semibold">{doc.confirmed_identifier}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href={`/verify?id=${doc.id}`}
              className="text-xs px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 flex items-center space-x-1.5 transition-colors font-medium shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#B48226]" />
              <span>Verify / Edit</span>
            </Link>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Close document modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split View */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Document Scan View */}
          <div className="md:col-span-7 bg-[#EFECE6] p-4 flex items-center justify-center overflow-auto border-r border-[#E2DDD3]">
            <div className="relative shadow-md rounded-lg max-h-[680px] bg-white p-2">
              <img
                src={doc.image_url || `/synthetic/${doc.filename}`}
                alt={doc.confirmed_document_type || doc.filename}
                className="max-h-[640px] w-auto block rounded select-none"
              />
              {/* Highlight specific bounding box if provided */}
              {highlightField && doc.extraction && (doc.extraction as any)[highlightField]?.bounding_box && (
                <div
                  className="absolute border-2 border-[#B48226] bg-[#B48226]/20 ring-4 ring-amber-400/40 rounded pointer-events-none animate-pulse"
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
          <div className="md:col-span-5 p-6 bg-white overflow-y-auto space-y-4">
            {/* Urgency Status Banner */}
            <div className={`p-4 rounded-xl border ${
              isRed 
                ? 'bg-red-50 border-red-200 text-red-800' 
                : isAmber
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <div className="flex items-center space-x-2 font-bold text-sm">
                {isRed ? (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                ) : isAmber ? (
                  <Calendar className="w-4 h-4 text-amber-600" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
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
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#FAF8F4] rounded-xl border border-[#E2DDD3]">
                <span className="text-stone-500 uppercase tracking-wider text-[10px] font-semibold block mb-0.5">
                  Authority / Provider
                </span>
                <span className="text-stone-900 font-semibold text-sm">
                  {doc.confirmed_provider}
                </span>
              </div>

              <div className="p-3 bg-[#FAF8F4] rounded-xl border border-[#E2DDD3]">
                <span className="text-stone-500 uppercase tracking-wider text-[10px] font-semibold block mb-0.5">
                  Identifier / Policy No.
                </span>
                <span className="text-[#5A3822] font-mono font-bold text-sm">
                  {doc.confirmed_identifier}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#FAF8F4] rounded-xl border border-[#E2DDD3]">
                  <span className="text-stone-500 uppercase tracking-wider text-[10px] font-semibold block mb-0.5">
                    Issue Date
                  </span>
                  <span className="text-stone-800 font-medium">
                    {doc.confirmed_issue_date || 'N/A'}
                  </span>
                </div>
                <div className="p-3 bg-[#FAF8F4] rounded-xl border border-[#E2DDD3]">
                  <span className="text-stone-500 uppercase tracking-wider text-[10px] font-semibold block mb-0.5">
                    Amount / Fee
                  </span>
                  <span className="text-stone-800 font-medium">
                    {doc.confirmed_amount || 'N/A'}
                  </span>
                </div>
              </div>

              {doc.notes && (
                <div className="p-3 bg-[#FAF8F4] rounded-xl border border-[#E2DDD3]">
                  <span className="text-stone-500 uppercase tracking-wider text-[10px] font-semibold block mb-0.5">
                    Filing Memorandum
                  </span>
                  <p className="text-stone-600 leading-relaxed">
                    {doc.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="text-[11px] text-stone-500 pt-2 border-t border-[#E2DDD3]">
              <span>SHA-256 Checksum: </span>
              <code className="font-mono text-stone-700 font-semibold">{doc.checksum.substring(0, 24)}...</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
