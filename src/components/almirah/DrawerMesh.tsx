'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three';
import { DrawerSummary, DeadlineUrgency, DocumentRecord } from '@/lib/types';
import { AlertCircle, Clock, ShieldCheck, FileText } from 'lucide-react';

interface DrawerMeshProps {
  index: number;
  yPos: number;
  summary: DrawerSummary;
  isOpen: boolean;
  onToggle: () => void;
  onSelectDocument: (doc: DocumentRecord) => void;
}

export const DrawerMesh: React.FC<DrawerMeshProps> = ({
  index,
  yPos,
  summary,
  isOpen,
  onToggle,
  onSelectDocument,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const glowMeshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [hoveredDocId, setHoveredDocId] = useState<string | null>(null);

  // Target Z position: 0 when closed, 1.45 when pulled open
  const targetZ = isOpen ? 1.45 : 0.0;

  // Visual roman numerals for authentic classic almirah feel
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V'];

  // Determine glow color from deadline urgency
  const getGlowColor = (urgency: DeadlineUrgency) => {
    switch (urgency) {
      case 'red':
        return '#C8453B'; // Signal Red (Urgent / < 30 days or overdue)
      case 'amber':
        return '#E0A13A'; // Amber (30 - 90 days)
      default:
        return '#5A677D'; // Calm slate/warm (> 90 days)
    }
  };

  const glowColorHex = getGlowColor(summary.urgency);
  const isUrgent = summary.urgency === 'red';
  const isAmber = summary.urgency === 'amber';

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Smooth physical drawer glide with tactile mass
      groupRef.current.position.z = THREE.MathUtils.lerp(
        groupRef.current.position.z,
        targetZ,
        delta * 6.0
      );
    }

    // Dynamic deadline aura pulsing
    if (glowMeshRef.current) {
      const mat = glowMeshRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        if (isUrgent) {
          const t = state.clock.getElapsedTime();
          mat.emissiveIntensity = 1.6 + Math.sin(t * 3.8) * 0.9;
        } else if (isAmber) {
          const t = state.clock.getElapsedTime();
          mat.emissiveIntensity = 0.9 + Math.sin(t * 2.2) * 0.45;
        } else {
          mat.emissiveIntensity = 0.25;
        }
      }
    }
  });

  const drawerWidth = 3.65;
  const drawerHeight = 0.68;
  const drawerDepth = 2.1;

  return (
    <group ref={groupRef} position={[0, yPos, 0]}>
      {/* Front Face of Drawer: Chamfered Walnut Wood with Handcrafted Bevels */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        {/* Main Beveled Drawer Panel */}
        <RoundedBox
          args={[drawerWidth, drawerHeight, 0.1]}
          radius={0.03}
          smoothness={4}
          position={[0, 0, 0.04]}
        >
          <meshStandardMaterial
            color={hovered ? '#7A5236' : '#6B4A33'}
            roughness={0.65}
            metalness={0.08}
          />
        </RoundedBox>

        {/* Decorative Inner Wood Inset Border (Traditional Indian Carpentry Groove) */}
        <mesh position={[0, 0, 0.092]}>
          <boxGeometry args={[drawerWidth - 0.25, drawerHeight - 0.18, 0.01]} />
          <meshStandardMaterial color="#553A26" roughness={0.8} />
        </mesh>
      </group>

      {/* Perimeter Lighting Seam (Communicates Deadline Urgency through Soft Radiant Glow) */}
      <mesh ref={glowMeshRef} position={[0, 0, -0.005]}>
        <boxGeometry args={[drawerWidth + 0.06, drawerHeight + 0.06, 0.02]} />
        <meshStandardMaterial
          color={glowColorHex}
          emissive={glowColorHex}
          emissiveIntensity={isUrgent ? 1.6 : isAmber ? 0.9 : 0.25}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* Heavy Ornate Brass Label Plate */}
      <group position={[0, 0.06, 0.1]}>
        <RoundedBox args={[1.55, 0.28, 0.025]} radius={0.015} smoothness={2}>
          <meshStandardMaterial
            color="#C8A265"
            metalness={0.85}
            roughness={0.25}
          />
        </RoundedBox>

        {/* Decorative Brass Mounting Rivets / Screws */}
        {[-0.7, 0.7].map((x, i) => (
          <mesh key={i} position={[x, 0, 0.015]}>
            <cylinderGeometry args={[0.018, 0.018, 0.015, 8]} />
            <meshStandardMaterial color="#916F35" metalness={0.9} roughness={0.3} />
          </mesh>
        ))}

        {/* Crisp HTML Label inside Brass Plate */}
        <Html
          position={[0, 0, 0.02]}
          center
          transform
          scale={0.11}
          style={{ pointerEvents: 'none' }}
        >
          <div className="font-serif font-black tracking-widest text-[#2A1D0C] uppercase text-xs select-none text-center whitespace-nowrap drop-shadow-sm">
            {romanNumerals[index]}. {summary.drawer}
          </div>
        </Html>
      </group>

      {/* Authentic Traditional Heavy Brass Pull Handle */}
      <group position={[0, -0.12, 0.12]}>
        {/* Left Mount Bracket */}
        <mesh position={[-0.4, 0, 0]}>
          <boxGeometry args={[0.08, 0.08, 0.06]} />
          <meshStandardMaterial color="#C8A265" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Right Mount Bracket */}
        <mesh position={[0.4, 0, 0]}>
          <boxGeometry args={[0.08, 0.08, 0.06]} />
          <meshStandardMaterial color="#C8A265" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Horizontal Brass Bar */}
        <mesh position={[0, 0, 0.03]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.026, 0.026, 0.82, 16]} />
          <meshStandardMaterial color="#DFBA78" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Classic Almirah Keyhole Escutcheon */}
      <group position={[1.45, 0.06, 0.1]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.015, 16]} />
          <meshStandardMaterial color="#C8A265" metalness={0.85} roughness={0.3} />
        </mesh>
        {/* Keyhole slot */}
        <mesh position={[0, -0.01, 0.01]}>
          <boxGeometry args={[0.018, 0.045, 0.01]} />
          <meshStandardMaterial color="#1A1208" roughness={0.9} />
        </mesh>
      </group>

      {/* 3D Floating Deadline Urgency Pill (Visible from distance) */}
      <Html
        position={[-1.35, 0.06, 0.15]}
        center
        distanceFactor={7.5}
        style={{ pointerEvents: 'none' }}
      >
        <div className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold flex items-center space-x-1 shadow-lg border whitespace-nowrap backdrop-blur-sm ${
          isUrgent
            ? 'bg-red-950/90 text-signal-red border-signal-red animate-pulse'
            : isAmber
            ? 'bg-amber-950/90 text-amber-300 border-amber-600'
            : 'bg-slate-900/90 text-slate-300 border-slate-700'
        }`}>
          {isUrgent ? (
            <>
              <AlertCircle className="w-2.5 h-2.5 inline" />
              <span>{summary.nearest_deadline_days !== null ? `${summary.nearest_deadline_days}d left` : 'Urgent'}</span>
            </>
          ) : isAmber ? (
            <>
              <Clock className="w-2.5 h-2.5 inline" />
              <span>{summary.nearest_deadline_days}d left</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-2.5 h-2.5 inline text-emerald-400" />
              <span>Safe</span>
            </>
          )}
        </div>
      </Html>

      {/* Drawer Interior Box (Visible when pulled open) */}
      <mesh position={[0, -0.05, -drawerDepth / 2 + 0.05]}>
        <boxGeometry args={[drawerWidth - 0.15, drawerHeight - 0.1, drawerDepth]} />
        <meshStandardMaterial color="#2E1C10" roughness={0.85} />
      </mesh>

      {/* Inside Drawer: Physical Paper Filing Folders & Document Tabs */}
      {isOpen && summary.documents.length > 0 && (
        <group position={[0, 0.12, -0.3]}>
          {summary.documents.map((doc, docIdx) => {
            const zOffset = -docIdx * 0.28;
            const xOffset = ((docIdx % 3) - 1) * 0.7;
            const isDocHovered = hoveredDocId === doc.id;
            const docUrgent = doc.urgency === 'red';
            const docAmber = doc.urgency === 'amber';

            return (
              <group
                key={doc.id}
                position={[xOffset, isDocHovered ? 0.08 : 0, zOffset]}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectDocument(doc);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHoveredDocId(doc.id);
                }}
                onPointerOut={() => setHoveredDocId(null)}
              >
                {/* Manila / Parchment Folder Body */}
                <RoundedBox
                  args={[1.1, 0.42, 0.04]}
                  radius={0.015}
                  smoothness={2}
                  position={[0, 0.1, 0]}
                >
                  <meshStandardMaterial
                    color={isDocHovered ? '#FAF5EB' : '#F1ECE2'}
                    roughness={0.7}
                  />
                </RoundedBox>

                {/* Staggered Folder Tab on Top */}
                <RoundedBox
                  args={[0.55, 0.12, 0.035]}
                  radius={0.01}
                  smoothness={2}
                  position={[-0.2 + (docIdx % 2) * 0.4, 0.32, 0]}
                >
                  <meshStandardMaterial
                    color={docUrgent ? '#C8453B' : docAmber ? '#E0A13A' : '#7D8C9E'}
                    roughness={0.5}
                  />
                </RoundedBox>

                {/* Interactive Folder Label HTML Tooltip */}
                <Html
                  position={[0, 0.45, 0.05]}
                  center
                  distanceFactor={6.5}
                  style={{ pointerEvents: 'none' }}
                >
                  <div className={`px-2 py-1 rounded shadow-xl text-[10px] font-sans transition-transform ${
                    isDocHovered ? 'scale-105 bg-slate-900 border border-brass text-paper-light z-30' : 'bg-slate-950/80 border border-slate-800 text-slate-300'
                  }`}>
                    <div className="font-serif font-bold truncate max-w-[140px]">
                      {doc.confirmed_document_type}
                    </div>
                    <div className="text-[9px] text-slate-400">
                      {doc.confirmed_expiry_date ? `Due: ${doc.confirmed_expiry_date}` : 'Permanent'}
                    </div>
                  </div>
                </Html>
              </group>
            );
          })}
        </group>
      )}
    </group>
  );
};
