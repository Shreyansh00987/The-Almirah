'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three';
import { DrawerSummary, DeadlineUrgency, DocumentRecord } from '@/lib/types';

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
  const gemMeshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [hoveredDocId, setHoveredDocId] = useState<string | null>(null);

  // Target Z position: 0 when closed, 1.45 when pulled open
  const targetZ = isOpen ? 1.45 : 0.0;

  // Determine glow color from deadline urgency
  const getGlowColor = (urgency: DeadlineUrgency) => {
    switch (urgency) {
      case 'red':
        return '#DC2626'; // Signal Red (Urgent / < 30 days or overdue)
      case 'amber':
        return '#D97706'; // Warm Amber (30 - 90 days)
      default:
        return '#059669'; // Safe Emerald (> 90 days or permanent)
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
        delta * 6.5
      );
    }

    // Dynamic deadline aura pulsing
    if (glowMeshRef.current) {
      const mat = glowMeshRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        if (isUrgent) {
          const t = state.clock.getElapsedTime();
          mat.emissiveIntensity = 1.4 + Math.sin(t * 3.5) * 0.7;
        } else if (isAmber) {
          const t = state.clock.getElapsedTime();
          mat.emissiveIntensity = 0.8 + Math.sin(t * 2.0) * 0.35;
        } else {
          mat.emissiveIntensity = 0.2;
        }
      }
    }

    // Jewel cabochon pulse
    if (gemMeshRef.current) {
      const gemMat = gemMeshRef.current.material as THREE.MeshStandardMaterial;
      if (gemMat && (isUrgent || isAmber)) {
        const t = state.clock.getElapsedTime();
        gemMat.emissiveIntensity = isUrgent 
          ? 1.5 + Math.sin(t * 4.0) * 0.8 
          : 0.9 + Math.sin(t * 2.5) * 0.4;
      }
    }
  });

  const drawerWidth = 3.65;
  const drawerHeight = 0.68;
  const drawerDepth = 2.1;

  // Roman numerals
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V'];

  return (
    <group ref={groupRef} position={[0, yPos, 0]}>
      {/* Front Face of Drawer: Chamfered Oiled Walnut Wood */}
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
            color={hovered ? '#6B452B' : '#55341E'}
            roughness={0.62}
            metalness={0.06}
          />
        </RoundedBox>

        {/* Decorative Inner Wood Inset Border (Traditional Indian Carpentry Groove) */}
        <mesh position={[0, 0, 0.092]}>
          <boxGeometry args={[drawerWidth - 0.25, drawerHeight - 0.18, 0.01]} />
          <meshStandardMaterial color="#422715" roughness={0.78} />
        </mesh>
      </group>

      {/* Perimeter Lighting Seam (Communicates Deadline Urgency through Soft Radiant Glow) */}
      <mesh ref={glowMeshRef} position={[0, 0, -0.005]}>
        <boxGeometry args={[drawerWidth + 0.06, drawerHeight + 0.06, 0.02]} />
        <meshStandardMaterial
          color={glowColorHex}
          emissive={glowColorHex}
          emissiveIntensity={isUrgent ? 1.4 : isAmber ? 0.8 : 0.2}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* Heavy Ornate Brass Label Plate */}
      <group position={[0, 0.06, 0.1]}>
        <RoundedBox args={[1.65, 0.26, 0.025]} radius={0.015} smoothness={2}>
          <meshStandardMaterial
            color="#D4AF37"
            metalness={0.88}
            roughness={0.22}
          />
        </RoundedBox>

        {/* Decorative Brass Mounting Screws */}
        {[-0.72, 0.72].map((x, i) => (
          <mesh key={i} position={[x, 0, 0.015]}>
            <cylinderGeometry args={[0.018, 0.018, 0.015, 8]} />
            <meshStandardMaterial color="#916F35" metalness={0.9} roughness={0.3} />
          </mesh>
        ))}

        {/* Crisp Engraved Brass Nameplate Title */}
        <Html position={[0, 0, 0.016]} center transform scale={0.075} style={{ pointerEvents: 'none' }}>
          <div className="font-serif font-black tracking-widest text-[#241708] uppercase text-[11px] select-none text-center whitespace-nowrap">
            {romanNumerals[index]}. {summary.drawer}
          </div>
        </Html>
      </group>

      {/* Physical 3D Urgency Status Jewel (Embedded cabochon gem beside the label) */}
      <group position={[-1.35, 0.06, 0.1]}>
        {/* Brass bezel ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.02, 16]} />
          <meshStandardMaterial color="#C8A265" metalness={0.9} roughness={0.25} />
        </mesh>
        {/* Glowing glass jewel */}
        <mesh ref={gemMeshRef} position={[0, 0, 0.015]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshStandardMaterial
            color={glowColorHex}
            emissive={glowColorHex}
            emissiveIntensity={isUrgent ? 1.6 : isAmber ? 0.9 : 0.3}
            roughness={0.1}
            metalness={0.1}
          />
        </mesh>
      </group>

      {/* Authentic Traditional Heavy Brass Pull Handle */}
      <group position={[0, -0.12, 0.12]}>
        {/* Left Mount Bracket */}
        <mesh position={[-0.4, 0, 0]}>
          <boxGeometry args={[0.08, 0.08, 0.06]} />
          <meshStandardMaterial color="#C8A265" metalness={0.88} roughness={0.22} />
        </mesh>
        {/* Right Mount Bracket */}
        <mesh position={[0.4, 0, 0]}>
          <boxGeometry args={[0.08, 0.08, 0.06]} />
          <meshStandardMaterial color="#C8A265" metalness={0.88} roughness={0.22} />
        </mesh>
        {/* Horizontal Brass Bar */}
        <mesh position={[0, 0, 0.03]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.026, 0.026, 0.82, 16]} />
          <meshStandardMaterial color="#E0BA6A" metalness={0.92} roughness={0.18} />
        </mesh>
      </group>

      {/* Classic Almirah Keyhole Escutcheon */}
      <group position={[1.45, 0.06, 0.1]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.015, 16]} />
          <meshStandardMaterial color="#C8A265" metalness={0.88} roughness={0.25} />
        </mesh>
        {/* Keyhole slot */}
        <mesh position={[0, -0.01, 0.01]}>
          <boxGeometry args={[0.018, 0.045, 0.01]} />
          <meshStandardMaterial color="#1A1208" roughness={0.9} />
        </mesh>
      </group>

      {/* Drawer Interior Box (Visible when pulled open) */}
      <mesh position={[0, -0.05, -drawerDepth / 2 + 0.05]}>
        <boxGeometry args={[drawerWidth - 0.15, drawerHeight - 0.1, drawerDepth]} />
        <meshStandardMaterial color="#321E12" roughness={0.82} />
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
                    color={isDocHovered ? '#FFFFFF' : '#FAF6ED'}
                    roughness={0.65}
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
                    color={docUrgent ? '#DC2626' : docAmber ? '#D97706' : '#059669'}
                    roughness={0.4}
                  />
                </RoundedBox>
              </group>
            );
          })}
        </group>
      )}
    </group>
  );
};
