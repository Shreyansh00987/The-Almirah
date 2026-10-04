'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Archive, Clock, HelpCircle, Upload, Shield, Menu, X, FileText } from 'lucide-react';
import { OfflineBadge } from './OfflineBadge';
import { api } from '@/lib/api';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const doc = await api.uploadDocument(file);
      router.push(`/verify?id=${doc.id}`);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const navItems = [
    { name: 'The Almirah', href: '/', icon: Archive },
    { name: 'Deadlines', href: '/deadlines', icon: Clock },
    { name: 'Ask Citations', href: '/ask', icon: HelpCircle },
  ];

  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Product Identity */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3 group focus:ring-2 focus:ring-amber-500 rounded p-1">
              <div className="w-10 h-10 rounded-md bg-walnut-700 border border-walnut-500 flex items-center justify-center shadow-md group-hover:bg-walnut-600 transition-colors">
                <Archive className="w-6 h-6 text-brass" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-paper-light group-hover:text-brass-light transition-colors">
                  The Almirah
                </span>
                <span className="block text-[11px] font-sans tracking-wider uppercase text-slate-400 font-medium">
                  Local Document Sanctuary
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-slate-800 text-brass border border-slate-700 shadow-inner' 
                      : 'text-slate-300 hover:text-paper-light hover:bg-slate-800/60'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brass' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions & Offline Badge */}
          <div className="hidden sm:flex items-center space-x-4">
            <OfflineBadge />

            {/* Scan / Upload Document Action */}
            <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 rounded-md bg-walnut-600 hover:bg-walnut-500 text-paper-light border border-walnut-400 shadow-md font-medium text-sm transition-all focus-within:ring-2 focus-within:ring-amber-400">
              <Upload className={`w-4 h-4 text-brass-light ${uploading ? 'animate-pulse text-amber-300' : ''}`} />
              <span>{uploading ? 'Scanning...' : 'Scan / Ingest'}</span>
              <input 
                type="file" 
                accept="image/*,.pdf" 
                onChange={handleFileUpload} 
                className="sr-only" 
                disabled={uploading}
              />
            </label>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <OfflineBadge />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-paper-light hover:bg-slate-800 focus:ring-2 focus:ring-amber-500"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-5 space-y-3">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-md text-base font-medium ${
                    isActive 
                      ? 'bg-slate-800 text-brass' 
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-paper-light'
                  }`}
                >
                  <Icon className="w-5 h-5 text-brass" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="pt-2 border-t border-slate-800">
            <label className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-md bg-walnut-600 hover:bg-walnut-500 text-paper-light font-medium text-base shadow">
              <Upload className="w-5 h-5 text-brass" />
              <span>{uploading ? 'Analyzing Paper...' : 'Scan / Upload Document'}</span>
              <input 
                type="file" 
                accept="image/*,.pdf" 
                onChange={handleFileUpload} 
                className="sr-only" 
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      )}
    </header>
  );
};
