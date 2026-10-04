'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { DrawerSummary, DocumentRecord } from '@/lib/types';
import { AlmirahScene } from '@/components/almirah/AlmirahScene';
import { AlmirahListView } from '@/components/almirah/AlmirahListView';
import { DocumentModal } from '@/components/common/DocumentModal';
import { 
  Box, List, Shield, Clock, AlertCircle, 
  HelpCircle, Sparkles, FolderArchive, ArrowRight 
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [drawers, setDrawers] = useState<DrawerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'3d' | 'list'>('3d');
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await api.getDrawers();
      setDrawers(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const totalDocs = drawers.reduce((acc, d) => acc + d.total_documents, 0);
  const urgentCount = drawers.filter(d => d.urgency === 'red').length;
  const amberCount = drawers.filter(d => d.urgency === 'amber').length;

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between">
      {/* Top Controls & Status Bar */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="font-serif text-3xl font-bold text-paper-light tracking-tight">
              The Almirah
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Physical cabinet metaphor where drawer glow encodes verified deadline urgency.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Switcher: 3D vs List */}
            <div className="bg-slate-900 border border-slate-700 p-1 rounded-lg flex items-center shadow-inner">
              <button
                onClick={() => setViewMode('3d')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                  viewMode === '3d'
                    ? 'bg-walnut-600 text-paper-light shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                aria-label="View 3D Almirah Cabinet"
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D Cabinet</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                  viewMode === 'list'
                    ? 'bg-walnut-600 text-paper-light shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                aria-label="View Accessible List"
              >
                <List className="w-3.5 h-3.5" />
                <span>Accessible List</span>
              </button>
            </div>

            <Link
              href="/ask"
              className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-paper-light border border-slate-700 text-xs font-medium transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-brass" />
              <span>Ask Citations</span>
            </Link>
          </div>
        </div>

        {/* Quick Deadline Ticker */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs">
          <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 flex items-center space-x-3">
            <FolderArchive className="w-4 h-4 text-brass" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Documents</span>
              <span className="text-paper-light font-bold text-sm">{totalDocs} Verified</span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-900/80 border border-signal-red/50 flex items-center space-x-3 shadow-drawer-red">
            <AlertCircle className="w-4 h-4 text-signal-red animate-pulse" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Urgent (&lt;30 Days)</span>
              <span className="text-signal-red font-bold text-sm">{urgentCount} Drawers Glowing Red</span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-900/80 border border-amber-700/50 flex items-center space-x-3 shadow-drawer-amber">
            <Clock className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Approaching (30-90d)</span>
              <span className="text-amber-300 font-bold text-sm">{amberCount} Drawers Glowing Amber</span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 flex items-center space-x-3">
            <Shield className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Privacy State</span>
              <span className="text-emerald-400 font-bold text-sm">100% Offline Disk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: 3D Scene OR Accessible List */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-2 relative flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-slate-700 border-t-brass rounded-full animate-spin"></div>
            <p className="font-serif text-slate-300 text-sm">Loading handcrafted cabinet...</p>
          </div>
        ) : viewMode === '3d' ? (
          <div className="flex-1 relative w-full min-h-[550px] sm:min-h-[620px] rounded-xl border border-slate-800 overflow-hidden shadow-2xl bg-slate-950">
            {/* 3D R3F Canvas */}
            <AlmirahScene
              drawers={drawers}
              onSelectDocument={(doc) => setSelectedDoc(doc)}
            />

            {/* In-Scene Legend Overlay */}
            <div className="absolute bottom-4 left-4 p-3 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg text-[11px] text-slate-300 space-y-2 pointer-events-none shadow-lg">
              <span className="font-serif font-bold text-paper-light block text-xs border-b border-slate-800 pb-1">
                Cabinet Glow Legend
              </span>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-signal-red shadow-drawer-red"></span>
                <span>Signal Red: Urgent action required (&lt;30 days / overdue)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-glow shadow-drawer-amber"></span>
                <span>Amber: Approaching deadline (30 to 90 days)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5A677D]"></span>
                <span>Calm Slate: Safe (&gt;90 days or permanent document)</span>
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                Click any drawer to slide open. Click a folder inside to view.
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 py-4">
            <AlmirahListView
              drawers={drawers}
              onSelectDocument={(doc) => setSelectedDoc(doc)}
            />
          </div>
        )}
      </main>

      {/* Document Focus Modal */}
      <DocumentModal
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
      />
    </div>
  );
}
