'use client';

import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, AlertTriangle } from 'lucide-react';
import { DocumentRecord, BoundingBox } from '@/lib/types';

interface DocumentViewerProps {
  document: DocumentRecord;
  activeFieldKey: string | null;
  onSelectBox?: (fieldKey: string) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document: doc,
  activeFieldKey,
  onSelectBox,
}) => {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 2.5));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.75));
  const handleReset = () => setZoom(1);

  // Map fields to their bounding boxes
  const fieldBoxes: { key: string; label: string; bbox?: BoundingBox | null; conf: number }[] = [
    { key: 'document_type', label: 'Document Type', bbox: doc.extraction.document_type.bounding_box, conf: doc.extraction.document_type.confidence },
    { key: 'provider', label: 'Authority', bbox: doc.extraction.provider.bounding_box, conf: doc.extraction.provider.confidence },
    { key: 'identifier', label: 'Identifier', bbox: doc.extraction.identifier.bounding_box, conf: doc.extraction.identifier.confidence },
    { key: 'issue_date', label: 'Issue Date', bbox: doc.extraction.issue_date.bounding_box, conf: doc.extraction.issue_date.confidence },
    { key: 'expiry_date', label: 'Expiry Date', bbox: doc.extraction.expiry_date.bounding_box, conf: doc.extraction.expiry_date.confidence },
    { key: 'amount', label: 'Amount', bbox: doc.extraction.amount.bounding_box, conf: doc.extraction.amount.confidence },
    { key: 'drawer', label: 'Cabinet Drawer', bbox: doc.extraction.drawer.bounding_box, conf: doc.extraction.drawer.confidence },
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-[#E2DDD3] overflow-hidden shadow-xs">
      {/* Viewer Header / Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#FAF8F5] border-b border-[#E2DDD3] text-xs text-stone-700">
        <div className="flex items-center space-x-2">
          <span className="font-serif font-bold text-stone-900 text-sm">
            {doc.filename}
          </span>
          {doc.is_synthetic && (
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
              Synthetic sample
            </span>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1">
          <button 
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-stone-200 text-stone-700 rounded-lg cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="px-2 font-mono text-[11px] text-stone-800 font-bold">{Math.round(zoom * 100)}%</span>
          <button 
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-stone-200 text-stone-700 rounded-lg cursor-pointer"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button 
            onClick={handleReset}
            className="p-1.5 hover:bg-stone-200 text-stone-700 rounded-lg cursor-pointer"
            title="Reset Zoom"
            aria-label="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas Viewport with Bounding Boxes */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#EFECE6] relative"
      >
        <div 
          className="relative shadow-md transition-transform duration-200 origin-center bg-white p-2 rounded-lg"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Document Scan Image */}
          <img 
            src={doc.image_url || `/synthetic/${doc.filename}`} 
            alt={doc.confirmed_document_type || doc.filename}
            className="max-h-[750px] w-auto block select-none pointer-events-none rounded"
          />

          {/* Bounding Box Overlays */}
          {fieldBoxes.map((fb) => {
            if (!fb.bbox) return null;
            const isActive = activeFieldKey === fb.key;
            const isLowConf = fb.conf < 0.85;

            // Normalized coordinates (0-1000) converted to percentages
            const topPct = (fb.bbox.ymin / 1000) * 100;
            const leftPct = (fb.bbox.xmin / 1000) * 100;
            const widthPct = ((fb.bbox.xmax - fb.bbox.xmin) / 1000) * 100;
            const heightPct = ((fb.bbox.ymax - fb.bbox.ymin) / 1000) * 100;

            return (
              <div
                key={fb.key}
                onClick={() => onSelectBox?.(fb.key)}
                className={`absolute cursor-pointer transition-all duration-200 rounded ${
                  isActive
                    ? 'border-2 border-[#B48226] bg-[#B48226]/30 ring-4 ring-amber-400/50 z-30 shadow-md'
                    : isLowConf
                    ? 'border border-dashed border-red-500 bg-red-500/15 hover:bg-red-500/25 z-10'
                    : 'border border-stone-400/80 bg-stone-500/10 hover:border-[#B48226] hover:bg-[#B48226]/20 z-10'
                }`}
                style={{
                  top: `${topPct}%`,
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                  height: `${heightPct}%`,
                }}
              >
                {isActive && (
                  <div className="absolute -top-6 left-0 bg-[#5A3822] text-[#FAF7F2] text-[10px] font-sans font-bold px-2 py-0.5 rounded shadow whitespace-nowrap z-40">
                    {fb.label} ({Math.round(fb.conf * 100)}%)
                  </div>
                )}
                {!isActive && isLowConf && (
                  <div className="absolute -top-5 right-0 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center shadow">
                    <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                    Verify
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-2 bg-[#FAF8F5] border-t border-[#E2DDD3] text-[11px] text-stone-600 flex items-center justify-between">
        <span>Hover any field on the right to inspect its origin region.</span>
        <span className="text-stone-500 font-mono">Normalized Space (1000x1000)</span>
      </div>
    </div>
  );
};
