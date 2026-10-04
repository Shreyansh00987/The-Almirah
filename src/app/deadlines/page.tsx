'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { DocumentRecord, DrawerType, DeadlineUrgency } from '@/lib/types';
import { DocumentModal } from '@/components/common/DocumentModal';
import { 
  Clock, AlertCircle, ShieldCheck, Search, Filter, 
  Calendar, FileText, ArrowRight, ExternalLink 
} from 'lucide-react';
import Link from 'next/link';

export default function DeadlinesPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerFilter, setDrawerFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const docs = await api.getDocuments(true);
      // Sort with lowest days remaining first (urgent first)
      docs.sort((a, b) => {
        const aDays = a.days_until_deadline ?? 99999;
        const bDays = b.days_until_deadline ?? 99999;
        return aDays - bDays;
      });
      setDocuments(docs);
      setLoading(false);
    }
    load();
  }, []);

  const filteredDocs = documents.filter((doc) => {
    // Drawer filter
    if (drawerFilter !== 'all' && doc.confirmed_drawer !== drawerFilter) {
      return false;
    }
    // Urgency filter
    if (urgencyFilter !== 'all' && doc.urgency !== urgencyFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (doc.confirmed_document_type || '').toLowerCase().includes(q);
      const matchProvider = (doc.confirmed_provider || '').toLowerCase().includes(q);
      const matchId = (doc.confirmed_identifier || '').toLowerCase().includes(q);
      if (!matchTitle && !matchProvider && !matchId) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="font-serif text-3xl font-bold text-paper-light">
            Confirmed Deadlines & Renewals
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Accessible schedule of all confirmed documents filed in your Almirah, ordered by impending action date.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-paper-light border border-slate-700 text-xs font-medium transition-colors"
          >
            Open 3D Almirah
          </Link>
          <Link
            href="/ask"
            className="px-3.5 py-2 rounded-lg bg-walnut-600 hover:bg-walnut-500 text-paper-light border border-walnut-400 text-xs font-semibold shadow transition-colors"
          >
            Ask Questions
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, provider, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-md pl-9 pr-3 py-2 text-xs text-paper-light focus:border-brass focus:ring-1 focus:ring-brass"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Drawer Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Drawer:</span>
            <select
              value={drawerFilter}
              onChange={(e) => setDrawerFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-paper-light focus:border-brass"
            >
              <option value="all">All Drawers</option>
              <option value="Insurance">Insurance</option>
              <option value="Property">Property</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Warranties">Warranties</option>
              <option value="Identity">Identity</option>
            </select>
          </div>

          {/* Urgency Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Urgency:</span>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-paper-light focus:border-brass"
            >
              <option value="all">All Statuses</option>
              <option value="red">Urgent (&lt;30 days)</option>
              <option value="amber">Approaching (30-90 days)</option>
              <option value="calm">Safe / Permanent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Deadlines Table / Cards */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-slate-700 border-t-brass rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400">Loading deadline registry...</span>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 rounded-lg border border-slate-800 space-y-2">
          <Clock className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="font-serif text-lg text-slate-300">No matching deadlines found</h3>
          <p className="text-xs text-slate-500">Try adjusting your search criteria or drawer filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocs.map((doc) => {
            const isRed = doc.urgency === 'red';
            const isAmber = doc.urgency === 'amber';

            return (
              <div
                key={doc.id}
                className={`p-4 rounded-lg border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isRed
                    ? 'bg-slate-900 border-signal-red/60 shadow-drawer-red'
                    : isAmber
                    ? 'bg-slate-900 border-amber-600/50 shadow-drawer-amber'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                {/* Left Document Identity */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-serif font-bold text-paper-light text-base hover:text-brass-light cursor-pointer" onClick={() => setSelectedDoc(doc)}>
                      {doc.confirmed_document_type}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-brass border border-slate-700">
                      {doc.confirmed_drawer}
                    </span>
                    {doc.is_synthetic && (
                      <span className="text-[10px] bg-slate-950 text-slate-400 px-1.5 py-0.2 rounded border border-slate-800">
                        Synthetic sample
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span><strong>Provider:</strong> {doc.confirmed_provider}</span>
                    <span><strong>ID:</strong> <code className="font-mono text-slate-300">{doc.confirmed_identifier}</code></span>
                    {doc.confirmed_amount && (
                      <span><strong>Amount:</strong> {doc.confirmed_amount}</span>
                    )}
                  </div>
                </div>

                {/* Center / Right Deadline Countdown */}
                <div className="flex items-center space-x-4 self-end md:self-center">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-slate-200">
                      {doc.confirmed_expiry_date ? `Deadline: ${doc.confirmed_expiry_date}` : 'Permanent Record'}
                    </div>
                    {typeof doc.days_until_deadline === 'number' && (
                      <div className={`text-xs font-bold ${
                        isRed ? 'text-signal-red' : isAmber ? 'text-amber-400' : 'text-slate-400'
                      }`}>
                        {doc.days_until_deadline < 0 
                          ? `Overdue by ${Math.abs(doc.days_until_deadline)} days!` 
                          : `${doc.days_until_deadline} days remaining`}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-paper-light border border-slate-700 text-xs font-medium transition-colors flex items-center space-x-1"
                    >
                      <FileText className="w-3.5 h-3.5 text-brass" />
                      <span>Inspect</span>
                    </button>

                    <Link
                      href={`/verify?id=${doc.id}`}
                      className="px-2.5 py-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-medium transition-colors"
                      title="Edit Facts"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Focus Document Modal */}
      <DocumentModal
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
      />
    </div>
  );
}
