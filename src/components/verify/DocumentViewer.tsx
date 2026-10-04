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
    <div className="flex flex-col h-full bg-slate-950 rounded-lg border border-slate-800 overflow-hidden shadow-xl">
      {/* Viewer Header / Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          <span className="font-serif font-medium text-paper-parchment text-sm">
            {doc.filename}
          </span>
          {doc.is_synthetic && (
            <span className="bg-amber-900/60 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-700">
              Synthetic sample
            </span>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1">
          <button 
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-slate-800 text-slate-300 rounded focus:ring-1 focus:ring-amber-500"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="px-2 font-mono text-[11px]">{Math.round(zoom * 100)}%</span>
          <button 
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-slate-800 text-slate-300 rounded focus:ring-1 focus:ring-amber-500"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button 
            onClick={handleReset}
            className="p-1.5 hover:bg-slate-800 text-slate-300 rounded focus:ring-1 focus:ring-amber-500"
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
        className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/80 relative"
      >
        <div 
          className="relative shadow-2xl transition-transform duration-200 origin-center bg-paper-parchment"
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
                    ? 'border-2 border-brass bg-brass/25 ring-4 ring-amber-400/40 z-30 shadow-lg'
                    : isLowConf
                    ? 'border border-dashed border-signal-red/80 bg-signal-red/10 hover:border-signal-red hover:bg-signal-red/20 z-10'
                    : 'border border-slate-700/60 bg-slate-700/10 hover:border-brass/80 hover:bg-brass/15 z-10'
                }`}
                style={{
                  top: `${topPct}%`,
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                  height: `${heightPct}%`,
                }}
              >
                {isActive && (
                  <div className="absolute -top-6 left-0 bg-slate-900 border border-brass text-paper-light text-[10px] font-sans font-semibold px-2 py-0.5 rounded shadow whitespace-nowrap z-40">
                    {fb.label} ({Math.round(fb.conf * 100)}%)
                  </div>
                )}
                {!isActive && isLowConf && (
                  <div className="absolute -top-5 right-0 bg-signal-red text-white text-[9px] font-bold px-1 rounded flex items-center shadow">
                    <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                    Verify
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Hover any field on the right to inspect its origin region.</span>
        <span className="text-slate-500 font-mono">Normalized Space (1000x1000)</span>
      </div>
    </div>
  );
};
