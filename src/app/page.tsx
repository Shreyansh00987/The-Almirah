'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { DrawerSummary, DocumentRecord } from '@/lib/types';
import { AlmirahScene } from '@/components/almirah/AlmirahScene';
import { AlmirahListView } from '@/components/almirah/AlmirahListView';
import { DocumentModal } from '@/components/common/DocumentModal';
import { BuiltForDadModal } from '@/components/common/BuiltForDadModal';
import { 
  Box, List, Shield, Clock, AlertCircle, 
  HelpCircle, FolderArchive, ArrowRight, Heart,
  Sparkles, FileText, ChevronRight, X
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [drawers, setDrawers] = useState<DrawerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'3d' | 'list'>('3d');
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [activeDrawerIndex, setActiveDrawerIndex] = useState<number | null>(null);
  const [isStoryOpen, setIsStoryOpen] = useState(false);

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

  const activeDrawer = activeDrawerIndex !== null && drawers[activeDrawerIndex] 
    ? drawers[activeDrawerIndex] 
    : null;

  const romanNumerals = ['I', 'II', 'III', 'IV', 'V'];

  return (
    <div className="flex-1 flex flex-col justify-between w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
      {/* Top Controls & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2DDD3]">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              The Almirah
            </h1>
            <button
              onClick={() => setIsStoryOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-semibold transition-all shadow-xs cursor-pointer"
              title="Read the Hackathon Story: Built for Dad"
            >
              <Heart className="w-3.5 h-3.5 text-amber-600 fill-amber-500/30" />
              <span>Built for Dad</span>
            </button>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Handcrafted 3D cabinet metaphor where drawer glow encodes verified deadline urgency. 100% local open AI.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Switcher: 3D vs List */}
          <div className="bg-white border border-[#E2DDD3] p-1 rounded-lg flex items-center shadow-xs">
            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === '3d'
                  ? 'bg-[#5A3822] text-[#FAF7F2] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              aria-label="View 3D Almirah Cabinet"
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Cabinet</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#5A3822] text-[#FAF7F2] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              aria-label="View Accessible List"
            >
              <List className="w-3.5 h-3.5" />
              <span>Accessible List</span>
            </button>
          </div>

          <Link
            href="/ask"
            className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-stone-50 text-stone-800 border border-[#E2DDD3] text-xs font-medium transition-colors shadow-xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#B48226]" />
            <span>Ask Citations</span>
          </Link>
        </div>
      </div>

      {/* Main Expansive Viewport */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 min-h-[500px]">
          <div className="w-12 h-12 border-4 border-stone-200 border-t-[#5A3822] rounded-full animate-spin"></div>
          <p className="font-serif text-stone-700 text-sm">Preparing sunlit handcrafted almirah...</p>
        </div>
      ) : viewMode === '3d' ? (
        <div className="flex-1 w-full grid grid-cols-1 xl:grid-cols-12 gap-5 pt-3 pb-2 min-h-[calc(100vh-170px)]">
          
          {/* Left Column: Expansive Sunlit 3D Studio Stage (xl:col-span-8) */}
          <div className="xl:col-span-8 flex flex-col rounded-2xl border border-[#E2DDD3] bg-[#F5F2EB] shadow-md overflow-hidden relative min-h-[580px] lg:min-h-[660px]">
            {/* Top Stage Bar */}
            <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
              <div className="px-3 py-1 rounded-full bg-white/80 backdrop-blur border border-[#E2DDD3] text-[11px] font-medium text-stone-700 shadow-xs pointer-events-auto flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Sunlit Study · Interactive 3D Cabinet</span>
              </div>

              {/* Drawer Jumper Quick-Pills */}
              <div className="hidden md:flex items-center space-x-1.5 bg-white/85 backdrop-blur p-1 rounded-lg border border-[#E2DDD3] shadow-xs pointer-events-auto">
                {drawers.map((d, i) => {
                  const isCur = activeDrawerIndex === i;
                  return (
                    <button
                      key={d.drawer}
                      onClick={() => setActiveDrawerIndex(isCur ? null : i)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                        isCur 
                          ? 'bg-[#5A3822] text-[#FAF7F2] shadow-xs' 
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${
                        d.urgency === 'red' ? 'bg-red-500' : d.urgency === 'amber' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      <span>{romanNumerals[i]}. {d.drawer}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3D Canvas */}
            <div className="flex-1 w-full h-full min-h-[500px]">
              <AlmirahScene
                drawers={drawers}
                activeDrawerIndex={activeDrawerIndex}
                onDrawerChange={(idx) => setActiveDrawerIndex(idx)}
                onSelectDocument={(doc) => setSelectedDoc(doc)}
              />
            </div>

            {/* Bottom Stage Legend & Hint */}
            <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              <div className="p-2.5 bg-white/90 backdrop-blur border border-[#E2DDD3] rounded-xl text-[11px] text-stone-700 space-y-1.5 pointer-events-auto shadow-sm">
                <span className="font-serif font-bold text-stone-900 block text-xs border-b border-stone-200 pb-1">
                  Cabinet Glow Urgency Key
                </span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-drawer-red"></span>
                    <span className="font-medium text-red-700">Urgent (&lt;30d)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-drawer-amber"></span>
                    <span className="font-medium text-amber-800">Approaching (30–90d)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span className="font-medium text-emerald-800">Safe / Permanent</span>
                  </div>
                </div>
              </div>

              <div className="px-3 py-1.5 bg-white/85 backdrop-blur border border-[#E2DDD3] rounded-lg text-[11px] text-stone-600 pointer-events-auto shadow-xs">
                💡 Tip: Click any drawer to pull open · Esc to close
              </div>
            </div>
          </div>

          {/* Right Column: Tactile Drawer & Document Inspector (xl:col-span-4) */}
          <div className="xl:col-span-4 flex flex-col gap-3">
            
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-white border border-[#E2DDD3] shadow-xs flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-[#5A3822]">
                  <FolderArchive className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px] uppercase font-semibold">Total Documents</span>
                  <span className="text-stone-900 font-bold text-sm">{totalDocs} Verified</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FFF8F8] border border-red-200 shadow-xs flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-red-700 block text-[10px] uppercase font-semibold">Urgent (&lt;30d)</span>
                  <span className="text-red-700 font-bold text-sm">{urgentCount} Drawers Red</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FFFDF5] border border-amber-200 shadow-xs flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-amber-800 block text-[10px] uppercase font-semibold">Approaching (30-90d)</span>
                  <span className="text-amber-800 font-bold text-sm">{amberCount} Drawers Amber</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F0FDF4] border border-emerald-200 shadow-xs flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-emerald-700 block text-[10px] uppercase font-semibold">Privacy State</span>
                  <span className="text-emerald-800 font-bold text-sm">100% Offline Disk</span>
                </div>
              </div>
            </div>

            {/* Main Interactive Drawer Panel */}
            <div className="flex-1 bg-white border border-[#E2DDD3] rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between overflow-hidden">
              {activeDrawer ? (
                <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-1">
                  {/* Drawer Header */}
                  <div className="flex items-start justify-between border-b border-stone-200 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-[#B48226] uppercase">
                          Drawer {romanNumerals[activeDrawerIndex ?? 0]}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          activeDrawer.urgency === 'red'
                            ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                            : activeDrawer.urgency === 'amber'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {activeDrawer.urgency === 'red' ? '⚠️ Urgent Action Required' : activeDrawer.urgency === 'amber' ? '⏳ Impending Deadline' : '✓ Safe Status'}
                        </span>
                      </div>
                      <h2 className="font-serif text-xl font-bold text-stone-900 mt-1">
                        {activeDrawer.drawer} Documents
                      </h2>
                    </div>

                    <button
                      onClick={() => setActiveDrawerIndex(null)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                      title="Close drawer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Deadline Warning Banner */}
                  <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                    activeDrawer.urgency === 'red'
                      ? 'bg-red-50 border-red-200 text-red-800'
                      : activeDrawer.urgency === 'amber'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-stone-50 border-stone-200 text-stone-700'
                  }`}>
                    <div className="flex items-center space-x-2 font-medium">
                      {activeDrawer.urgency === 'red' ? (
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      ) : activeDrawer.urgency === 'amber' ? (
                        <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      ) : (
                        <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      )}
                      <span>
                        {activeDrawer.nearest_deadline_date 
                          ? `Nearest deadline: ${activeDrawer.nearest_deadline_date}`
                          : 'Permanent records (no expiration)'}
                      </span>
                    </div>

                    {activeDrawer.nearest_deadline_days !== null && (
                      <span className="font-bold">
                        {activeDrawer.nearest_deadline_days < 0 
                          ? `${Math.abs(activeDrawer.nearest_deadline_days)}d overdue` 
                          : `${activeDrawer.nearest_deadline_days}d left`}
                      </span>
                    )}
                  </div>

                  {/* Documents List inside this Drawer */}
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                      Filed Documents ({activeDrawer.documents.length})
                    </span>

                    {activeDrawer.documents.length === 0 ? (
                      <div className="py-8 text-center text-stone-400 text-xs italic">
                        This drawer has no filed documents yet.
                      </div>
                    ) : (
                      activeDrawer.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-3 rounded-xl border border-stone-200 bg-[#FAF8F4] hover:bg-white hover:border-[#B48226] transition-all shadow-xs flex flex-col space-y-2 group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-serif font-bold text-stone-900 text-sm group-hover:text-[#5A3822] transition-colors">
                                {doc.confirmed_document_type}
                              </div>
                              <div className="text-[11px] text-stone-500 mt-0.5">
                                {doc.confirmed_provider} · <span className="font-mono text-stone-700 font-medium">{doc.confirmed_identifier}</span>
                              </div>
                            </div>

                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                              doc.urgency === 'red'
                                ? 'bg-red-100 text-red-700 border-red-300'
                                : doc.urgency === 'amber'
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            }`}>
                              {doc.confirmed_expiry_date ? `Exp: ${doc.confirmed_expiry_date}` : 'Permanent'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-stone-200/70 text-xs">
                            <span className="text-stone-500 text-[11px]">
                              {doc.confirmed_amount ? `Fee: ${doc.confirmed_amount}` : 'Verified Twin'}
                            </span>

                            <button
                              onClick={() => setSelectedDoc(doc)}
                              className="px-2.5 py-1 rounded-md bg-[#5A3822] hover:bg-[#482C1B] text-[#FAF7F2] text-xs font-medium flex items-center space-x-1 shadow-xs transition-colors cursor-pointer"
                            >
                              <FileText className="w-3 h-3 text-amber-300" />
                              <span>View Scan</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                /* Overview State when no specific drawer is pulled */
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="border-b border-stone-200 pb-3">
                      <span className="text-xs font-mono font-bold text-[#B48226] uppercase">
                        Cabinet Navigation
                      </span>
                      <h2 className="font-serif text-xl font-bold text-stone-900 mt-0.5">
                        Select a Drawer to Inspect
                      </h2>
                      <p className="text-xs text-stone-500 mt-1">
                        Click on any drawer below or tap the 3D almirah to slide it forward.
                      </p>
                    </div>

                    {/* Drawers Quick List */}
                    <div className="space-y-2">
                      {drawers.map((d, idx) => (
                        <button
                          key={d.drawer}
                          onClick={() => setActiveDrawerIndex(idx)}
                          className="w-full p-3 rounded-xl border border-stone-200 bg-[#FAF8F4] hover:bg-white hover:border-[#5A3822] transition-all flex items-center justify-between text-left shadow-xs group cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-serif font-bold text-xs ${
                              d.urgency === 'red' ? 'bg-red-100 text-red-700' : d.urgency === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-700'
                            }`}>
                              {romanNumerals[idx]}
                            </div>
                            <div>
                              <span className="font-serif font-bold text-stone-900 text-sm group-hover:text-[#5A3822] transition-colors block">
                                {d.drawer}
                              </span>
                              <span className="text-[11px] text-stone-500">
                                {d.total_documents} filed document{d.total_documents === 1 ? '' : 's'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              d.urgency === 'red' ? 'bg-red-50 text-red-700 border-red-200' : d.urgency === 'amber' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}>
                              {d.nearest_deadline_days !== null ? `${d.nearest_deadline_days}d left` : 'Safe'}
                            </span>
                            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#5A3822] transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Built for Dad Story Preview Card */}
                  <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs space-y-2">
                    <div className="flex items-center space-x-2 text-amber-900 font-bold font-serif">
                      <Heart className="w-4 h-4 text-amber-600 fill-amber-500/40" />
                      <span>Why Built for Dad?</span>
                    </div>
                    <p className="text-amber-950/80 text-[11px] leading-relaxed">
                      "For 35 years, Dad kept every title deed and insurance policy inside a Godrej wardrobe. He refused cloud storage. The Almirah honors his trust with 100% offline open AI."
                    </p>
                    <button
                      onClick={() => setIsStoryOpen(true)}
                      className="text-amber-800 font-semibold underline hover:text-amber-950 text-[11px] cursor-pointer"
                    >
                      Read full story &amp; technical architecture &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      ) : (
        /* Accessible 100% Fallback List View */
        <div className="flex-1 py-4">
          <AlmirahListView
            drawers={drawers}
            onSelectDocument={(doc) => setSelectedDoc(doc)}
          />
        </div>
      )}

      {/* Document Focus Modal */}
      <DocumentModal
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
      />

      {/* Built For Dad Story Modal */}
      <BuiltForDadModal
        isOpen={isStoryOpen}
        onClose={() => setIsStoryOpen(false)}
      />
    </div>
  );
}
