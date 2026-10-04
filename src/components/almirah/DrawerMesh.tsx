'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
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
  const [hovered, setHovered] = useState(false);

  // Target Z position: 0 when closed, 1.3 when opened
  const targetZ = isOpen ? 1.3 : 0.0;

  // Determine glow color from deadline urgency
  const getGlowColor = (urgency: DeadlineUrgency) => {
    switch (urgency) {
      case 'red':
        return '#C8453B'; // Signal Red (Urgent / < 30 days)
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
      // Smooth physical drawer glide with weight (damped lerp)
      groupRef.current.position.z = THREE.MathUtils.lerp(
        groupRef.current.position.z,
        targetZ,
        delta * 6.5
      );
    }

    // Pulse glow animation for urgent deadlines
    if (glowMeshRef.current) {
      const mat = glowMeshRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        if (isUrgent) {
          const t = state.clock.getElapsedTime();
          mat.emissiveIntensity = 1.4 + Math.sin(t * 3.5) * 0.8;
        } else if (isAmber) {
          const t = state.clock.getElapsedTime();
          mat.emissiveIntensity = 0.8 + Math.sin(t * 2.0) * 0.4;
        } else {
          mat.emissiveIntensity = 0.2;
        }
      }
    }
  });

  const drawerWidth = 3.6;
  const drawerHeight = 0.65;
  const drawerDepth = 2.0;

  return (
    <group ref={groupRef} position={[0, yPos, 0]}>
      {/* Front Face of Drawer (Walnut Wood) */}
      <mesh
        position={[0, 0, 0.02]}
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
        <boxGeometry args={[drawerWidth, drawerHeight, 0.08]} />
        <meshStandardMaterial
          color={hovered ? '#7D553A' : '#6B4A33'}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Perimeter Glow Seam / Lighting Rim (Carries Deadline Urgency) */}
      <mesh ref={glowMeshRef} position={[0, 0, 0.0]}>
        <boxGeometry args={[drawerWidth + 0.04, drawerHeight + 0.04, 0.02]} />
        <meshStandardMaterial
          color={glowColorHex}
          emissive={glowColorHex}
          emissiveIntensity={isUrgent ? 1.5 : isAmber ? 0.8 : 0.2}
          roughness={0.4}
        />
      </mesh>

      {/* Brass Label Plate */}
      <mesh position={[0, 0, 0.07]}>
        <boxGeometry args={[1.5, 0.26, 0.02]} />
        <meshStandardMaterial color="#C8A265" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Brass Handle */}
      <mesh position={[0, -0.06, 0.12]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.7, 16]} />
        <meshStandardMaterial color="#A38044" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Drawer Interior Box (Visible when pulled open) */}
      <mesh position={[0, -0.05, -drawerDepth / 2]}>
        <boxGeometry args={[drawerWidth - 0.15, drawerHeight - 0.1, drawerDepth]} />
        <meshStandardMaterial color="#382518" roughness={0.9} />
      </mesh>

      {/* Physical Folder Tabs inside Drawer */}
      {isOpen && summary.documents.length > 0 && (
        <group position={[0, 0.1, -0.4]}>
          {summary.documents.map((doc, docIdx) => {
            const zOffset = -docIdx * 0.25;
            const xOffset = ((docIdx % 3) - 1) * 0.6;
            return (
              <group
                key={doc.id}
                position={[xOffset, 0, zOffset]}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectDocument(doc);
                }}
              >
                {/* Folder Tab Card */}
                <mesh position={[0, 0.1, 0]}>
                  <boxGeometry args={[1.0, 0.35, 0.03]} />
                  <meshStandardMaterial color="#F1ECE2" roughness={0.8} />
                </mesh>
                {/* Folder Tab Edge Highlight */}
                <mesh position={[0, 0.28, 0.01]}>
                  <boxGeometry args={[0.5, 0.08, 0.02]} />
                  <meshStandardMaterial 
                    color={doc.urgency === 'red' ? '#C8453B' : doc.urgency === 'amber' ? '#E0A13A' : '#5A677D'} 
                  />
                </mesh>
              </group>
            );
          })}
        </group>
      )}
    </group>
  );
};
