'use client';

import React, { useState } from 'react';
import { 
  FolderArchive, ChevronRight, ChevronDown, 
  AlertCircle, ShieldCheck, Clock, FileText 
} from 'lucide-react';
import { DrawerSummary, DocumentRecord, DeadlineUrgency } from '@/lib/types';
import Link from 'next/link';

interface AlmirahListViewProps {
  drawers: DrawerSummary[];
  onSelectDocument: (doc: DocumentRecord) => void;
}

export const AlmirahListView: React.FC<AlmirahListViewProps> = ({
  drawers,
  onSelectDocument,
}) => {
  // Expand first drawer by default
  const [expandedDrawers, setExpandedDrawers] = useState<Record<string, boolean>>({
    Insurance: true,
    Vehicle: true,
  });

  const toggleDrawer = (drawerName: string) => {
    setExpandedDrawers(prev => ({
      ...prev,
      [drawerName]: !prev[drawerName],
    }));
  };

  const getUrgencyBadge = (urgency: DeadlineUrgency, days: number | null, date: string | null) => {
    if (!days && !date) {
      return (
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Permanent Record</span>
        </span>
      );
    }

    if (urgency === 'red') {
      return (
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200 shadow-sm animate-pulse">
          <AlertCircle className="w-3.5 h-3.5 text-red-600" />
          <span>{days !== null && days < 0 ? `Overdue by ${Math.abs(days)}d` : `Urgent: ${days}d left`} ({date})</span>
        </span>
      );
    } else if (urgency === 'amber') {
      return (
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200 shadow-sm">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Approaching: {days}d left ({date})</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Safe: {days}d left ({date})</span>
        </span>
      );
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto py-2" role="region" aria-label="Accessible Almirah Cabinet List">
      <div className="flex items-center justify-between text-xs text-stone-500 pb-2 border-b border-[#E2DDD3]">
        <span className="font-medium">Organized physical drawers with deadline-encoded status</span>
        <span>5 Standard Compartments</span>
      </div>

      {drawers.map((summary) => {
        const isExpanded = !!expandedDrawers[summary.drawer];
        const isRed = summary.urgency === 'red';
        const isAmber = summary.urgency === 'amber';

        return (
          <div
            key={summary.drawer}
            className={`rounded-xl border transition-all duration-200 overflow-hidden shadow-sm ${
              isRed 
                ? 'bg-[#FFF8F8] border-red-200' 
                : isAmber
                ? 'bg-[#FFFDF5] border-amber-200'
                : 'bg-white border-[#E2DDD3]'
            }`}
          >
            {/* Drawer Header Accordion Toggle */}
            <button
              onClick={() => toggleDrawer(summary.drawer)}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-stone-50/70 transition-colors focus:ring-2 focus:ring-amber-500 cursor-pointer"
              aria-expanded={isExpanded}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border shadow-xs ${
                  isRed 
                    ? 'bg-red-100 border-red-300 text-red-700' 
                    : isAmber
                    ? 'bg-amber-100 border-amber-300 text-amber-700'
                    : 'bg-stone-100 border-stone-200 text-stone-700'
                }`}>
                  <FolderArchive className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    {summary.drawer} Drawer
                  </h3>
                  <p className="text-xs text-stone-500">
                    {summary.total_documents} verified document{summary.total_documents === 1 ? '' : 's'} filed
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {getUrgencyBadge(summary.urgency, summary.nearest_deadline_days, summary.nearest_deadline_date)}
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-stone-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-stone-400" />
                )}
              </div>
            </button>

            {/* Drawer Contents / Filed Folders */}
            {isExpanded && (
              <div className="border-t border-[#E2DDD3] bg-[#FAF8F4] p-4 sm:p-5 space-y-3">
                {summary.documents.length === 0 ? (
                  <div className="py-6 text-center text-stone-500 text-xs">
                    No documents currently filed in this drawer.
                  </div>
                ) : (
                  summary.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-lg bg-white border border-[#E2DDD3] hover:border-[#B48226] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-serif font-bold text-stone-900 text-sm group-hover:text-[#5A3822] transition-colors">
                            {doc.confirmed_document_type}
                          </span>
                          {doc.is_synthetic && (
                            <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded border border-stone-200">
                              Synthetic sample
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
                          <span><strong>Authority:</strong> {doc.confirmed_provider}</span>
                          <span><strong>ID:</strong> <code className="font-mono text-stone-800 font-semibold">{doc.confirmed_identifier}</code></span>
                          {doc.confirmed_amount && (
                            <span><strong>Fee:</strong> {doc.confirmed_amount}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 self-end sm:self-center">
                        <div className="text-right">
                          <div className="text-xs font-semibold text-stone-800">
                            {doc.confirmed_expiry_date ? `Expires: ${doc.confirmed_expiry_date}` : 'Permanent'}
                          </div>
                          {typeof doc.days_until_deadline === 'number' && (
                            <div className={`text-[11px] font-semibold ${
                              doc.urgency === 'red' ? 'text-red-600 font-bold' : doc.urgency === 'amber' ? 'text-amber-700' : 'text-stone-500'
                            }`}>
                              {doc.days_until_deadline < 0 ? `${Math.abs(doc.days_until_deadline)} days overdue` : `${doc.days_until_deadline} days remaining`}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => onSelectDocument(doc)}
                          className="px-3 py-1.5 rounded-lg bg-[#5A3822] hover:bg-[#482C1B] text-[#FAF7F2] text-xs font-medium transition-colors flex items-center space-x-1 shadow-xs cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-300" />
                          <span>View Scan</span>
                        </button>

                        <Link
                          href={`/verify?id=${doc.id}`}
                          className="px-2.5 py-1.5 rounded-lg hover:bg-stone-100 text-stone-600 hover:text-stone-900 text-xs font-medium transition-colors border border-stone-200"
                          title="Edit Extracted Fields"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
