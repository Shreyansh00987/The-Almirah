'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Archive, Clock, HelpCircle, Upload, Menu, X } from 'lucide-react';
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
    <header className="w-full bg-[#FFFFFF]/95 backdrop-blur border-b border-[#E2DDD3] sticky top-0 z-40 shadow-sm">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          
          {/* Logo & Product Identity */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3 group focus:ring-2 focus:ring-amber-500 rounded p-1">
              <div className="w-10 h-10 rounded-lg bg-[#5A3822] border border-[#4A2D1A] flex items-center justify-center shadow-sm group-hover:bg-[#4A2D1A] transition-colors">
                <Archive className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-900 group-hover:text-[#5A3822] transition-colors">
                  The Almirah
                </span>
                <span className="block text-[10px] font-sans tracking-wider uppercase text-stone-500 font-semibold">
                  Local Document Sanctuary
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-[#F3EFE6] text-[#5A3822] border border-[#E2DDD3] shadow-sm' 
                      : 'text-stone-600 hover:text-stone-900 hover:bg-[#F7F5EF]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#B48226]' : 'text-stone-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions & Offline Badge */}
          <div className="hidden sm:flex items-center space-x-3.5">
            <OfflineBadge />

            {/* Scan / Upload Document Action */}
            <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#5A3822] hover:bg-[#482C1B] text-[#FAF7F2] border border-[#482C1B] shadow-sm font-medium text-xs transition-all focus-within:ring-2 focus-within:ring-amber-500">
              <Upload className={`w-3.5 h-3.5 text-amber-300 ${uploading ? 'animate-pulse text-amber-200' : ''}`} />
              <span>{uploading ? 'Scanning...' : 'Scan / Ingest Paper'}</span>
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
              className="p-2 rounded-md text-stone-600 hover:text-stone-900 hover:bg-[#F7F5EF] focus:ring-2 focus:ring-amber-500"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E2DDD3] bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium ${
                    isActive 
                      ? 'bg-[#F3EFE6] text-[#5A3822] font-semibold' 
                      : 'text-stone-600 hover:bg-[#F7F5EF] hover:text-stone-900'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#B48226]" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="pt-2 border-t border-[#E2DDD3]">
            <label className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-[#5A3822] hover:bg-[#482C1B] text-[#FAF7F2] font-medium text-xs shadow-sm">
              <Upload className="w-4 h-4 text-amber-300" />
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
