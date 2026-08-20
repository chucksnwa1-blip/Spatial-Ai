import React from 'react';
import { Environment } from '@react-three/drei';
import { LightingPreset } from '../../types';

interface SceneLightingProps {
  preset: LightingPreset;
}

export const SceneLighting: React.FC<SceneLightingProps> = ({ preset }) => {
  switch (preset) {
    case 'industrial-hall':
    case 'industrial':
      return (
        <>
          <ambientLight intensity={0.65} color="#e2e8f0" />
          <directionalLight position={[12, 18, 12]} intensity={1.8} color="#ffffff" castShadow />
          <directionalLight position={[-10, 8, -10]} intensity={0.8} color="#94a3b8" />
          <pointLight position={[0, 10, 0]} intensity={0.6} color="#38bdf8" />
          <pointLight position={[-8, 2, 8]} intensity={0.4} color="#64748b" />
          <Environment preset="warehouse" />
        </>
      );

    case 'sunlit-lab':
    case 'sunset':
      return (
        <>
          <ambientLight intensity={0.5} color="#fef3c7" />
          <directionalLight position={[15, 12, 10]} intensity={2.2} color="#fbbf24" castShadow />
          <directionalLight position={[-12, 6, -8]} intensity={0.7} color="#f97316" />
          <pointLight position={[0, -2, 4]} intensity={0.4} color="#fef08a" />
          <Environment preset="sunset" />
        </>
      );

    case 'low-light-studio':
    case 'studio':
      return (
        <>
          <ambientLight intensity={0.35} color="#cbd5e1" />
          <directionalLight position={[8, 14, 8]} intensity={1.4} color="#ffffff" castShadow />
          <directionalLight position={[-8, 10, -10]} intensity={0.6} color="#64748b" />
          <pointLight position={[0, -4, 4]} intensity={0.5} color="#38bdf8" />
          <Environment preset="studio" />
        </>
      );

    case 'orbital-space':
    case 'space':
      return (
        <>
          <ambientLight intensity={0.18} color="#0f172a" />
          <directionalLight position={[20, 25, 12]} intensity={2.6} color="#ffffff" />
          <directionalLight position={[-18, -8, -15]} intensity={0.5} color="#38bdf8" />
          <pointLight position={[6, 2, 6]} intensity={0.7} color="#818cf8" />
          <Environment preset="night" />
        </>
      );

    case 'cyberpunk-neon':
    case 'cyberpunk':
    default:
      return (
        <>
          <ambientLight intensity={0.3} color="#090d16" />
          <directionalLight position={[10, 14, 10]} intensity={1.5} color="#06b6d4" />
          <directionalLight position={[-12, 8, -10]} intensity={1.3} color="#a855f7" />
          <pointLight position={[0, 6, 0]} intensity={0.9} color="#38bdf8" />
          <pointLight position={[0, -4, 4]} intensity={0.7} color="#ec4899" />
          <Environment preset="city" />
        </>
      );
  }
};
