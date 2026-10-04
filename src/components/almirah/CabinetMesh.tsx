'use client';

import React from 'react';

export const CabinetMesh: React.FC = () => {
  const cabinetWidth = 4.0;
  const cabinetHeight = 4.2;
  const cabinetDepth = 2.2;
  const wallThickness = 0.15;
  const carcassColor = "#4A3323"; // Dark Walnut Carcass

  return (
    <group position={[0, 0, -1.0]}>
      {/* Top Slab with subtle decorative bevel */}
      <mesh position={[0, cabinetHeight / 2 + wallThickness / 2, 0]}>
        <boxGeometry args={[cabinetWidth + 0.3, wallThickness * 1.5, cabinetDepth + 0.2]} />
        <meshStandardMaterial color="#5D3F2B" roughness={0.7} />
      </mesh>

      {/* Bottom Plinth / Base */}
      <mesh position={[0, -cabinetHeight / 2 - wallThickness / 2, 0]}>
        <boxGeometry args={[cabinetWidth + 0.2, wallThickness * 2, cabinetDepth + 0.2]} />
        <meshStandardMaterial color="#382518" roughness={0.9} />
      </mesh>

      {/* Left Outer Wall */}
      <mesh position={[-cabinetWidth / 2 - wallThickness / 2, 0, 0]}>
        <boxGeometry args={[wallThickness, cabinetHeight, cabinetDepth]} />
        <meshStandardMaterial color={carcassColor} roughness={0.8} />
      </mesh>

      {/* Right Outer Wall */}
      <mesh position={[cabinetWidth / 2 + wallThickness / 2, 0, 0]}>
        <boxGeometry args={[wallThickness, cabinetHeight, cabinetDepth]} />
        <meshStandardMaterial color={carcassColor} roughness={0.8} />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 0, -cabinetDepth / 2 - wallThickness / 2]}>
        <boxGeometry args={[cabinetWidth, cabinetHeight, wallThickness]} />
        <meshStandardMaterial color="#2E1F15" roughness={0.9} />
      </mesh>

      {/* Shelf Dividers */}
      {[-1.2, -0.4, 0.4, 1.2].map((y, idx) => (
        <mesh key={idx} position={[0, y, 0]}>
          <boxGeometry args={[cabinetWidth, 0.05, cabinetDepth]} />
          <meshStandardMaterial color="#382518" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};
