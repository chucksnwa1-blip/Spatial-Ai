import React from 'react';
import { Grid } from '@react-three/drei';

interface SpatialGridProps {
  color?: string;
  wireframe?: boolean;
}

export const SpatialGrid: React.FC<SpatialGridProps> = ({ color = '#0ea5e9' }) => {
  return (
    <group position={[0, -2.2, 0]}>
      <Grid
        position={[0, 0, 0]}
        args={[30, 30]}
        cellSize={0.5}
        cellThickness={0.7}
        cellColor={color}
        sectionSize={2.5}
        sectionThickness={1.2}
        sectionColor="#38bdf8"
        fadeDistance={20}
        fadeStrength={1.5}
        infiniteGrid
      />
    </group>
  );
};
