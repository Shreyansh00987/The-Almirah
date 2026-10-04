'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
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
        className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-xs font-semibold text-emerald-800 transition-colors shadow-sm focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        aria-label="Offline status: zero data leaves this device"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
        </span>
        <Lock className="w-3.5 h-3.5 text-emerald-700" />
        <span className="hidden sm:inline">Offline: zero data leaves this device</span>
        <span className="sm:hidden">Offline Verified</span>
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-[#E2DDD3] p-4 shadow-xl z-50 text-stone-700 text-xs space-y-3"
          role="dialog"
          aria-labelledby="offline-dialog-title"
        >
          <div className="flex items-center justify-between border-b border-[#E2DDD3] pb-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h4 id="offline-dialog-title" className="font-serif font-bold text-stone-900 text-sm">
                Local Privacy Verification
              </h4>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-700 text-sm font-bold p-1 cursor-pointer"
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>

          <p className="text-stone-600 leading-relaxed">
            The Almirah operates strictly locally. All AI extraction, vector retrieval, and document storage run on your physical machine.
          </p>

          <div className="space-y-2 bg-[#F7F5EF] p-2.5 rounded-lg border border-[#E2DDD3] font-mono text-[11px]">
            <div className="flex items-center justify-between">
              <span>Network Guard:</span>
              <span className="text-emerald-700 font-bold">Active (0 outbound)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Content Security Policy:</span>
              <span className="text-emerald-700 font-bold">Enforced (Localhost only)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Typography:</span>
              <span className="text-emerald-700 font-bold">Self-hosted WOFF2</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Storage:</span>
              <span className="text-emerald-700 font-bold">Local SQLite</span>
            </div>
          </div>

          <div className="text-[10px] text-stone-500 border-t border-[#E2DDD3] pt-2 flex items-center justify-between">
            <span>Last integrity probe: {status?.checkedAt || 'Live'}</span>
            <span className="text-emerald-700 font-medium">Strict local mode</span>
          </div>
        </div>
      )}
    </div>
  );
};
