'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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
    // Subtle mouse parallax (limited to small degrees for comfort)
    const parallaxX = mouse.x * 0.35;
    const parallaxY = mouse.y * 0.25;

    let targetY = 0;
    let targetZ = 6.2;

    if (openedDrawerIndex !== null) {
      targetY = drawerYPositions[openedDrawerIndex] * 0.7;
      targetZ = 5.2; // Camera pulls focus inward toward open drawer
    }

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, parallaxX, delta * 3.0);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY + parallaxY, delta * 3.0);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, delta * 3.0);

    const targetYLook = openedDrawerIndex !== null ? drawerYPositions[openedDrawerIndex] * 0.5 : 0;
    targetLookAt.current.y = THREE.MathUtils.lerp(targetLookAt.current.y, targetYLook, delta * 4.0);
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
  // Y positions for the 5 drawers
  const drawerYPositions = [1.5, 0.75, 0.0, -0.75, -1.5];
  const [openedIndex, setOpenedIndex] = useState<number | null>(null);

  // Sync external active drawer if passed
  useEffect(() => {
    if (activeDrawerName) {
      const idx = drawers.findIndex(d => d.drawer === activeDrawerName);
      if (idx !== -1) setOpenedIndex(idx);
    }
  }, [activeDrawerName, drawers]);

  // Keyboard accessibility: Escape closes, Up/Down changes drawer
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
        camera={{ position: [0, 0, 6.2], fov: 42 }}
        className="w-full h-full"
        onPointerMissed={() => setOpenedIndex(null)}
      >
        <color attach="background" args={['#12151A']} />
        
        {/* Soft Key Light */}
        <directionalLight
          position={[4, 6, 5]}
          intensity={1.8}
          color="#FFF8EE"
        />

        {/* Ambient Fill Light */}
        <ambientLight intensity={0.65} color="#455064" />

        {/* Soft Backlight for Depth */}
        <pointLight position={[0, -2, -3]} intensity={0.5} color="#6B4A33" />

        {/* Subtle warm accent light over cabinet face */}
        <pointLight position={[0, 2, 3]} intensity={0.8} color="#E0A13A" />

        {/* Camera Parallax and Focus Rig */}
        <CameraRig
          openedDrawerIndex={openedIndex}
          drawerYPositions={drawerYPositions}
        />

        {/* 3D Walnut Cabinet Carcass */}
        <CabinetMesh />

        {/* 5 Stacked Drawers */}
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
      </Canvas>
    </div>
  );
};
