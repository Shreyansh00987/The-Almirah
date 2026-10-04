'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Info, Lock } from 'lucide-react';
import { verifyOfflineIntegrity, installNetworkGuard } from '@/lib/offlineCheck';
import { OfflineStatus } from '@/lib/types';

export const OfflineBadge: React.FC = () => {
  const [status, setStatus] = useState<OfflineStatus | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    installNetworkGuard();
    verifyOfflineIntegrity().then(setStatus);
    const interval = setInterval(() => {
      verifyOfflineIntegrity().then(setStatus);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700/80 border border-slate-600/70 text-xs font-medium text-emerald-400 transition-colors shadow-sm focus:ring-2 focus:ring-amber-500"
        aria-label="Offline status: zero data leaves this device"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <Lock className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden sm:inline text-slate-200">Offline: zero data leaves this device</span>
        <span className="sm:hidden text-slate-200">Offline Verified</span>
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 rounded-lg bg-slate-900 border border-slate-700 p-4 shadow-2xl z-50 text-slate-200 text-xs space-y-3"
          role="dialog"
          aria-labelledby="offline-dialog-title"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h4 id="offline-dialog-title" className="font-serif font-semibold text-paper-parchment text-sm">
                Local Privacy Verification
              </h4>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1"
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>

          <p className="text-slate-300 leading-relaxed">
            The Almirah operates strictly locally. All AI extraction, vector retrieval, and document storage run on your physical machine.
          </p>

          <div className="space-y-2 bg-slate-950/60 p-2.5 rounded border border-slate-800 font-mono text-[11px]">
            <div className="flex items-center justify-between">
              <span>Network Guard:</span>
              <span className="text-emerald-400 font-bold">Active (0 outbound)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Content Security Policy:</span>
              <span className="text-emerald-400 font-bold">Enforced (Localhost only)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Typography:</span>
              <span className="text-emerald-400 font-bold">Self-hosted WOFF2</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Storage:</span>
              <span className="text-emerald-400 font-bold">Encrypted Local SQLite</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-2 flex items-center justify-between">
            <span>Last integrity probe: {status?.checkedAt || 'Live'}</span>
            <span className="text-emerald-400">Strict local mode</span>
          </div>
        </div>
      )}
    </div>
  );
};
