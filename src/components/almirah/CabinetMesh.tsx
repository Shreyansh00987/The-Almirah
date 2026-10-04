'use client';

import React from 'react';
import { RoundedBox, Html } from '@react-three/drei';

export const CabinetMesh: React.FC = () => {
  const cabinetWidth = 4.1;
  const cabinetHeight = 4.25;
  const cabinetDepth = 2.2;
  const wallThickness = 0.16;
  const carcassColor = "#4A3323"; // Dark Walnut Carcass
  const crownColor = "#5D3F2B"; // Warm Walnut Crown

  return (
    <group position={[0, 0, -1.05]}>
      {/* Top Pediment / Crown Moulding (Classic Indian Woodwork Cornice) */}
      <group position={[0, cabinetHeight / 2 + 0.18, 0]}>
        {/* Upper Overhanging Cornice */}
        <RoundedBox
          args={[cabinetWidth + 0.45, 0.14, cabinetDepth + 0.28]}
          radius={0.03}
          smoothness={3}
          position={[0, 0.08, 0]}
        >
          <meshStandardMaterial color={crownColor} roughness={0.7} metalness={0.05} />
        </RoundedBox>

        {/* Lower Stepped Bevel Slab */}
        <RoundedBox
          args={[cabinetWidth + 0.25, 0.12, cabinetDepth + 0.18]}
          radius={0.02}
          smoothness={2}
          position={[0, -0.04, 0]}
        >
          <meshStandardMaterial color="#3E2718" roughness={0.75} />
        </RoundedBox>

        {/* Traditional Brass Family Dedication Plaque on Cabinet Pediment */}
        <group position={[0, 0.05, cabinetDepth / 2 + 0.15]}>
          <RoundedBox args={[2.8, 0.18, 0.02]} radius={0.01} smoothness={2}>
            <meshStandardMaterial color="#C8A265" metalness={0.88} roughness={0.22} />
          </RoundedBox>

          <Html position={[0, 0, 0.018]} center transform scale={0.10} style={{ pointerEvents: 'none' }}>
            <div className="font-serif font-black tracking-widest text-[#241708] uppercase text-[11px] select-none text-center whitespace-nowrap drop-shadow-sm">
              THE ALMIRAH · SHARMA FAMILY SANCTUARY · LOCAL &amp; PRIVATE
            </div>
          </Html>
        </group>
      </group>

      {/* Bottom Plinth / Base with Solid Bracket Feet */}
      <group position={[0, -cabinetHeight / 2 - 0.15, 0]}>
        <RoundedBox
          args={[cabinetWidth + 0.35, 0.22, cabinetDepth + 0.22]}
          radius={0.02}
          smoothness={2}
        >
          <meshStandardMaterial color="#321D11" roughness={0.85} />
        </RoundedBox>

        {/* Four Sturdy Corner Feet */}
        {[
          [-cabinetWidth / 2 - 0.05, -cabinetDepth / 2 - 0.02],
          [cabinetWidth / 2 + 0.05, -cabinetDepth / 2 - 0.02],
          [-cabinetWidth / 2 - 0.05, cabinetDepth / 2 + 0.02],
          [cabinetWidth / 2 + 0.05, cabinetDepth / 2 + 0.02],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, -0.16, z]}>
            <boxGeometry args={[0.26, 0.12, 0.26]} />
            <meshStandardMaterial color="#24140A" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Left Carved Side Pilaster Wall */}
      <group position={[-cabinetWidth / 2 - wallThickness / 2, 0, 0]}>
        <RoundedBox
          args={[wallThickness, cabinetHeight, cabinetDepth]}
          radius={0.02}
          smoothness={2}
        >
          <meshStandardMaterial color={carcassColor} roughness={0.75} />
        </RoundedBox>
        {/* Subtle Decorative Pilaster Fluting */}
        <mesh position={[wallThickness / 2 + 0.005, 0, cabinetDepth / 2 - 0.08]}>
          <boxGeometry args={[0.02, cabinetHeight - 0.2, 0.12]} />
          <meshStandardMaterial color="#382215" roughness={0.8} />
        </mesh>
      </group>

      {/* Right Carved Side Pilaster Wall */}
      <group position={[cabinetWidth / 2 + wallThickness / 2, 0, 0]}>
        <RoundedBox
          args={[wallThickness, cabinetHeight, cabinetDepth]}
          radius={0.02}
          smoothness={2}
        >
          <meshStandardMaterial color={carcassColor} roughness={0.75} />
        </RoundedBox>
        {/* Subtle Decorative Pilaster Fluting */}
        <mesh position={[-wallThickness / 2 - 0.005, 0, cabinetDepth / 2 - 0.08]}>
          <boxGeometry args={[0.02, cabinetHeight - 0.2, 0.12]} />
          <meshStandardMaterial color="#382215" roughness={0.8} />
        </mesh>
      </group>

      {/* Solid Back Wall */}
      <mesh position={[0, 0, -cabinetDepth / 2 - wallThickness / 2]}>
        <boxGeometry args={[cabinetWidth, cabinetHeight, wallThickness]} />
        <meshStandardMaterial color="#23140C" roughness={0.9} />
      </mesh>

      {/* Horizontal Dividing Shelves (Aromatic Cedar Wood Interior) */}
      {[-1.12, -0.38, 0.38, 1.12].map((y, idx) => (
        <mesh key={idx} position={[0, y, 0]}>
          <boxGeometry args={[cabinetWidth, 0.06, cabinetDepth]} />
          <meshStandardMaterial color="#362014" roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
};
