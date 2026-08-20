import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import {
  Camera,
  Maximize2,
  Minimize2,
  RotateCcw,
  Box,
  Layers,
  Sparkles,
  Eye,
  Camera as CameraIcon,
  Play,
  Pause,
  Grid as GridIcon,
  Activity,
  Sliders,
  Undo2,
  Redo2,
  BookmarkPlus,
  Flame,
  Sun,
  Ruler,
  Trash2,
  CheckCircle2,
  Target
} from 'lucide-react';
import { SpatialAsset, SpatialAnnotation } from '../../types';
import { SpatialGeometry } from './SpatialGeometry';
import { SceneLighting } from './SceneLighting';
import { ParticleField } from './ParticleField';
import { SpatialGrid } from './SpatialGrid';
import { SpatialRuler } from './SpatialRuler';

// FPS tracker component inside Canvas
const FPSMonitor: React.FC<{ onUpdateFps: (fps: number) => void }> = ({ onUpdateFps }) => {
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let animId: number;
    const loop = () => {
      frameCount.current++;
      const now = performance.now();
      if (now - lastTime.current >= 600) {
        const measuredFps = Math.round((frameCount.current * 1000) / (now - lastTime.current));
        onUpdateFps(Math.min(60, measuredFps));
        frameCount.current = 0;
        lastTime.current = now;
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [onUpdateFps]);

  return null;
};

interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  label: string;
}

