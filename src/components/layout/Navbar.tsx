import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Download,
  Terminal,
  Github,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Cpu,
  Layers,
  FileCode2,
  ShieldCheck,
  FileSpreadsheet,
  CheckCheck,
  Loader2,
  Glasses,
  Undo2,
  Redo2,
  Eye,
  Radio,
  Sliders,
  Tv,
  Maximize,
  Cloud,
  User as UserIcon,
  Camera,
  ChevronDown,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SpatialAsset } from '../../types';
import { UserProfileDropdown } from './UserProfileDropdown';
import {
  exportToGLB,
  exportToGLTF,
  exportToOBJ,
  exportToCADMetadataPackage,
  captureViewportScreenshot
} from '../../utils/export3D';

interface NavbarProps {
  asset: SpatialAsset;
  onSelectPreset: (presetKey: string) => void;
  activePresetKey: string;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  historyLabel?: string;
  onOpenCloudModal?: (tab?: 'library' | 'save' | 'auth') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  asset,
  onSelectPreset,
  activePresetKey,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  historyLabel,
  onOpenCloudModal,
}) => {
  const { user, userProfile } = useAuth();
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [showVRModal, setShowVRModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // WebXR VR State
  const [ipd, setIpd] = useState<number>(64);
  const [vrMode, setVrMode] = useState<'passthrough' | 'void' | 'grid'>('passthrough');
  const [isVRActive, setIsVRActive] = useState(false);
  const [vrStatusMessage, setVrStatusMessage] = useState<string | null>(null);

  const handleCopyCode = (text: string, type: 'ts' | 'curl') => {
    navigator.clipboard.writeText(text);
    if (type === 'ts') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    }
  };

  const handleExport = async (format: 'glb' | 'gltf' | 'obj' | 'cad-json') => {
    try {
      setIsExporting(format);
      if (format === 'glb') {
        await exportToGLB(asset);
      } else if (format === 'gltf') {
        await exportToGLTF(asset);
      } else if (format === 'obj') {
        await exportToOBJ(asset);
      } else if (format === 'cad-json') {
        exportToCADMetadataPackage(asset);
      }
      setExportSuccess(`Exported ${format.toUpperCase()} successfully`);
      setExportMenuOpen(false);
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportScreenshot = async () => {
    try {
      setIsExporting('screenshot');
      const filenamePrefix = `${asset.category || 'spatial'}-${asset.title.replace(/\s+/g, '-').toLowerCase()}`;
      await captureViewportScreenshot(filenamePrefix);
      setExportSuccess('Captured Viewport Screenshot (PNG)');
      setExportMenuOpen(false);
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (err) {
      console.error('Screenshot export failed:', err);
    } finally {
      setIsExporting(null);
    }
  };

  const handleLaunchWebXRSession = async () => {
    try {
      if (typeof navigator !== 'undefined' && (navigator as any).xr) {
        const xr = (navigator as any).xr;
        const isSupported = await xr.isSessionSupported('immersive-vr');
        if (isSupported) {
          setVrStatusMessage('Launching native WebXR session...');
          await xr.requestSession('immersive-vr');
          setIsVRActive(true);
        } else {
          setVrStatusMessage('No hardware VR headset detected. Simulating Spatial Computing environment.');
          setIsVRActive(true);
        }
      } else {
        setVrStatusMessage('WebXR API simulated on standard browser runtime.');
        setIsVRActive(true);
      }
    } catch (err) {
      console.warn('WebXR launch note:', err);
      setVrStatusMessage('WebXR Simulation running in High-Fidelity Spatial Mode.');
      setIsVRActive(true);
    }
  };

  const sampleTypeScriptCode = `// SpatialAI Enterprise Pipeline Client
import { SpatialModelLoader } from '@spatialai/sdk';

const spatialClient = new SpatialModelLoader({
  apiKey: process.env.SPATIAL_AI_KEY,
  endpoint: 'https://spatial.snt.lu/api/v1',
});

// Load real-time 3D telemetry asset: ${asset.title}
const asset = await spatialClient.loadAsset('${asset.id}', {
  lod: 'high',
  wireframe: ${asset.materials.wireframe},
  metalness: ${asset.materials.metalness},
  enableFEAStressMesh: true,
});

console.log('Model loaded into Vision Pro memory buffer:', asset.diagnostics);`;

  const sampleCurl = `curl -X POST https://spatial.snt.lu/api/v1/generate \\
  -H "Authorization: Bearer SPATIAL_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "${asset.prompt}",
    "polygonBudget": ${asset.polygonBudget},
    "runtimeTarget": "appleVisionPro"
  }'`;

  return (
    <>
      <header className="h-14 bg-slate-900/80 border-b border-slate-800 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-50 sticky top-0">
        {/* BRAND LOGO & TARGET PROJECT TAG */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-indigo-600 rounded flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.4)] shrink-0">
            <div className="w-4 h-4 border-2 border-white rotate-45 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>

          <div className="flex items-baseline">
            <h1 className="text-base sm:text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent flex items-center">
              SpatialAI Studio
              <span className="text-xs font-normal text-slate-500 ml-2 hidden sm:inline">
                | SnT Luxembourg MVP
              </span>
            </h1>
          </div>
        </div>

        {/* CENTER CONTROLS: UNDO/REDO & STATUS BADGE */}
        <div className="flex items-center gap-3">
          {/* Global State Undo / Redo */}
          <div className="flex items-center gap-1 bg-slate-950/70 border border-slate-800 rounded-lg p-1">
            <button
              id="btn-global-undo"
              disabled={!canUndo}
              onClick={onUndo}
              title="Undo Asset Modification (Ctrl+Z)"
              className="p-1.5 rounded text-slate-300 hover:text-cyan-300 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-global-redo"
              disabled={!canRedo}
              onClick={onRedo}
              title="Redo Asset Modification (Ctrl+Y / Ctrl+Shift+Z)"
              className="p-1.5 rounded text-slate-300 hover:text-cyan-300 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-colors"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
            {historyLabel && (
              <span className="hidden xl:inline text-[10px] font-mono text-slate-400 px-1.5 truncate max-w-[120px]">
                {historyLabel}
              </span>
            )}
          </div>

          {/* AI ENGINE STATUS */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full border border-emerald-500/30">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
              Gemini 2.5 Flash Connected
            </span>
          </div>
        </div>

        {/* RIGHT ACTION BUTTONS */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* USER PROFILE & FIREBASE AUTH DROPDOWN */}
          <UserProfileDropdown
            onOpenCloudModal={onOpenCloudModal || (() => {})}
            currentAsset={asset}
          />

          {/* CLOUD FIRESTORE ASSETS SHORTCUT BUTTON */}
          <button
            id="btn-nav-cloud-workspace"
            onClick={() => onOpenCloudModal?.('library')}
            className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 rounded-lg flex items-center gap-1.5 transition-all px-2.5 sm:px-3 py-1.5 shadow-sm active:scale-95"
            title="Open Cloud Firestore 3D Asset Library"
          >
            <Cloud className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Cloud Library</span>
            {user && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
            )}
          </button>

          {/* WEBXR IMMERSIVE VR SESSION BUTTON */}
          <button
            id="btn-nav-webxr-vr"
            onClick={() => setShowVRModal(true)}
            className="text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/50 hover:border-cyan-400 rounded-lg flex items-center gap-1.5 transition-all px-2.5 sm:px-3 py-1.5 shadow-[0_0_12px_rgba(6,182,212,0.25)] active:scale-95"
            title="Enter Immersive WebXR Spatial Computing VR Session"
          >
            <Glasses className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">WebXR VR</span>
            <span className="sm:hidden">VR</span>
          </button>

          {/* EXPORT DROPDOWN MENU (.GLB & SCREENSHOT QUICK EXPORT) */}
          <div className="relative" ref={exportMenuRef}>
            <button
              id="btn-nav-export"
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 rounded-lg flex items-center gap-1.5 transition-all px-2.5 sm:px-3 py-1.5 shadow-sm active:scale-95 group"
              title="Export 3D Asset as GLB or Capture Viewport Screenshot"
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
              )}
              <span className="hidden sm:inline">Export</span>
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                  exportMenuOpen ? 'rotate-180 text-cyan-400' : ''
                }`}
              />
            </button>

            {/* EXPORT QUICK DROPDOWN POPOVER */}
            {exportMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900/95 border border-slate-700/90 rounded-xl shadow-2xl backdrop-blur-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1">
                <div className="px-2.5 py-1.5 border-b border-slate-800 flex items-center justify-between">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Export 3D & Media
                  </div>
                  <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30">
                    {asset.category.toUpperCase()}
                  </span>
                </div>

                {/* PRIMARY ACTION 1: DOWNLOAD .GLB */}
                <button
                  id="btn-quick-export-glb"
                  disabled={isExporting !== null}
                  onClick={() => handleExport('glb')}
                  className="w-full p-2.5 rounded-lg bg-slate-800/60 hover:bg-cyan-950/50 hover:border-cyan-500/50 border border-transparent flex items-start gap-2.5 text-left transition-all group disabled:opacity-50"
                >
                  <div className="p-2 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 group-hover:scale-105 transition-transform shrink-0">
                    <FileCode2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100 group-hover:text-cyan-300">
                        Download .GLB File
                      </span>
                      <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-1 rounded">
                        3D Binary
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                      Universal 3D format for Vision Pro, Quest, Blender & CAD.
                    </p>
                  </div>
                </button>

                {/* PRIMARY ACTION 2: CAPTURE VIEWPORT SCREENSHOT */}
                <button
                  id="btn-quick-export-screenshot"
                  disabled={isExporting !== null}
                  onClick={handleExportScreenshot}
                  className="w-full p-2.5 rounded-lg bg-slate-800/60 hover:bg-indigo-950/50 hover:border-indigo-500/50 border border-transparent flex items-start gap-2.5 text-left transition-all group disabled:opacity-50"
                >
                  <div className="p-2 rounded-md bg-indigo-950/80 border border-indigo-500/40 text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100 group-hover:text-indigo-300">
                        Capture Viewport
                      </span>
                      <span className="text-[9px] font-mono font-bold text-indigo-400 bg-indigo-950/80 px-1 rounded">
                        PNG Image
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                      High-resolution render snapshot of current angle.
                    </p>
                  </div>
                </button>

                <div className="border-t border-slate-800/80 my-1"></div>

                {/* SECONDARY EXPORT FORMATS */}
                <div className="grid grid-cols-2 gap-1 px-1">
                  <button
                    id="btn-quick-export-obj"
                    disabled={isExporting !== null}
                    onClick={() => handleExport('obj')}
                    className="p-1.5 rounded-md hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Box className="w-3 h-3 text-cyan-400" />
                    <span>Wavefront .OBJ</span>
                  </button>

                  <button
                    id="btn-quick-export-gltf"
                    disabled={isExporting !== null}
                    onClick={() => handleExport('gltf')}
                    className="p-1.5 rounded-md hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Layers className="w-3 h-3 text-cyan-400" />
                    <span>GLTF (.gltf)</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-800/80">
                  <button
                    id="btn-open-full-export-modal"
                    onClick={() => {
                      setExportMenuOpen(false);
                      setShowExportModal(true);
                    }}
                    className="w-full py-1.5 px-2 rounded-md bg-slate-800/50 hover:bg-slate-800 text-center text-[11px] text-cyan-400 font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Open Full CAD Export Suite...</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* DEPLOY API */}
          <button
            id="btn-nav-deploy"
            onClick={() => setShowDeployModal(true)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-900/30 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Deploy API</span>
          </button>

          {/* GITHUB SOURCE */}
          <button
            id="btn-nav-github"
            onClick={() => setShowGithubModal(true)}
            title="View Project Architecture & SnT Roadmap"
            className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all"
          >
            <Github className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* WEBXR IMMERSIVE VR MODAL & SPATIAL ENVIRONMENT INSPECTOR */}
      {showVRModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 max-w-xl w-full shadow-[0_0_40px_rgba(6,182,212,0.25)] space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 text-slate-100 font-semibold">
                <div className="p-1.5 bg-cyan-950 border border-cyan-500/50 rounded-lg">
                  <Glasses className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">WebXR Spatial VR Session</h3>
                  <p className="text-[10px] text-cyan-400 font-mono">visionOS / Meta Quest 3 / OpenXR Pipeline</p>
                </div>
              </div>
              <button
                onClick={() => setShowVRModal(false)}
                className="text-slate-400 hover:text-slate-100 text-sm p-1"
              >
                ✕
              </button>
            </div>

            {/* STEREOSCOPIC PREVIEW SIMULATOR */}
            <div className="relative bg-black rounded-xl border border-slate-800 p-4 overflow-hidden">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-2">
                <span className="flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  STEREOSCOPIC 1:1 PASSTHROUGH
                </span>
                <span className="text-cyan-400">90 FPS Fixed Buffer</span>
              </div>

              {/* Dual Eye Simulator */}
              <div className="grid grid-cols-2 gap-3 py-2">
                <div className="aspect-square bg-slate-950 border border-cyan-500/30 rounded-full flex items-center justify-center relative overflow-hidden">
                  <div className="text-center space-y-1">
                    <Box className="w-8 h-8 text-cyan-400 mx-auto animate-pulse" />
                    <div className="text-[9px] font-mono text-cyan-300">LEFT EYE</div>
                    <div className="text-[8px] font-mono text-slate-500">-32.0mm IPD</div>
                  </div>
                  <div className="absolute inset-0 bg-radial from-transparent to-black/60 pointer-events-none" />
                </div>

                <div className="aspect-square bg-slate-950 border border-indigo-500/30 rounded-full flex items-center justify-center relative overflow-hidden">
                  <div className="text-center space-y-1">
                    <Box className="w-8 h-8 text-indigo-400 mx-auto animate-pulse" />
                    <div className="text-[9px] font-mono text-indigo-300">RIGHT EYE</div>
                    <div className="text-[8px] font-mono text-slate-500">+32.0mm IPD</div>
                  </div>
                  <div className="absolute inset-0 bg-radial from-transparent to-black/60 pointer-events-none" />
                </div>
              </div>

              {vrStatusMessage && (
                <div className="mt-2 text-center text-[10px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 py-1 px-2 rounded">
                  {vrStatusMessage}
                </div>
              )}
            </div>

            {/* VR CALIBRATION CONTROLS */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* IPD Slider */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1.5">
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>Hardware IPD</span>
                  <span className="font-mono text-cyan-400 font-bold">{ipd} mm</span>
                </div>
                <input
                  type="range"
                  min="58"
                  max="72"
                  value={ipd}
                  onChange={(e) => setIpd(parseInt(e.target.value, 10))}
                  className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Spatial Mode Selector */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1.5">
                <div className="text-[10px] text-slate-400">Environment Target</div>
                <div className="grid grid-cols-3 gap-1 text-[9px] font-medium">
                  {(['passthrough', 'void', 'grid'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setVrMode(mode)}
                      className={`py-1 rounded capitalize transition-all ${
                        vrMode === mode
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* COMPATIBLE RUNTIMES */}
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <div className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enterprise Spatial Headset Support</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Connect Apple Vision Pro via Safari WebXR, Meta Quest 3 via Oculus Browser, or HTC Vive Focus 3. Hand gesture raycasts and 6-DoF controllers are automatically mapped to spatial translation.
              </p>
            </div>

            {/* ACTION LAUNCH */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setShowVRModal(false)}
                className="text-xs text-slate-400 hover:text-white px-3 py-2"
              >
                Close
              </button>

              <button
                id="btn-launch-webxr-session"
                onClick={handleLaunchWebXRSession}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-cyan-900/30 flex items-center gap-2 active:scale-95 transition-all"
              >
                <Glasses className="w-4 h-4" />
                <span>{isVRActive ? 'Active WebXR Session' : 'Enter Immersive VR Session'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-100 font-semibold">
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Export 3D CAD & Spatial Assets</span>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-100 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-100 text-sm">{asset.title}</p>
                <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
                  {asset.category.toUpperCase()}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Export native 3D geometry with embedded PBR materials, FEA diagnostic tolerances, and bounding coordinates for CAD and XR engines.
              </p>
            </div>

            {exportSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-emerald-400" />
                <span>{exportSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* GLB Option */}
              <button
                id="btn-modal-export-glb"
                disabled={isExporting !== null}
                onClick={() => handleExport('glb')}
                className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-cyan-500/10 border border-slate-700 hover:border-cyan-500/40 text-left space-y-1.5 transition-all group disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 group-hover:text-cyan-300 text-xs">
                    GLTF Binary (.glb)
                  </span>
                  {isExporting === 'glb' ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  ) : (
                    <FileCode2 className="w-4 h-4 text-cyan-400" />
                  )}
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">
                  Single-file binary with packed PBR shaders for Apple Vision Pro & Meta Quest.
                </p>
              </button>

              {/* Viewport Screenshot Option */}
              <button
                id="btn-modal-export-screenshot"
                disabled={isExporting !== null}
                onClick={handleExportScreenshot}
                className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-indigo-500/10 border border-slate-700 hover:border-indigo-500/40 text-left space-y-1.5 transition-all group disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 group-hover:text-indigo-300 text-xs">
                    Viewport Screenshot (.png)
                  </span>
                  {isExporting === 'screenshot' ? (
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-indigo-400" />
                  )}
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">
                  High-resolution raster snapshot of the current 3D WebGL camera perspective.
                </p>
              </button>

              {/* GLTF JSON Option */}
              <button
                id="btn-modal-export-gltf"
                disabled={isExporting !== null}
                onClick={() => handleExport('gltf')}
                className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-cyan-500/10 border border-slate-700 hover:border-cyan-500/40 text-left space-y-1.5 transition-all group disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 group-hover:text-cyan-300 text-xs">
                    GLTF Standard (.gltf)
                  </span>
                  {isExporting === 'gltf' ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  ) : (
                    <Layers className="w-4 h-4 text-cyan-400" />
                  )}
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">
                  JSON scene graph format compatible with WebXR, Three.js, and BabylonJS.
                </p>
              </button>

              {/* Wavefront OBJ Option */}
              <button
                id="btn-modal-export-obj"
                disabled={isExporting !== null}
                onClick={() => handleExport('obj')}
                className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-indigo-500/10 border border-slate-700 hover:border-indigo-500/40 text-left space-y-1.5 transition-all group disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 group-hover:text-indigo-300 text-xs">
                    Wavefront OBJ (.obj)
                  </span>
                  {isExporting === 'obj' ? (
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                  ) : (
                    <Box className="w-4 h-4 text-indigo-400" />
                  )}
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">
                  Universal polygon mesh format for SolidWorks, AutoCAD, Blender, and Rhino.
                </p>
              </button>

              {/* CAD Telemetry Metadata Spec */}
              <button
                id="btn-modal-export-cad-spec"
                disabled={isExporting !== null}
                onClick={() => handleExport('cad-json')}
                className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-indigo-500/10 border border-slate-700 hover:border-indigo-500/40 text-left space-y-1.5 transition-all group disabled:opacity-50 sm:col-span-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 group-hover:text-indigo-300 text-xs">
                    CAD Telemetry & BOM Spec (.json)
                  </span>
                  {isExporting === 'cad-json' ? (
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                  )}
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">
                  ISO-10303 STEP compliance descriptor, FEA stress matrix, dimensions, and Bill of Materials metadata.
                </p>
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Validated against Apple Vision Pro & Meta Quest 3 budgets.</span>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-xs text-slate-300 hover:text-white px-3 py-1 bg-slate-800 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEPLOY API MODAL */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-100 font-semibold">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span>Enterprise Spatial API Deployment</span>
              </div>
              <button
                onClick={() => setShowDeployModal(false)}
                className="text-slate-400 hover:text-slate-100 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Integrate SpatialAI Studio into autonomous robotics pipelines, digital twin dashboards, and AR/VR authoring systems via our REST & WebSocket API.
            </p>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>cURL Command</span>
                  <button
                    onClick={() => handleCopyCode(sampleCurl, 'curl')}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono text-[10px]"
                  >
                    {copiedCurl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedCurl ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                  {sampleCurl}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>TypeScript / Node.js SDK</span>
                  <button
                    onClick={() => handleCopyCode(sampleTypeScriptCode, 'ts')}
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono text-[10px]"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedCode ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-indigo-300 overflow-x-auto">
                  {sampleTypeScriptCode}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDeployModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
              >
                Close Deployment Console
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GITHUB ROADMAP MODAL */}
      {showGithubModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-100 font-semibold">
                <Github className="w-4 h-4 text-slate-200" />
                <span>SpatialAI Studio Architecture & SnT Roadmap</span>
              </div>
              <button
                onClick={() => setShowGithubModal(false)}
                className="text-slate-400 hover:text-slate-100 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <h4 className="font-semibold text-cyan-300">Research & Technology Context</h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Engineered as an autonomous spatial computing prototype for the Interdisciplinary Centre for Security, Reliability and Trust (SnT) at the University of Luxembourg.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-slate-200">Core Technical Milestones:</h4>
                <ul className="space-y-1.5 text-[11px] text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Gemini 2.5 Flash Server-Side Multimodal Spatial Reasoning Engine</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>WebGL 2.0 / Three.js 60+ FPS Procedural Assembly Synthesis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>WebXR Immersive VR Spatial Environment & Telemetry Layer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Interactive 3D Caliper Ruler & Precision CAD Measurement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Full-Stack Undo/Redo State History & Camera Navigation Stack</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowGithubModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
