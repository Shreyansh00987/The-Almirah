import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/common/Header';
import { ModeBanner } from '@/components/common/ModeBanner';

export const metadata: Metadata = {
  title: 'The Almirah — Local Offline Document Keeper',
  description: 'A 100% local, offline document keeper and 3D almirah that encodes verified deadline urgencies using open-source models.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self' data: blob:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' http://localhost:8000 http://127.0.0.1:8000 http://localhost:11434 http://127.0.0.1:11434;" />
      </head>
      <body className="bg-slate-950 text-paper-parchment min-h-screen flex flex-col font-sans selection:bg-brass/30 selection:text-paper-light">
        {/* Dual Mode Switcher Banner */}
        <ModeBanner />

        {/* Global Navigation Header */}
        <Header />

        {/* Main View Area */}
        <div className="flex-1 flex flex-col">
          {children}
        </div>

        {/* Accessible Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>The Almirah · 100% Local Offline Operation</span>
            <span className="text-slate-400">Zero data leaves this device · Self-hosted open models & fonts</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
