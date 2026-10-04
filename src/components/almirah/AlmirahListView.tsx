'use client';

import React, { useState } from 'react';
import { 
  FolderArchive, ChevronRight, ChevronDown, Calendar, 
  AlertCircle, ShieldCheck, Clock, FileText, ArrowRight 
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
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Permanent / No Expiry</span>
        </span>
      );
    }

    if (urgency === 'red') {
      return (
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-red-950/80 text-signal-red text-xs font-bold border border-signal-red/80 shadow-drawer-red animate-pulse">
          <AlertCircle className="w-3.5 h-3.5 text-signal-red" />
          <span>{days !== null && days < 0 ? `Overdue by ${Math.abs(days)}d` : `Urgent: ${days}d left`} ({date})</span>
        </span>
      );
    } else if (urgency === 'amber') {
      return (
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-amber-950/80 text-amber-300 text-xs font-semibold border border-amber-700/80 shadow-drawer-amber">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Approaching: {days}d left ({date})</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Safe: {days}d left ({date})</span>
        </span>
      );
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto" role="region" aria-label="Accessible Almirah Cabinet List">
      <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
        <span>Organized physical drawers with deadline-encoded status</span>
        <span>5 Standard Compartments</span>
      </div>

      {drawers.map((summary) => {
        const isExpanded = !!expandedDrawers[summary.drawer];
        const isRed = summary.urgency === 'red';
        const isAmber = summary.urgency === 'amber';

        return (
          <div
            key={summary.drawer}
            className={`rounded-lg border transition-all duration-200 overflow-hidden ${
              isRed 
                ? 'bg-slate-900/90 border-signal-red/60 shadow-drawer-red' 
                : isAmber
                ? 'bg-slate-900/90 border-amber-600/60 shadow-drawer-amber'
                : 'bg-slate-900/90 border-slate-800 shadow-md'
            }`}
          >
            {/* Drawer Header Accordion Toggle */}
            <button
              onClick={() => toggleDrawer(summary.drawer)}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-slate-800/50 transition-colors focus:ring-2 focus:ring-amber-500 cursor-pointer"
              aria-expanded={isExpanded}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-md flex items-center justify-center border ${
                  isRed 
                    ? 'bg-red-950/80 border-signal-red text-signal-red' 
                    : isAmber
                    ? 'bg-amber-950/80 border-amber-600 text-amber-400'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}>
                  <FolderArchive className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="font-serif text-lg font-bold text-paper-light">
                    {summary.drawer} Drawer
                  </h3>
                  <p className="text-xs text-slate-400">
                    {summary.total_documents} verified document{summary.total_documents === 1 ? '' : 's'} filed
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {getUrgencyBadge(summary.urgency, summary.nearest_deadline_days, summary.nearest_deadline_date)}
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </button>

            {/* Drawer Contents / Filed Folders */}
            {isExpanded && (
              <div className="border-t border-slate-800/80 bg-slate-950/60 p-4 sm:p-5 space-y-3">
                {summary.documents.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    No documents currently filed in this drawer.
                  </div>
                ) : (
                  summary.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-md bg-slate-900 border border-slate-800/80 hover:border-brass/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-serif font-semibold text-paper-light text-sm group-hover:text-brass-light transition-colors">
                            {doc.confirmed_document_type}
                          </span>
                          {doc.is_synthetic && (
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded border border-slate-700">
                              Synthetic sample
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                          <span><strong>Authority:</strong> {doc.confirmed_provider}</span>
                          <span><strong>ID:</strong> <code className="font-mono text-slate-300">{doc.confirmed_identifier}</code></span>
                          {doc.confirmed_amount && (
                            <span><strong>Fee:</strong> {doc.confirmed_amount}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 self-end sm:self-center">
                        <div className="text-right">
                          <div className="text-xs font-semibold text-slate-200">
                            {doc.confirmed_expiry_date ? `Expires: ${doc.confirmed_expiry_date}` : 'Permanent'}
                          </div>
                          {typeof doc.days_until_deadline === 'number' && (
                            <div className={`text-[11px] font-medium ${
                              doc.urgency === 'red' ? 'text-signal-red font-bold' : doc.urgency === 'amber' ? 'text-amber-400' : 'text-slate-400'
                            }`}>
                              {doc.days_until_deadline < 0 ? `${Math.abs(doc.days_until_deadline)} days overdue` : `${doc.days_until_deadline} days remaining`}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => onSelectDocument(doc)}
                          className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-paper-light border border-slate-700 hover:border-brass text-xs font-medium transition-colors flex items-center space-x-1"
                        >
                          <FileText className="w-3.5 h-3.5 text-brass" />
                          <span>View Twin</span>
                        </button>

                        <Link
                          href={`/verify?id=${doc.id}`}
                          className="px-2.5 py-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-paper-light text-xs font-medium transition-colors"
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
