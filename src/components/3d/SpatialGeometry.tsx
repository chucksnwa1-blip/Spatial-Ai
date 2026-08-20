import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { SpatialAsset, SpatialAnnotation } from '../../types';

interface SpatialGeometryProps {
  asset: SpatialAsset;
  wireframeOnly?: boolean;
  selectedAnnotation: SpatialAnnotation | null;
  onSelectAnnotation: (ann: SpatialAnnotation | null) => void;
  showBoundingBox?: boolean;
  xrayMode?: boolean;
  onSurfaceClick?: (point: [number, number, number]) => void;
}

export const SpatialGeometry: React.FC<SpatialGeometryProps> = ({
  asset,
  wireframeOnly = false,
  selectedAnnotation,
  onSelectAnnotation,
  showBoundingBox = false,
  xrayMode = false,
  onSurfaceClick,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const rotorRef1 = useRef<THREE.Mesh>(null);
  const rotorRef2 = useRef<THREE.Mesh>(null);
  const rotorRef3 = useRef<THREE.Mesh>(null);
  const rotorRef4 = useRef<THREE.Mesh>(null);
  const gyro1Ref = useRef<THREE.Mesh>(null);
  const gyro2Ref = useRef<THREE.Mesh>(null);
  const gyro3Ref = useRef<THREE.Mesh>(null);
  const plasmaCoreRef = useRef<THREE.Mesh>(null);
  const solarTiltRef = useRef<THREE.Group>(null);

  const { materials, category, rotationSpeed, explodedOffset = 0 } = asset;

  useFrame((state, delta) => {
    // Auto rotation if speed > 0
    if (groupRef.current && rotationSpeed > 0) {
      groupRef.current.rotation.y += delta * rotationSpeed * 0.5;
    }

    // Drone rotor animations
    if (category === 'drone') {
      const spin = delta * 25;
      if (rotorRef1.current) rotorRef1.current.rotation.y += spin;
      if (rotorRef2.current) rotorRef2.current.rotation.y -= spin;
      if (rotorRef3.current) rotorRef3.current.rotation.y += spin;
      if (rotorRef4.current) rotorRef4.current.rotation.y -= spin;
    }

    // Reactor gyro ring animations
    if (category === 'reactor') {
      if (gyro1Ref.current) gyro1Ref.current.rotation.z += delta * 1.2;
      if (gyro2Ref.current) gyro2Ref.current.rotation.x += delta * 0.9;
      if (gyro3Ref.current) gyro3Ref.current.rotation.y -= delta * 1.5;
      if (plasmaCoreRef.current) {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.08;
        plasmaCoreRef.current.scale.set(pulse * 0.65, pulse * 0.65, pulse * 0.65);
      }
    }

    // Solar tracker slow tilt
    if (category === 'solar' && solarTiltRef.current) {
      solarTiltRef.current.rotation.x = -0.3 + Math.sin(state.clock.elapsedTime * 0.4) * 0.15;
    }
  });

  // Calculate exploded position helper
  const getExplodedPos = (origPos: [number, number, number]): [number, number, number] => {
    if (!explodedOffset || explodedOffset === 0) return origPos;
    const len = Math.hypot(origPos[0], origPos[1], origPos[2]) || 1;
    const normX = origPos[0] / len;
    const normY = origPos[1] / len;
    const normZ = origPos[2] / len;
    const factor = explodedOffset * 1.5;
    return [
      origPos[0] + normX * factor,
      origPos[1] + normY * factor,
      origPos[2] + normZ * factor,
    ];
  };

  const primaryMat = (
    <meshStandardMaterial
      color={materials.primaryColor}
      roughness={materials.roughness}
      metalness={materials.metalness}
      opacity={xrayMode ? 0.35 : materials.opacity}
      transparent={xrayMode || materials.opacity < 1}
      wireframe={wireframeOnly || materials.wireframe}
      emissive={materials.accentColor}
      emissiveIntensity={materials.emissiveIntensity * 0.4}
      side={THREE.DoubleSide}
    />
  );

  const secondaryMat = (
    <meshStandardMaterial
      color={materials.secondaryColor}
      roughness={Math.min(1, materials.roughness + 0.2)}
      metalness={materials.metalness * 0.8}
      opacity={xrayMode ? 0.4 : materials.opacity}
      transparent={xrayMode || materials.opacity < 1}
      wireframe={wireframeOnly || materials.wireframe}
    />
  );

  const accentMat = (
    <meshStandardMaterial
      color={materials.accentColor}
      emissive={materials.accentColor}
      emissiveIntensity={materials.emissiveIntensity * 1.2}
      roughness={0.1}
      metalness={0.9}
      wireframe={wireframeOnly || materials.wireframe}
    />
  );

  const glassMat = (
    <meshPhysicalMaterial
      color={materials.accentColor}
      transmission={0.8}
      opacity={0.6}
      transparent
      roughness={0.05}
      metalness={0.1}
      ior={1.5}
      clearcoat={1.0}
    />
  );

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        if (onSurfaceClick) {
          e.stopPropagation();
          onSurfaceClick([+e.point.x.toFixed(3), +e.point.y.toFixed(3), +e.point.z.toFixed(3)]);
        }
      }}
    >
      {/* Bounding Box Visualizer if enabled */}
      {showBoundingBox && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3.2, 3.2, 3.2]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.35} />
        </mesh>
      )}

      {/* RENDER CUSTOM OR CATEGORY SPECIFIC PROCEDURAL MESHES */}
      {category === 'drone' && (
        <group>
          {/* Main Monocoque Fuselage */}
          <mesh position={getExplodedPos([0, 0, 0])} scale={[1.1, 0.3, 1.1]}>
            <boxGeometry args={[1, 1, 1]} />
            {primaryMat}
          </mesh>

          {/* Top Avionics Deck */}
          <mesh position={getExplodedPos([0, 0.22, 0])} scale={[0.7, 0.12, 0.7]}>
            <cylinderGeometry args={[0.6, 0.7, 1, 6]} />
            {secondaryMat}
          </mesh>

          {/* 3-Axis Gimbal Dome */}
          <mesh position={getExplodedPos([0, -0.28, 0.25])}>
            <sphereGeometry args={[0.22, 24, 24]} />
            {glassMat}
          </mesh>
          <mesh position={getExplodedPos([0, -0.28, 0.32])} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
            {accentMat}
          </mesh>

          {/* 4 Carbon Arms & Rotor Motors */}
          {[
            { pos: [-0.9, 0.1, -0.6] as [number, number, number], rot: [0, 0, Math.PI / 4] as [number, number, number], rotorRef: rotorRef1 },
            { pos: [0.9, 0.1, -0.6] as [number, number, number], rot: [0, 0, -Math.PI / 4] as [number, number, number], rotorRef: rotorRef2 },
            { pos: [-0.9, 0.1, 0.6] as [number, number, number], rot: [0, 0, Math.PI / 4] as [number, number, number], rotorRef: rotorRef3 },
            { pos: [0.9, 0.1, 0.6] as [number, number, number], rot: [0, 0, -Math.PI / 4] as [number, number, number], rotorRef: rotorRef4 },
          ].map((arm, i) => (
            <group key={i}>
              <mesh position={getExplodedPos(arm.pos)} rotation={arm.rot} scale={[0.08, 1.1, 0.08]}>
                <cylinderGeometry args={[1, 1, 1, 12]} />
                {secondaryMat}
              </mesh>
              {/* Motor Ring */}
              <mesh position={getExplodedPos([arm.pos[0] * 1.35, 0.25, arm.pos[2] * 1.35])}>
                <cylinderGeometry args={[0.22, 0.22, 0.12, 16]} />
                {primaryMat}
              </mesh>
              {/* Spinning Blade */}
              <mesh
                ref={arm.rotorRef}
                position={getExplodedPos([arm.pos[0] * 1.35, 0.34, arm.pos[2] * 1.35])}
              >
                <boxGeometry args={[0.9, 0.02, 0.08]} />
                <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.9} />
              </mesh>
              {/* Rotor Tip LED */}
              <mesh position={getExplodedPos([arm.pos[0] * 1.35, 0.38, arm.pos[2] * 1.35])}>
                <sphereGeometry args={[0.04, 8, 8]} />
                {accentMat}
              </mesh>
            </group>
          ))}

          {/* Landing Skids */}
          <mesh position={getExplodedPos([-0.55, -0.42, 0])} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 1.4, 12]} />
            {secondaryMat}
          </mesh>
          <mesh position={getExplodedPos([0.55, -0.42, 0])} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 1.4, 12]} />
            {secondaryMat}
          </mesh>
        </group>
      )}

      {category === 'bim' && (
        <group>
          {/* Foundation Slab */}
          <mesh position={getExplodedPos([0, -1.8, 0])}>
            <boxGeometry args={[2.8, 0.3, 2.8]} />
            {secondaryMat}
          </mesh>

          {/* Central Structural Core */}
          <mesh position={getExplodedPos([0, 0.2, 0])}>
            <boxGeometry args={[0.9, 3.8, 0.9]} />
            {primaryMat}
          </mesh>

          {/* Floor Slabs */}
          {[-1.2, -0.5, 0.2, 0.9, 1.6].map((y, idx) => (
            <group key={idx} position={getExplodedPos([0, y, 0])}>
              <mesh rotation={[0, idx * 0.15, 0]}>
                <boxGeometry args={[2.4 - idx * 0.15, 0.12, 2.4 - idx * 0.15]} />
                {secondaryMat}
              </mesh>
              {/* Perimeter Glass Facade Curtain */}
              <mesh rotation={[0, idx * 0.15, 0]}>
                <boxGeometry args={[2.35 - idx * 0.15, 0.5, 2.35 - idx * 0.15]} />
                {glassMat}
              </mesh>
            </group>
          ))}

          {/* Exterior Diagrid Lattice Columns */}
          <mesh position={getExplodedPos([0, 0.2, 0])}>
            <cylinderGeometry args={[1.5, 1.8, 3.8, 8, 1, true]} />
            <meshStandardMaterial
              color={materials.wireframeColor || '#38bdf8'}
              wireframe
              emissive={materials.accentColor}
              emissiveIntensity={0.6}
            />
          </mesh>

          {/* Top Kinetic Solar Canopy */}
          <mesh position={getExplodedPos([0, 2.2, 0])} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.3, 0.08, 16, 32]} />
            {accentMat}
          </mesh>
          <mesh position={getExplodedPos([0, 2.7, 0])}>
            <cylinderGeometry args={[0.04, 0.08, 1.2, 8]} />
            {secondaryMat}
          </mesh>
        </group>
      )}

      {category === 'solar' && (
        <group>
          {/* Foundation Pylon */}
          <mesh position={getExplodedPos([0, -1.1, 0])}>
            <cylinderGeometry args={[0.3, 0.4, 1.8, 16]} />
            {secondaryMat}
          </mesh>

          {/* Slew Hub */}
          <mesh position={getExplodedPos([0, -0.1, 0])}>
            <sphereGeometry args={[0.45, 16, 16]} />
            {primaryMat}
          </mesh>

          {/* Tilting Array Group */}
          <group ref={solarTiltRef} position={getExplodedPos([0, 0.3, 0])}>
            {/* Torque Beam */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.15, 0.15, 4.2, 16]} />
              {secondaryMat}
            </mesh>

            {/* Left Solar Wing */}
            <mesh position={[-1.2, 0.3, 0]}>
              <boxGeometry args={[1.9, 0.08, 2.4]} />
              <meshStandardMaterial
                color="#0284c7"
                roughness={0.12}
                metalness={0.92}
                emissive="#0369a1"
                emissiveIntensity={0.3}
              />
            </mesh>

            {/* Right Solar Wing */}
            <mesh position={[1.2, 0.3, 0]}>
              <boxGeometry args={[1.9, 0.08, 2.4]} />
              <meshStandardMaterial
                color="#0284c7"
                roughness={0.12}
                metalness={0.92}
                emissive="#0369a1"
                emissiveIntensity={0.3}
              />
            </mesh>

            {/* Solar Cell Grid Wireframe Line Overlay */}
            <mesh position={[0, 0.35, 0]}>
              <boxGeometry args={[4.3, 0.01, 2.42]} />
              <meshBasicMaterial color="#38bdf8" wireframe />
            </mesh>
          </group>

          {/* Inverter Telemetry Enclosure */}
          <mesh position={getExplodedPos([0, -0.6, -0.4])}>
            <boxGeometry args={[0.6, 0.5, 0.35]} />
            {accentMat}
          </mesh>
        </group>
      )}

      {category === 'reactor' && (
        <group>
          {/* Outer Gyro Ring */}
          <mesh ref={gyro1Ref} position={getExplodedPos([0, 0, 0])}>
            <torusGeometry args={[2.1, 0.12, 16, 64]} />
            {primaryMat}
          </mesh>

          {/* Mid Gyro Ring */}
          <mesh ref={gyro2Ref} position={getExplodedPos([0, 0, 0])} rotation={[Math.PI / 4, 0, 0]}>
            <torusGeometry args={[1.6, 0.1, 16, 48]} />
            {secondaryMat}
          </mesh>

          {/* Inner Gyro Ring */}
          <mesh ref={gyro3Ref} position={getExplodedPos([0, 0, 0])} rotation={[0, Math.PI / 4, 0]}>
            <torusGeometry args={[1.1, 0.08, 16, 36]} />
            {accentMat}
          </mesh>

          {/* Glowing Luminous Plasma Core Sphere */}
          <mesh ref={plasmaCoreRef} position={getExplodedPos([0, 0, 0])}>
            <sphereGeometry args={[0.65, 32, 32]} />
            <meshStandardMaterial
              color="#a855f7"
              emissive="#c084fc"
              emissiveIntensity={1.8}
              roughness={0.1}
              metalness={0.5}
              wireframe={wireframeOnly || materials.wireframe}
            />
          </mesh>

          {/* Plasma Confinement Field Aura */}
          <mesh position={getExplodedPos([0, 0, 0])}>
            <sphereGeometry args={[0.85, 24, 24]} />
            <meshPhysicalMaterial
              color="#ec4899"
              transmission={0.9}
              transparent
              opacity={0.3}
              roughness={0.1}
            />
          </mesh>

          {/* Cryogenic Injectors Top & Bottom */}
          <mesh position={getExplodedPos([0, 1.7, 0])}>
            <cylinderGeometry args={[0.18, 0.25, 0.9, 16]} />
            {secondaryMat}
          </mesh>
          <mesh position={getExplodedPos([0, -1.7, 0])}>
            <cylinderGeometry args={[0.18, 0.25, 0.9, 16]} />
            {secondaryMat}
          </mesh>
        </group>
      )}

      {category === 'lidar' && (
        <group>
          {/* Titanium Cylinder Pressure Hull */}
          <mesh position={getExplodedPos([0, 0, 0])} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.65, 0.65, 1.9, 24]} />
            {primaryMat}
          </mesh>

          {/* Optical Dome Lens */}
          <mesh position={getExplodedPos([0, 0, 1.05])}>
            <sphereGeometry args={[0.62, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
            {glassMat}
          </mesh>

          {/* Green LiDAR Scanner Core Inside Dome */}
          <mesh position={getExplodedPos([0, 0, 1.1])} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.2, 0.3, 16]} />
            {accentMat}
          </mesh>

          {/* Port & Starboard Vectored Thrusters */}
          <mesh position={getExplodedPos([-0.9, 0, -0.6])} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.25, 0.6, 16]} />
            {secondaryMat}
          </mesh>
          <mesh position={getExplodedPos([0.9, 0, -0.6])} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.25, 0.6, 16]} />
            {secondaryMat}
          </mesh>

          {/* Telemetry Stabilizer Fin */}
          <mesh position={getExplodedPos([0, 0.7, -0.3])}>
            <boxGeometry args={[0.08, 0.6, 0.9]} />
            {primaryMat}
          </mesh>
        </group>
      )}

      {category === 'satellite' && (
        <group>
          {/* Hexagonal Core Chassis */}
          <mesh position={getExplodedPos([0, 0, 0])}>
            <cylinderGeometry args={[0.75, 0.75, 1.5, 6]} />
            {primaryMat}
          </mesh>

          {/* Ka-Band Phased Antenna Dish */}
          <mesh position={getExplodedPos([0, 0.95, 0.3])} rotation={[Math.PI / 3, 0, 0]}>
            <torusGeometry args={[0.45, 0.08, 12, 24]} />
            {accentMat}
          </mesh>

          {/* Deployable Solar Wings Port & Starboard */}
          <mesh position={getExplodedPos([-1.7, 0, 0])} rotation={[0, 0.15, 0]}>
            <boxGeometry args={[2.0, 0.06, 0.9]} />
            <meshStandardMaterial color="#0284c7" roughness={0.15} metalness={0.9} />
          </mesh>
          <mesh position={getExplodedPos([1.7, 0, 0])} rotation={[0, -0.15, 0]}>
            <boxGeometry args={[2.0, 0.06, 0.9]} />
            <meshStandardMaterial color="#0284c7" roughness={0.15} metalness={0.9} />
          </mesh>

          {/* Gold MLI Foil Insulator Layer */}
          <mesh position={getExplodedPos([0, 0, 0])} scale={[0.78, 0.8, 0.78]}>
            <cylinderGeometry args={[1, 1, 1, 6]} />
            <meshStandardMaterial
              color="#eab308"
              roughness={0.3}
              metalness={0.95}
              wireframe={wireframeOnly || materials.wireframe}
            />
          </mesh>

          {/* Ion Thruster Nozzle */}
          <mesh position={getExplodedPos([0, -0.9, 0])}>
            <cylinderGeometry args={[0.18, 0.3, 0.3, 16]} />
            {secondaryMat}
          </mesh>
          <mesh position={getExplodedPos([0, -1.08, 0])}>
            <sphereGeometry args={[0.1, 12, 12]} />
            {accentMat}
          </mesh>
        </group>
      )}

      {/* RENDER PROCEDURAL AI SUBCOMPONENTS (If custom or fallback asset) */}
      {category === 'custom' && asset.subcomponents?.map((sub, index) => {
        const explodedSubPos = getExplodedPos(sub.position);
        return (
          <group
            key={sub.id || index}
            position={explodedSubPos}
            rotation={sub.rotation || [0, 0, 0]}
            scale={sub.scale || [1, 1, 1]}
          >
            {sub.type === 'sphere' && (
              <mesh>
                <sphereGeometry args={[0.5, 24, 24]} />
                {primaryMat}
              </mesh>
            )}
            {sub.type === 'cylinder' && (
              <mesh>
                <cylinderGeometry args={[0.5, 0.5, 1, 16]} />
                {secondaryMat}
              </mesh>
            )}
            {sub.type === 'torus' && (
              <mesh>
                <torusGeometry args={[0.7, 0.15, 16, 32]} />
                {accentMat}
              </mesh>
            )}
            {sub.type !== 'sphere' && sub.type !== 'cylinder' && sub.type !== 'torus' && (
              <mesh>
                <boxGeometry args={[1, 1, 1]} />
                {primaryMat}
              </mesh>
            )}
          </group>
        );
      })}

      {/* 3D INTERACTIVE ANNOTATION PINS */}
      {asset.annotations?.map((ann) => {
        const isSelected = selectedAnnotation?.id === ann.id;
        const explodedAnnPos = getExplodedPos(ann.position);

        return (
          <group key={ann.id} position={explodedAnnPos}>
            {/* 3D Pin Beacon */}
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onSelectAnnotation(isSelected ? null : ann);
              }}
            >
              <sphereGeometry args={[0.09, 16, 16]} />
              <meshStandardMaterial
                color={isSelected ? '#38bdf8' : ann.type === 'sensor' ? '#22d3ee' : ann.type === 'power' ? '#f59e0b' : '#a855f7'}
                emissive={isSelected ? '#38bdf8' : '#22d3ee'}
                emissiveIntensity={isSelected ? 1.5 : 0.8}
              />
            </mesh>

            {/* Pulsing ring indicator */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.12, 0.16, 16]} />
              <meshBasicMaterial
                color={isSelected ? '#38bdf8' : '#38bdf8'}
                transparent
                opacity={0.6}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Interactive HTML Popover Label */}
            {isSelected && (
              <Html distanceFactor={8} position={[0, 0.25, 0]} center>
                <div className="bg-slate-900/95 border border-cyan-500/60 rounded-lg p-3 shadow-2xl backdrop-blur-md min-w-[220px] max-w-[280px] pointer-events-auto transform -translate-y-2 transition-all">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      {ann.type}
                    </span>
                    <button
                      onClick={() => onSelectAnnotation(null)}
                      className="text-slate-400 hover:text-white text-xs px-1"
                    >
                      ✕
                    </button>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-100 mb-1">{ann.title}</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{ann.description}</p>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};
