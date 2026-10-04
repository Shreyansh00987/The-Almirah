'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { DrawerSummary, DocumentRecord } from '@/lib/types';
import { CabinetMesh } from './CabinetMesh';
import { DrawerMesh } from './DrawerMesh';

interface CameraRigProps {
  openedDrawerIndex: number | null;
  drawerYPositions: number[];
}

function CameraRig({ openedDrawerIndex, drawerYPositions }: CameraRigProps) {
  const { camera, mouse } = useThree();
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    // Subtle, elder-friendly mouse parallax (gentle movement)
    const parallaxX = mouse.x * 0.4;
    const parallaxY = mouse.y * 0.28;

    let targetY = 0.05;
    let targetZ = 6.4;

    if (openedDrawerIndex !== null) {
      targetY = (drawerYPositions[openedDrawerIndex] ?? 0) * 0.75 + 0.1;
      targetZ = 5.1; // Smooth focal pull toward open drawer
    }

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, parallaxX, delta * 3.2);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY + parallaxY, delta * 3.2);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, delta * 3.2);

    const targetYLook = openedDrawerIndex !== null ? (drawerYPositions[openedDrawerIndex] ?? 0) * 0.5 : 0;
    targetLookAt.current.y = THREE.MathUtils.lerp(targetLookAt.current.y, targetYLook, delta * 4.2);
    camera.lookAt(targetLookAt.current);
  });

  return null;
}

interface AlmirahSceneProps {
  drawers: DrawerSummary[];
  onSelectDocument: (doc: DocumentRecord) => void;
  activeDrawerName?: string | null;
}

export const AlmirahScene: React.FC<AlmirahSceneProps> = ({
  drawers,
  onSelectDocument,
  activeDrawerName,
}) => {
  // Y positions for the 5 drawers with precise architectural spacing
  const drawerYPositions = [1.5, 0.75, 0.0, -0.75, -1.5];
  const [openedIndex, setOpenedIndex] = useState<number | null>(null);

  // Sync external active drawer if passed
  useEffect(() => {
    if (activeDrawerName) {
      const idx = drawers.findIndex(d => d.drawer === activeDrawerName);
      if (idx !== -1) setOpenedIndex(idx);
    }
  }, [activeDrawerName, drawers]);

  // Full keyboard accessibility: Esc to close, Arrow keys to navigate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenedIndex(null);
      } else if (e.key === 'ArrowDown') {
        setOpenedIndex(prev => (prev === null ? 0 : Math.min(prev + 1, drawers.length - 1)));
      } else if (e.key === 'ArrowUp') {
        setOpenedIndex(prev => (prev === null ? 0 : Math.max(prev - 1, 0)));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawers.length]);

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        camera={{ position: [0, 0, 6.4], fov: 40 }}
        className="w-full h-full"
        onPointerMissed={() => setOpenedIndex(null)}
      >
        <color attach="background" args={['#101317']} />
        
        {/* Warm Golden Key Light (Simulating soft afternoon study light) */}
        <directionalLight
          position={[4.5, 6.0, 5.5]}
          intensity={1.9}
          color="#FFF4E6"
        />

        {/* Soft Slate Ambient Fill (Prevents harsh shadows) */}
        <ambientLight intensity={0.7} color="#45546C" />

        {/* Subtle Slate Rim Light from the Left (Separates dark wood from background) */}
        <directionalLight
          position={[-5.0, 3.0, 2.0]}
          intensity={0.65}
          color="#6E88AC"
        />

        {/* Warm Low Floor Bounce */}
        <pointLight position={[0, -2.8, 1.5]} intensity={0.6} color="#6B4A33" />

        {/* Warm Golden Front Accent */}
        <pointLight position={[0, 1.8, 3.2]} intensity={0.9} color="#E0A13A" />

        {/* Camera Parallax and Focus Rig */}
        <CameraRig
          openedDrawerIndex={openedIndex}
          drawerYPositions={drawerYPositions}
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
            onToggle={() => setOpenedIndex(openedIndex === idx ? null : idx)}
            onSelectDocument={onSelectDocument}
          />
        ))}

        {/* Ultra-Soft Realistic Ground Contact Shadows */}
        <ContactShadows
          position={[0, -2.42, 0]}
          opacity={0.82}
          scale={10.5}
          blur={2.4}
          far={4.5}
          color="#06080A"
        />
      </Canvas>
    </div>
  );
};