interface Viewport3DProps {
  asset: SpatialAsset;
  onUpdateAsset: (asset: SpatialAsset) => void;
  selectedAnnotation: SpatialAnnotation | null;
  onSelectAnnotation: (ann: SpatialAnnotation | null) => void;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({
  asset,
  onUpdateAsset,
  selectedAnnotation,
  onSelectAnnotation,
}) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const [fps, setFps] = useState<number>(60);
  const [wireframeOverlay, setWireframeOverlay] = useState<boolean>(false);
  const [xrayMode, setXrayMode] = useState<boolean>(false);
  const [showBoundingBox, setShowBoundingBox] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showParticles, setShowParticles] = useState<boolean>(true);
  const [enableBloom, setEnableBloom] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(asset.rotationSpeed > 0);
  const [explodedVal, setExplodedVal] = useState<number>(asset.explodedOffset || 0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 3D RULER / MEASUREMENT TOOL STATE
  const [isRulerActive, setIsRulerActive] = useState<boolean>(false);
  const [rulerStart, setRulerStart] = useState<[number, number, number] | null>(null);
  const [rulerEnd, setRulerEnd] = useState<[number, number, number] | null>(null);

  // CAMERA NAVIGATION STACK
  const [cameraHistory, setCameraHistory] = useState<CameraState[]>([
    { position: [4, 3.5, 4.5], target: [0, 0, 0], label: 'ISO Initial' },
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const applyCameraState = (state: CameraState) => {
    if (!controlsRef.current) return;
    const ctrl = controlsRef.current;
    ctrl.object.position.set(...state.position);
    ctrl.target.set(...state.target);
    ctrl.update();
  };

  const pushCameraState = (pos: [number, number, number], target: [number, number, number], label: string) => {
    setCameraHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      const newState: CameraState = { position: pos, target, label };
      const updated = [...sliced, newState];
      if (updated.length > 20) updated.shift();
      return updated;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 19));
  };

  const handleCameraUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      const targetState = cameraHistory[prevIdx];
      applyCameraState(targetState);
      triggerToast(`Restored Camera: ${targetState.label}`);
    }
  };

  const handleCameraRedo = () => {
    if (historyIndex < cameraHistory.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      const targetState = cameraHistory[nextIdx];
      applyCameraState(targetState);
      triggerToast(`Redo Camera: ${targetState.label}`);
    }
  };

  const handleBookmarkCurrentView = () => {
    if (!controlsRef.current) return;
    const ctrl = controlsRef.current;
    const pos: [number, number, number] = [
      +ctrl.object.position.x.toFixed(2),
      +ctrl.object.position.y.toFixed(2),
      +ctrl.object.position.z.toFixed(2),
    ];
    const target: [number, number, number] = [
      +ctrl.target.x.toFixed(2),
      +ctrl.target.y.toFixed(2),
      +ctrl.target.z.toFixed(2),
    ];
    const label = `Custom #${cameraHistory.length + 1}`;
    pushCameraState(pos, target, label);
    triggerToast(`Bookmarked camera angle (${label})`);
  };

  // Measurement point clicked
  const handleMeasurePoint = (pt: [number, number, number]) => {
    if (!isRulerActive) return;

    if (!rulerStart || (rulerStart && rulerEnd)) {
      setRulerStart(pt);
      setRulerEnd(null);
      triggerToast(`Point A set: [${pt.map((v) => v.toFixed(2)).join(', ')}] — Now click Point B`);
    } else {
      setRulerEnd(pt);
      const d = Math.hypot(pt[0] - rulerStart[0], pt[1] - rulerStart[1], pt[2] - rulerStart[2]);
      triggerToast(`Measured: ${d.toFixed(3)} ${asset.dimensions.unit} between points`);
    }
  };

  const handleClearMeasurement = () => {
    setRulerStart(null);
    setRulerEnd(null);
    triggerToast('Measurement cleared');
  };

  const toggleRulerTool = () => {
    const next = !isRulerActive;
    setIsRulerActive(next);
    if (!next) {
      setRulerStart(null);
      setRulerEnd(null);
    } else {
      triggerToast('Interactive 3D Caliper Ruler Active. Click surfaces to measure.');
    }
  };

  // Camera Presets
  const setCameraView = (view: 'iso' | 'top' | 'front' | 'side') => {
    if (!controlsRef.current) return;
    const ctrl = controlsRef.current;
    
    let pos: [number, number, number] = [4, 3.5, 4.5];
    let tgt: [number, number, number] = [0, 0, 0];

    switch (view) {
      case 'iso':
        pos = [4, 3.5, 4.5];
        break;
      case 'top':
        pos = [0, 7.5, 0.001];
        break;
      case 'front':
        pos = [0, 0.8, 6.5];
        break;
      case 'side':
        pos = [6.5, 0.8, 0];
        break;
    }

    ctrl.object.position.set(...pos);
    ctrl.target.set(...tgt);
    ctrl.update();
    pushCameraState(pos, tgt, `${view.toUpperCase()} View`);
  };

  const handleOrbitEnd = () => {
    if (!controlsRef.current) return;
    const ctrl = controlsRef.current;
    const current = cameraHistory[historyIndex];
    const pos: [number, number, number] = [
      +ctrl.object.position.x.toFixed(2),
      +ctrl.object.position.y.toFixed(2),
      +ctrl.object.position.z.toFixed(2),
    ];
    const target: [number, number, number] = [
      +ctrl.target.x.toFixed(2),
      +ctrl.target.y.toFixed(2),
      +ctrl.target.z.toFixed(2),
    ];

    if (!current) {
      pushCameraState(pos, target, 'Orbit State');
      return;
    }

    const dist = Math.hypot(
      pos[0] - current.position[0],
      pos[1] - current.position[1],
      pos[2] - current.position[2]
    );

    if (dist > 0.4) {
      pushCameraState(pos, target, `Orbit ${pos.map((p) => p.toFixed(1)).join(',')}`);
    }
  };

  // Sync auto rotation with asset
  const toggleAutoRotate = () => {
    const nextVal = !isAutoRotating;
    setIsAutoRotating(nextVal);
    onUpdateAsset({
      ...asset,
      rotationSpeed: nextVal ? 0.35 : 0,
    });
  };

  const handleExplodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setExplodedVal(val);
    onUpdateAsset({
      ...asset,
      explodedOffset: val,
    });
  };

  // Reset view
  const handleResetView = () => {
    setCameraView('iso');
    triggerToast('Camera position reset to ISO Default');
  };

  // Capture canvas screenshot
  const handleCaptureScreenshot = useCallback(() => {
    const canvas = canvasContainerRef.current?.querySelector('canvas');
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `spatial-asset-${asset.category}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      triggerToast('Captured 3D High-Res Viewport Snapshot (PNG)');
    } catch {
      triggerToast('Unable to capture screenshot');
    }
  }, [asset.category]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!canvasContainerRef.current) return;
    if (!document.fullscreenElement) {
      canvasContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Dynamic calculated poly/vertex stats
  const calculatedPolys = Math.round(asset.polygonBudget * (1 + (asset.materials.wireframe || wireframeOverlay ? 0.3 : 0)));
  const calculatedVerts = Math.round(calculatedPolys * 0.58);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < cameraHistory.length - 1;

  // Calculated ruler distance for HUD
  const activeDistance = rulerStart && rulerEnd
    ? Math.hypot(rulerEnd[0] - rulerStart[0], rulerEnd[1] - rulerStart[1], rulerEnd[2] - rulerStart[2])
    : null;

  return (
    <div
      ref={canvasContainerRef}
      id="viewport-canvas-container"
      tabIndex={-1}
      onContextMenu={(e) => e.preventDefault()}
      className={`viewport-canvas-container relative w-full h-full bg-radial from-slate-900 via-slate-950 to-black overflow-hidden select-none outline-none flex flex-col touch-none ${
        isRulerActive ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
      }`}
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-cyan-950/90 border border-cyan-500/60 text-cyan-200 text-xs px-4 py-2 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP-LEFT HUD OVERLAY: LIVE RENDER ENGINE & CAMERA STACK & RULER MEASUREMENT */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none max-w-xs">
        {/* Render Telemetry Card */}
        <div className="p-3 bg-slate-900/60 backdrop-blur border border-slate-800 rounded-md pointer-events-auto shadow-xl">
          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-wider">
            Live Render Engine
          </div>
          <div className="flex items-center gap-3">
            <div className="text-2xl font-mono text-cyan-400 font-bold">
              {fps.toFixed(1)} <span className="text-xs text-slate-500 font-normal">FPS</span>
            </div>
            <div className="w-px h-8 bg-slate-700"></div>
            <div className="text-xs font-mono">
              <div className="text-slate-400">Tris: {calculatedPolys.toLocaleString()}</div>
              <div className="text-slate-400">Verts: {calculatedVerts.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* View Angle Quick Selectors + Camera Navigation Stack */}
        <div className="flex items-center gap-1.5 bg-slate-900/70 backdrop-blur border border-slate-800 rounded-md p-1 pointer-events-auto shadow-md">
          <span className="text-[9px] uppercase font-mono px-1 text-slate-500 font-bold">Cam:</span>
          
          {/* History Undo / Redo */}
          <button
            id="btn-cam-undo"
            disabled={!canUndo}
            onClick={handleCameraUndo}
            title="Undo Camera View (Previous Orbit Position)"
            className="p-1 rounded bg-slate-800/80 hover:bg-cyan-500/20 disabled:opacity-30 disabled:hover:bg-slate-800/80 text-slate-300 hover:text-cyan-300 transition-colors"
          >
            <Undo2 className="w-3 h-3" />
          </button>

          <button
            id="btn-cam-redo"
            disabled={!canRedo}
            onClick={handleCameraRedo}
            title="Redo Camera View"
            className="p-1 rounded bg-slate-800/80 hover:bg-cyan-500/20 disabled:opacity-30 disabled:hover:bg-slate-800/80 text-slate-300 hover:text-cyan-300 transition-colors"
          >
            <Redo2 className="w-3 h-3" />
          </button>

          <button
            id="btn-cam-bookmark"
            onClick={handleBookmarkCurrentView}
            title="Bookmark Current Camera Orbit State"
            className="p-1 rounded bg-slate-800/80 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-300 transition-colors"
          >
            <BookmarkPlus className="w-3 h-3" />
          </button>

          <div className="w-px h-3.5 bg-slate-700 mx-0.5" />

          {/* Quick Angles */}
          {(['iso', 'top', 'front', 'side'] as const).map((view) => (
            <button
              key={view}
              id={`cam-view-${view}`}
              onClick={() => setCameraView(view)}
              className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800/80 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 transition-colors border border-transparent hover:border-cyan-500/30"
            >
              {view}
            </button>
          ))}
        </div>

        {/* REAL-TIME 3D RULER MEASUREMENT HUD CARD */}
        {isRulerActive && (
          <div className="p-3 bg-slate-900/90 backdrop-blur-md border border-cyan-500/50 rounded-lg pointer-events-auto shadow-2xl space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[11px] font-bold">
                <Ruler className="w-3.5 h-3.5" />
                <span>3D CAD MEASURE TOOL</span>
              </div>
              <button
                onClick={handleClearMeasurement}
                title="Clear current measurement points"
                className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {activeDistance !== null ? (
              <div className="space-y-1">
                <div className="text-lg font-mono font-bold text-white flex items-baseline gap-1">
                  {activeDistance.toFixed(3)}
                  <span className="text-xs text-cyan-400 font-normal">{asset.dimensions.unit}</span>
                  <span className="text-[10px] text-slate-400 font-normal ml-2">
                    ({Math.round(activeDistance * 1000)} mm)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-[10px] font-mono bg-slate-950/80 p-1.5 rounded border border-slate-800 text-slate-300">
                  <div>ΔX: {Math.abs(rulerEnd![0] - rulerStart![0]).toFixed(2)}m</div>
                  <div>ΔY: {Math.abs(rulerEnd![1] - rulerStart![1]).toFixed(2)}m</div>
                  <div>ΔZ: {Math.abs(rulerEnd![2] - rulerStart![2]).toFixed(2)}m</div>
                </div>
              </div>
            ) : rulerStart ? (
              <div className="text-[11px] text-cyan-300 flex items-center gap-1.5 py-1">
                <Target className="w-3.5 h-3.5 animate-spin" />
                <span>Point A set. Click surface for Point B...</span>
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 py-1">
                Click any 3D model surface or floor to set Point A.
              </div>
            )}
          </div>
        )}
      </div>

      {/* TOP-RIGHT VIEWPORT ACTION TOOLBAR */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-lg p-1.5 shadow-xl">
        {/* Interactive 3D Ruler Measurement Tool Toggle */}
        <button
          id="btn-toggle-ruler"
          onClick={toggleRulerTool}
          title={isRulerActive ? 'Disable 3D Caliper Ruler' : 'Enable Interactive 3D Caliper Ruler'}
          className={`p-2 rounded-md transition-all ${
            isRulerActive
              ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Ruler className="w-4 h-4" />
        </button>

        {/* Post-Processing Bloom Toggle */}
        <button
          id="btn-toggle-bloom"
          onClick={() => {
            setEnableBloom(!enableBloom);
            triggerToast(enableBloom ? 'Emissive Bloom Effect Disabled' : 'Emissive Bloom Effect Active');
          }}
          title={enableBloom ? 'Disable Emissive Bloom Shader' : 'Enable Emissive Bloom Shader'}
          className={`p-2 rounded-md transition-all ${
            enableBloom ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Sun className="w-4 h-4" />
        </button>

        {/* Auto Rotation Toggle */}
        <button
          id="btn-auto-rotate"
          onClick={toggleAutoRotate}
          title={isAutoRotating ? 'Pause Rotation' : 'Start Auto-Rotation'}
          className={`p-2 rounded-md transition-all text-xs flex items-center gap-1 font-mono ${
            isAutoRotating ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          {isAutoRotating ? <Pause className="w-4 h-4 text-cyan-400" /> : <Play className="w-4 h-4" />}
        </button>

        <button
          id="btn-toggle-wireframe"
          onClick={() => setWireframeOverlay(!wireframeOverlay)}
          title="Toggle Wireframe Overlay"
          className={`p-2 rounded-md transition-all ${
            wireframeOverlay ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <GridIcon className="w-4 h-4" />
        </button>

        <button
          id="btn-toggle-xray"
          onClick={() => setXrayMode(!xrayMode)}
          title="Toggle X-Ray Transparency"
          className={`p-2 rounded-md transition-all ${
            xrayMode ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Eye className="w-4 h-4" />
        </button>

        <button
          id="btn-toggle-bbox"
          onClick={() => setShowBoundingBox(!showBoundingBox)}
          title="Toggle Bounding Box Matrix"
          className={`p-2 rounded-md transition-all ${
            showBoundingBox ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Box className="w-4 h-4" />
        </button>

        <button
          id="btn-toggle-grid"
          onClick={() => setShowGrid(!showGrid)}
          title="Toggle Spatial Grid"
          className={`p-2 rounded-md transition-all ${
            showGrid ? 'bg-slate-800 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Layers className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-slate-800 mx-1" />

        <button
          id="btn-capture-snapshot"
          onClick={handleCaptureScreenshot}
          title="Snapshot 3D Viewport (PNG)"
          className="p-2 rounded-md text-slate-300 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
        >
          <CameraIcon className="w-4 h-4" />
        </button>

        <button
          id="btn-reset-view"
          onClick={handleResetView}
          title="Reset Camera Target"
          className="p-2 rounded-md text-slate-300 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          id="btn-toggle-fullscreen"
          onClick={toggleFullscreen}
          title="Toggle Fullscreen"
          className="p-2 rounded-md text-slate-300 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* BOTTOM-CENTER FLOATING ASSEMBLY EXPLODED VIEW CONTROLLER */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-full px-5 py-2.5 shadow-2xl flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono text-[11px] whitespace-nowrap">Assembly Explode:</span>
        </div>
        <input
          id="slider-exploded-view"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={explodedVal}
          onChange={handleExplodeChange}
          className="w-28 sm:w-44 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
        <span className="font-mono text-cyan-400 text-[11px] font-bold w-9 text-right">
          {Math.round(explodedVal * 100)}%
        </span>
      </div>

      {/* THREE.JS WEBGL RENDER CANVAS */}
      <div className="w-full h-full flex-1 touch-none select-none outline-none overflow-hidden">
        <Canvas
          style={{ touchAction: 'none', outline: 'none', width: '100%', height: '100%' }}
          gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true, powerPreference: 'high-performance' }}
          camera={{ position: [4, 3.5, 4.5], fov: 45 }}
          onPointerDown={(e) => {
            if (isRulerActive && (e.target as any)?.tagName === 'CANVAS') {
              // Clicked on empty background / floor
              const hit = (e as any).point;
              if (hit) {
                handleMeasurePoint([+hit.x.toFixed(3), +hit.y.toFixed(3), +hit.z.toFixed(3)]);
              }
            }
          }}
        >
          <PerspectiveCamera makeDefault position={[4, 3.5, 4.5]} fov={45} />
          
          <FPSMonitor onUpdateFps={setFps} />

          {/* Scene Lighting Preset with Environment Map */}
          <SceneLighting preset={asset.lighting} />

          {/* Procedural 3D Spatial Geometry */}
          <SpatialGeometry
            asset={asset}
            wireframeOnly={wireframeOverlay}
            selectedAnnotation={selectedAnnotation}
            onSelectAnnotation={onSelectAnnotation}
            showBoundingBox={showBoundingBox}
            xrayMode={xrayMode}
            onSurfaceClick={isRulerActive ? handleMeasurePoint : undefined}
          />

          {/* 3D Ruler Measurement Overlay */}
          {isRulerActive && (
            <SpatialRuler
              startPoint={rulerStart}
              endPoint={rulerEnd}
              assetScaleUnit={asset.dimensions.unit}
            />
          )}

          {/* Floor measurement intersection plane when ruler is active */}
          {isRulerActive && (
            <mesh
              position={[0, -0.01, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              onClick={(e) => {
                e.stopPropagation();
                handleMeasurePoint([+e.point.x.toFixed(3), +e.point.y.toFixed(3), +e.point.z.toFixed(3)]);
              }}
            >
              <planeGeometry args={[40, 40]} />
              <meshBasicMaterial visible={false} />
            </mesh>
          )}

          {/* Ambient Particles / Telemetry Point Cloud */}
          {showParticles && (
            <ParticleField
              count={asset.particleDensity || 400}
              color={asset.materials.accentColor || '#38bdf8'}
            />
          )}

          {/* Spatial Grid Floor */}
          {showGrid && <SpatialGrid color={asset.materials.wireframeColor || '#0ea5e9'} />}

          {/* Orbit Controls with Smooth Damping & Mobile Touch Mapping */}
          <OrbitControls
            ref={controlsRef}
            enableDamping
            dampingFactor={0.05}
            minDistance={1.2}
            maxDistance={18}
            maxPolarAngle={Math.PI / 2 + 0.1}
            touches={{
              ONE: THREE.TOUCH.ROTATE,
              TWO: THREE.TOUCH.DOLLY_PAN,
            }}
            onEnd={handleOrbitEnd}
          />

          {/* Orientation Gizmo Helper in Bottom Right */}
          <GizmoHelper alignment="bottom-right" margin={[70, 70]}>
            <GizmoViewport
              axisColors={['#ef4444', '#10b981', '#3b82f6']}
              labelColor="#ffffff"
            />
          </GizmoHelper>

          {/* Post-Processing Bloom for Emissive Highlighting */}
          {enableBloom && (
            <EffectComposer multisampling={4}>
              <Bloom
                luminanceThreshold={0.3}
                luminanceSmoothing={0.85}
                intensity={1.2}
                mipmapBlur
              />
            </EffectComposer>
          )}
        </Canvas>
      </div>

      {/* BOTTOM-LEFT INTERACTIVE ORBIT HINT */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-500">
        <span className="px-1.5 py-0.5 bg-slate-900/80 rounded border border-slate-800">L-Click</span> Rotate
        <span className="px-1.5 py-0.5 bg-slate-900/80 rounded border border-slate-800">R-Click</span> Pan
        <span className="px-1.5 py-0.5 bg-slate-900/80 rounded border border-slate-800">Scroll</span> Zoom
      </div>
    </div>
  );
};
