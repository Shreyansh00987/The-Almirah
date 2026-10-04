'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { DrawerSummary, DocumentRecord } from '@/lib/types';
import { CabinetMesh } from './CabinetMesh';
import { DrawerMesh } from './DrawerMesh';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface CameraRigProps {
  openedDrawerIndex: number | null;
  drawerYPositions: number[];
  zoomDistance: number;
}

function CameraRig({ openedDrawerIndex, drawerYPositions, zoomDistance }: CameraRigProps) {
  const { camera, mouse } = useThree();
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    // Subtle, gentle parallax
    const parallaxX = mouse.x * 0.3;
    const parallaxY = mouse.y * 0.18;

    let targetY = 0.0;
    let targetZ = zoomDistance;

    if (openedDrawerIndex !== null) {
      targetY = (drawerYPositions[openedDrawerIndex] ?? 0) * 0.28;
      targetZ = zoomDistance - 0.75; // Gentle, elegant pull toward open drawer
    }

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, parallaxX, delta * 3.5);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY + parallaxY, delta * 3.5);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, delta * 3.5);

    const targetYLook = openedDrawerIndex !== null ? (drawerYPositions[openedDrawerIndex] ?? 0) * 0.2 : 0;
    targetLookAt.current.y = THREE.MathUtils.lerp(targetLookAt.current.y, targetYLook, delta * 4.0);
    camera.lookAt(targetLookAt.current);
  });

  return null;
}

interface AlmirahSceneProps {
  drawers: DrawerSummary[];
  onSelectDocument: (doc: DocumentRecord) => void;
  activeDrawerIndex?: number | null;
  onDrawerChange?: (index: number | null) => void;
}

export const AlmirahScene: React.FC<AlmirahSceneProps> = ({
  drawers,
  onSelectDocument,
  activeDrawerIndex = null,
  onDrawerChange,
}) => {
  // Y positions for the 5 drawers with precise architectural spacing
  const drawerYPositions = [1.5, 0.75, 0.0, -0.75, -1.5];
  const [internalOpenedIndex, setInternalOpenedIndex] = useState<number | null>(null);

  // User adjustable camera zoom distance (default 9.2 makes the almirah comfortable and completely visible)
  const [zoomDistance, setZoomDistance] = useState<number>(9.2);

  const handleZoomIn = () => setZoomDistance(z => Math.max(z - 0.8, 7.2));
  const handleZoomOut = () => setZoomDistance(z => Math.min(z + 0.8, 12.0));
  const handleResetZoom = () => setZoomDistance(9.2);

  // Sync with controlled index if provided
  const openedIndex = activeDrawerIndex !== undefined && activeDrawerIndex !== null 
    ? activeDrawerIndex 
    : internalOpenedIndex;

  const handleToggle = (idx: number) => {
    const nextIdx = openedIndex === idx ? null : idx;
    setInternalOpenedIndex(nextIdx);
    onDrawerChange?.(nextIdx);
  };

  // Full keyboard accessibility: Esc to close, Arrow keys to navigate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInternalOpenedIndex(null);
        onDrawerChange?.(null);
      } else if (e.key === 'ArrowDown') {
        const next = openedIndex === null ? 0 : Math.min(openedIndex + 1, drawers.length - 1);
        setInternalOpenedIndex(next);
        onDrawerChange?.(next);
      } else if (e.key === 'ArrowUp') {
        const next = openedIndex === null ? 0 : Math.max(openedIndex - 1, 0);
        setInternalOpenedIndex(next);
        onDrawerChange?.(next);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawers.length, openedIndex, onDrawerChange]);

  return (
    <div className="w-full h-full relative select-none">
      {/* Interactive Size / Zoom Controls (Allows user to make cabinet smaller or larger) */}
      <div className="absolute top-14 right-3 z-20 flex items-center space-x-1 bg-white/90 backdrop-blur border border-[#E2DDD3] p-1 rounded-xl shadow-xs">
        <button
          onClick={handleZoomOut}
          className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          title="Make Almirah Smaller (Zoom Out)"
          aria-label="Make Almirah Smaller"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleResetZoom}
          className="px-2 py-1 text-[10px] font-mono text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors cursor-pointer font-bold"
          title="Reset View Size"
        >
          Reset
        </button>
        <button
          onClick={handleZoomIn}
          className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          title="Make Almirah Larger (Zoom In)"
          aria-label="Make Almirah Larger"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      <Canvas
        camera={{ position: [0, 0, 9.2], fov: 40 }}
        className="w-full h-full"
        onPointerMissed={() => {
          setInternalOpenedIndex(null);
          onDrawerChange?.(null);
        }}
      >
        {/* Warm Studio Sunlit Background */}
        <color attach="background" args={['#F5F2EB']} />
        
        {/* Soft Sunlit Studio Key Light */}
        <directionalLight
          position={[5.5, 7.5, 6.0]}
          intensity={2.3}
          color="#FFFDF5"
        />

        {/* Generous Warm Ambient Fill */}
        <ambientLight intensity={1.3} color="#FAF7F0" />

        {/* Soft Cool Sky Accent from Left */}
        <directionalLight
          position={[-5.5, 3.5, 2.5]}
          intensity={0.5}
          color="#E0F2FE"
        />

        {/* Warm Floor Bounce Light */}
        <pointLight position={[0, -2.6, 2.2]} intensity={0.6} color="#E8D5C4" />

        {/* Warm Front Accent Light */}
        <pointLight position={[0, 1.5, 3.2]} intensity={0.7} color="#FCE7B8" />

        {/* Camera Parallax and Focus Rig with customizable distance */}
        <CameraRig
          openedDrawerIndex={openedIndex}
          drawerYPositions={drawerYPositions}
          zoomDistance={zoomDistance}
        />

        {/* Handcrafted Walnut Cabinet Carcass */}
        <CabinetMesh />

        {/* 5 Stacked Drawers with Physical Glides & Deadline Seam Glows */}
        {drawers.map((summary, idx) => (
          <DrawerMesh
            key={summary.drawer}
            index={idx}
            yPos={drawerYPositions[idx] ?? 0}
            summary={summary}
            isOpen={openedIndex === idx}
            onToggle={() => handleToggle(idx)}
            onSelectDocument={onSelectDocument}
          />
        ))}

        {/* Soft Natural Ground Contact Shadows on Studio Floor */}
        <ContactShadows
          position={[0, -2.42, 0]}
          opacity={0.42}
          scale={11.0}
          blur={2.4}
          far={4.5}
          color="#422B1D"
        />
      </Canvas>
    </div>
  );
};
