import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

interface SpatialRulerProps {
  startPoint: [number, number, number] | null;
  endPoint: [number, number, number] | null;
  assetScaleUnit?: string;
}

export const SpatialRuler: React.FC<SpatialRulerProps> = ({
  startPoint,
  endPoint,
  assetScaleUnit = 'm',
}) => {
  const pulseRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (pulseRef.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.15;
      pulseRef.current.scale.set(s, s, s);
    }
  });

  const measurementData = useMemo(() => {
    if (!startPoint || !endPoint) return null;

    const p1 = new THREE.Vector3(...startPoint);
    const p2 = new THREE.Vector3(...endPoint);

    const distance = p1.distanceTo(p2);
    const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

    const dx = Math.abs(p2.x - p1.x);
    const dy = Math.abs(p2.y - p1.y);
    const dz = Math.abs(p2.z - p1.z);

    // Orientation vector for cylinder line
    const direction = new THREE.Vector3().subVectors(p2, p1);
    const orientation = new THREE.Matrix4();
    orientation.lookAt(p1, p2, new THREE.Vector3(0, 1, 0));

    return {
      distance,
      midPoint: [midPoint.x, midPoint.y + 0.12, midPoint.z] as [number, number, number],
      dx,
      dy,
      dz,
      p1,
      p2,
      direction,
      length: distance,
    };
  }, [startPoint, endPoint]);

  if (!startPoint) return null;

  return (
    <group>
      {/* START POINT MARKER (Point A) */}
      <group position={startPoint}>
        <mesh>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#06b6d4"
            emissiveIntensity={0.8}
            roughness={0.2}
          />
        </mesh>
        <mesh ref={pulseRef}>
          <ringGeometry args={[0.09, 0.12, 24]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} transparent opacity={0.6} />
        </mesh>
        <Html distanceFactor={8} position={[0, 0.15, 0]} center>
          <div className="bg-cyan-950/90 text-cyan-300 font-mono text-[9px] px-1.5 py-0.5 rounded border border-cyan-500/50 shadow-md whitespace-nowrap pointer-events-none">
            Pt A [{startPoint.map((v) => v.toFixed(2)).join(', ')}]
          </div>
        </Html>
      </group>

      {/* END POINT MARKER (Point B) & CONNECTING MEASUREMENT LASER */}
      {endPoint && measurementData && (
        <>
          <group position={endPoint}>
            <mesh>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial
                color="#a855f7"
                emissive="#a855f7"
                emissiveIntensity={0.8}
                roughness={0.2}
              />
            </mesh>
            <Html distanceFactor={8} position={[0, 0.15, 0]} center>
              <div className="bg-purple-950/90 text-purple-300 font-mono text-[9px] px-1.5 py-0.5 rounded border border-purple-500/50 shadow-md whitespace-nowrap pointer-events-none">
                Pt B [{endPoint.map((v) => v.toFixed(2)).join(', ')}]
              </div>
            </Html>
          </group>

          {/* MEASUREMENT LINE LASER BEAM */}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([...startPoint, ...endPoint])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#06b6d4" linewidth={3} transparent opacity={0.9} />
          </line>

          {/* FLOATING 3D CALIPER BADGE AT MIDPOINT */}
          <Html position={measurementData.midPoint} center distanceFactor={7}>
            <div className="bg-slate-900/95 border border-cyan-400 text-slate-100 px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.4)] backdrop-blur-md text-center pointer-events-none select-none">
              <div className="flex items-center gap-1.5 justify-center">
                <span className="text-[10px] text-cyan-400 font-mono font-bold">📏 DISTANCE</span>
              </div>
              <div className="font-mono text-sm font-bold text-white tracking-wide">
                {measurementData.distance.toFixed(3)} {assetScaleUnit}
              </div>
              <div className="text-[9px] font-mono text-slate-400 flex items-center justify-center gap-2 mt-0.5 border-t border-slate-800 pt-0.5">
                <span>ΔX: {measurementData.dx.toFixed(2)}</span>
                <span>ΔY: {measurementData.dy.toFixed(2)}</span>
                <span>ΔZ: {measurementData.dz.toFixed(2)}</span>
              </div>
            </div>
          </Html>
        </>
      )}
    </group>
  );
};
