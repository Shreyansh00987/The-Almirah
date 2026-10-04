'use client';

import React from 'react';
import { X, Heart, Lock, Cpu, CheckCircle2, Quote } from 'lucide-react';

interface BuiltForDadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BuiltForDadModal: React.FC<BuiltForDadModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dad-modal-title"
    >
      <div className="bg-[#FAF8F5] border border-[#E2DDD3] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-stone-800">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E2DDD3] bg-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-xs">
              <Heart className="w-5 h-5 text-amber-600 fill-amber-500/30" />
            </div>
            <div>
              <div className="text-[11px] font-sans uppercase tracking-wider text-[#B48226] font-bold">
                Weekend Hackathon · Built for a Friend
              </div>
              <h3 id="dad-modal-title" className="font-serif text-2xl font-bold text-stone-900">
                Built for Dad (Rajesh Sharma)
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm leading-relaxed">
          {/* The Story */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-bold text-stone-900 flex items-center space-x-2">
              <span>The Problem: 35 Years of Paper in a Wooden Almirah</span>
            </h4>
            <p className="text-stone-600">
              For as long as I can remember, my father has kept all our family paperwork in one heavy Godrej almirah in his study. 
              The private car package policy, the family mediclaim schedule, the water purifier warranty slip, the municipal property tax receipt.
            </p>
            <p className="text-stone-600">
              Every year, a deadline would slip past—a car insurance renewal lapsed by 10 days, or a warranty card went missing right when the refrigerator compressor started vibrating. 
              Digging through faded, tied bundles of paper with reading glasses was becoming a source of real anxiety for him.
            </p>
          </div>

          {/* Why Cloud Apps Failed */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
            <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
              <Lock className="w-4 h-4 text-amber-700" />
              <span>Why Cloud Apps Were An Instant Non-Starter</span>
            </div>
            <p className="text-amber-950/80 italic text-xs leading-relaxed">
              &quot;Why should an overseas company or an AI cloud server hold my property survey deed, my chassis number, and my family health history just so I can remember when to pay the tax? No stranger on the internet needs to see my papers.&quot;
            </p>
          </div>

          {/* Why Open Innovation Matters */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-bold text-stone-900 flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-emerald-700" />
              <span>Why Open Innovation Made This Possible</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-600">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-stone-900">100% On-Device Open-Weight Inference (Qwen2.5-VL &amp; Qwen2.5)</strong>: 
                  Runs entirely on his laptop via Ollama with zero internet connection. Not a single byte or pixel leaves the machine.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-stone-900">Local Vector Retrieval (BGE-M3 + SQLite)</strong>: 
                  Instead of cloud vector databases charging monthly fees, dense embeddings live in a local SQLite file on his disk.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-stone-900">Grounded Proof Over Black-Box AI</strong>: 
                  Nothing becomes a deadline without his 1-tap confirmation. When he asks a question, it highlights the exact region on the paper scan.
                </span>
              </li>
            </ul>
          </div>

          {/* Dad's Quote / Verdict */}
          <div className="p-4 rounded-xl bg-white border border-[#E2DDD3] text-stone-800 flex items-start space-x-3 shadow-xs">
            <Quote className="w-6 h-6 text-[#B48226] shrink-0 mt-1" />
            <div className="space-y-1">
              <div className="text-xs font-serif font-bold text-[#5A3822]">Dad&apos;s Reaction:</div>
              <p className="text-xs italic leading-relaxed text-stone-700">
                &quot;You made a computer look like my almirah. I asked it &apos;When does my car insurance expire?&apos; and it didn&apos;t just give a date—it showed me the exact line on the original certificate. And it didn&apos;t ask for a password. This I will use.&quot;
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E2DDD3] bg-white flex items-center justify-between text-xs text-stone-500">
          <span>Open Innovation · Zero Telemetry · Offline Forever</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#5A3822] hover:bg-[#482C1B] text-[#FAF7F2] font-semibold transition-colors shadow-xs cursor-pointer"
          >
            Explore The Almirah
          </button>
        </div>
      </div>
    </div>
  );
};
