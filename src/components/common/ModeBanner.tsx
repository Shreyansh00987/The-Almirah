'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { AlertCircle, RefreshCw, Cpu, Database } from 'lucide-react';

export const ModeBanner: React.FC = () => {
  const [isDemo, setIsDemo] = useState(true);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkLiveStatus = async () => {
    setChecking(true);
    const health = await api.checkBackendHealth();
    setBackendAvailable(health.live);
    if (!health.live) {
      api.setDemoMode(true);
      setIsDemo(true);
    } else {
      setIsDemo(api.getIsDemoMode());
    }
    setChecking(false);
  };

  useEffect(() => {
    checkLiveStatus();
  }, []);

  const toggleMode = (newDemo: boolean) => {
    api.setDemoMode(newDemo);
    setIsDemo(newDemo);
    window.location.reload();
  };

  return (
    <div className={`w-full text-xs px-4 py-2 flex flex-wrap items-center justify-between transition-colors border-b ${
      isDemo 
        ? 'bg-amber-950/40 border-amber-800/60 text-amber-200' 
        : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
    }`}>
      <div className="flex items-center space-x-2.5">
        <span className="font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-black/40 border border-current">
          {isDemo ? 'Demo Mode' : 'Live Mode'}
        </span>
        <span className="font-medium">
          {isDemo 
            ? 'Demo mode: precomputed results on synthetic documents' 
            : 'Live mode: connected to local Ollama inference server (localhost:11434)'}
        </span>
      </div>

      <div className="flex items-center space-x-3 mt-1 sm:mt-0">
        {backendAvailable ? (
          <button
            onClick={() => toggleMode(!isDemo)}
            className="underline hover:text-white transition-colors cursor-pointer flex items-center space-x-1"
          >
            <Cpu className="w-3.5 h-3.5 inline mr-1" />
            <span>Switch to {isDemo ? 'Live Ollama Mode' : 'Demo Mode'}</span>
          </button>
        ) : (
          <span className="text-slate-400 flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mr-1.5"></span>
            Ollama offline (Live mode available when started)
          </span>
        )}

        <button
          onClick={checkLiveStatus}
          disabled={checking}
          title="Recheck local server"
          className="p-1 hover:text-white transition-colors"
          aria-label="Refresh backend status"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};
