import React, { useState, useEffect } from 'react';
import {
  Wand2,
  Sliders,
  Sun,
  Layers,
  Sparkles,
  RefreshCw,
  Box,
  Palette,
  Eye,
  Activity,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { SpatialAsset, LightingPreset } from '../../types';
import { INITIAL_PRESETS } from '../../data/presets';

interface ControlPanelProps {
  asset: SpatialAsset;
  onUpdateAsset: (asset: SpatialAsset) => void;
  onSelectPreset: (presetKey: string) => void;
  activePresetKey: string;
  onGenerate: (prompt: string, category: string, options: any) => Promise<void>;
  isGenerating: boolean;
  generationStep: string;
}

const LIGHTING_PRESETS: { id: LightingPreset; label: string; desc: string }[] = [
  { id: 'industrial-hall', label: 'Industrial Hall', desc: 'Steel warehouse HDR reflections' },
  { id: 'sunlit-lab', label: 'Sunlit Lab', desc: 'Warm solar daylight clarity' },
  { id: 'low-light-studio', label: 'Low-Light Studio', desc: 'High-contrast studio rim lights' },
  { id: 'orbital-space', label: 'Orbital Space', desc: 'Deep void solar glare' },
  { id: 'cyberpunk-neon', label: 'Cyberpunk Neon', desc: 'Dual cyan & magenta emission' },
];

const COLOR_PALETTES = [
  { name: 'Orbital Cyan', primary: '#0284c7', secondary: '#0369a1', accent: '#38bdf8' },
  { name: 'Thermal Gold', primary: '#d97706', secondary: '#b45309', accent: '#fbbf24' },
  { name: 'Fusion Purple', primary: '#7c3aed', secondary: '#6d28d9', accent: '#c084fc' },
  { name: 'Titanium Slate', primary: '#475569', secondary: '#334155', accent: '#94a3b8' },
  { name: 'Bio Emerald', primary: '#059669', secondary: '#047857', accent: '#34d399' },
  { name: 'Hazard Amber', primary: '#ea580c', secondary: '#c2410c', accent: '#fb923c' },
];

export const ControlPanel: React.FC<ControlPanelProps> = ({
  asset,
  onUpdateAsset,
  onSelectPreset,
  activePresetKey,
  onGenerate,
  isGenerating,
  generationStep,
}) => {
  const [promptText, setPromptText] = useState(asset.prompt);
  const [polyDensity, setPolyDensity] = useState(asset.polygonBudget);
  const [wireframeActive, setWireframeActive] = useState(asset.materials.wireframe || false);
  const [metallicVal, setMetallicVal] = useState(asset.materials.metalness ?? 0.8);
  const [roughnessVal, setRoughnessVal] = useState(asset.materials.roughness ?? 0.3);
  const [primaryColor, setPrimaryColor] = useState(asset.materials.primaryColor || '#0284c7');
  const [accentColor, setAccentColor] = useState(asset.materials.accentColor || '#38bdf8');
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>(asset.lighting);
  const [activePaletteIndex, setActivePaletteIndex] = useState(0);

  // Sync state whenever active asset updates
  useEffect(() => {
    setPromptText(asset.prompt);
    setPolyDensity(asset.polygonBudget);
    setWireframeActive(asset.materials.wireframe || false);
    setMetallicVal(asset.materials.metalness ?? 0.8);
    setRoughnessVal(asset.materials.roughness ?? 0.3);
    setPrimaryColor(asset.materials.primaryColor || '#0284c7');
    setAccentColor(asset.materials.accentColor || '#38bdf8');
    setLightingPreset(asset.lighting);
  }, [asset.id, asset.category, asset.materials]);

  const handleApplyPalette = (idx: number) => {
    setActivePaletteIndex(idx);
    const pal = COLOR_PALETTES[idx];
    setPrimaryColor(pal.primary);
    setAccentColor(pal.accent);
    onUpdateAsset({
      ...asset,
      materials: {
        ...asset.materials,
        primaryColor: pal.primary,
        secondaryColor: pal.secondary,
        accentColor: pal.accent,
        wireframeColor: pal.accent,
      },
    });
  };

  const handlePrimaryColorChange = (newColor: string) => {
    setPrimaryColor(newColor);
    onUpdateAsset({
      ...asset,
      materials: {
        ...asset.materials,
        primaryColor: newColor,
      },
    });
  };

  const handleAccentColorChange = (newColor: string) => {
    setAccentColor(newColor);
    onUpdateAsset({
      ...asset,
      materials: {
        ...asset.materials,
        accentColor: newColor,
        wireframeColor: newColor,
      },
    });
  };

  const handlePolyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setPolyDensity(val);
    onUpdateAsset({
      ...asset,
      polygonBudget: val,
      diagnostics: {
        ...asset.diagnostics,
        polygonCount: val,
        vertexCount: Math.round(val * 0.55),
        estimatedLatencyMs: +(val / 160000 + 0.3).toFixed(2),
      },
    });
  };

  const handleWireframeToggle = () => {
    const next = !wireframeActive;
    setWireframeActive(next);
    onUpdateAsset({
      ...asset,
      materials: {
        ...asset.materials,
        wireframe: next,
      },
    });
  };

  const handleMetallicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setMetallicVal(val);
    onUpdateAsset({
      ...asset,
      materials: {
        ...asset.materials,
        metalness: val,
      },
    });
  };

  const handleRoughnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setRoughnessVal(val);
    onUpdateAsset({
      ...asset,
      materials: {
        ...asset.materials,
        roughness: val,
      },
    });
  };

  const handleLightingChange = (preset: LightingPreset) => {
    setLightingPreset(preset);
    onUpdateAsset({
      ...asset,
      lighting: preset,
    });
  };

  const handleTriggerGenerate = async () => {
    if (!promptText.trim() || isGenerating) return;

    await onGenerate(promptText, activePresetKey, {
      polygonDensity: polyDensity,
      lighting: lightingPreset,
      materials: {
        metalness: metallicVal,
        roughness: roughnessVal,
        wireframe: wireframeActive,
        primaryColor,
        accentColor,
      },
    });
  };

  const polyPercentage = Math.min(100, Math.round((polyDensity / 500000) * 100));
  const presetList = Object.entries(INITIAL_PRESETS);

  return (
    <aside className="w-full lg:w-80 border-r border-slate-800 bg-slate-900/40 backdrop-blur-sm p-5 flex flex-col gap-5 overflow-y-auto custom-scrollbar z-20">
      {/* ENTERPRISE PRESET SWITCHER */}
      <div>
        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 block">
          Spatial Domain Presets
        </label>
        <div className="grid grid-cols-3 gap-2">
          {presetList.map(([key, preset]) => {
            const isSelected = activePresetKey === key;
            return (
              <button
                key={key}
                id={`preset-btn-${key}`}
                onClick={() => onSelectPreset(key)}
                className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-950/20 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="text-[9px] font-bold uppercase tracking-wider">{preset.category}</div>
                <div className="text-[11px] font-bold mt-1 truncate text-slate-200">{preset.title.split(' ')[0]}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* NATURAL LANGUAGE GENERATION STUDIO */}
      <div className="space-y-3">
        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">
          Gemini Spatial Prompt
        </label>
        <div className="relative">
          <textarea
            id="input-prompt-box"
            rows={3}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Describe an industrial spatial asset or assembly..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* PBR MATERIAL STUDIO & REAL-TIME ADJUSTMENTS */}
      <div className="space-y-4 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">
            Real-Time PBR Material Studio
          </label>
          <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            Live Sync
          </span>
        </div>

        {/* COLOR SELECTION INPUTS */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Base Material Color */}
          <div className="p-2.5 bg-slate-950/50 border border-slate-800 rounded-lg space-y-1.5">
            <div className="text-[10px] text-slate-400 font-medium">Base Color</div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => handlePrimaryColorChange(e.target.value)}
                className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer p-0.5"
                title="Choose Base PBR Color"
              />
              <span className="font-mono text-[11px] text-slate-300 uppercase">{primaryColor}</span>
            </div>
          </div>

          {/* Emissive Accent Color */}
          <div className="p-2.5 bg-slate-950/50 border border-slate-800 rounded-lg space-y-1.5">
            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <span>Emissive Glow</span>
              <Flame className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => handleAccentColorChange(e.target.value)}
                className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer p-0.5"
                title="Choose Emissive Accent Glow Color"
              />
              <span className="font-mono text-[11px] text-cyan-300 uppercase">{accentColor}</span>
            </div>
          </div>
        </div>

        {/* METALLIC & ROUGHNESS DUAL SLIDERS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-lg text-center space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Metalness</span>
              <span className="text-xs font-bold text-cyan-300 font-mono">{metallicVal.toFixed(2)}</span>
            </div>
            <input
              id="slider-metallic"
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={metallicVal}
              onChange={handleMetallicChange}
              className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-lg text-center space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Roughness</span>
              <span className="text-xs font-bold text-indigo-300 font-mono">{roughnessVal.toFixed(2)}</span>
            </div>
            <input
              id="slider-roughness"
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={roughnessVal}
              onChange={handleRoughnessChange}
              className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-indigo-400"
            />
          </div>
        </div>

        {/* WIREFRAME OVERLAY TOGGLE */}
        <div className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-800 rounded-lg">
          <span className="text-xs text-slate-300">Wireframe Mesh Shader</span>
          <button
            id="btn-wireframe-checkbox"
            onClick={handleWireframeToggle}
            className={`w-10 h-5 rounded-full relative p-0.5 transition-colors ${
              wireframeActive ? 'bg-cyan-600 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition-transform transform ${
                wireframeActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* POLYGON BUDGET & XR DENSITY */}
        <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-lg space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Polygon Budget</span>
            <span className="font-mono text-cyan-400 font-bold">{(polyDensity / 1000).toFixed(0)}k Tris</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-150"
              style={{ width: `${polyPercentage}%` }}
            />
          </div>
          <input
            id="slider-poly-density"
            type="range"
            min="10000"
            max="500000"
            step="10000"
            value={polyDensity}
            onChange={handlePolyChange}
            className="w-full h-1 bg-transparent appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* PBR PRESET PALETTES */}
        <div>
          <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 block">
            Material Theme Quick Select
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {COLOR_PALETTES.map((pal, idx) => (
              <button
                key={pal.name}
                onClick={() => handleApplyPalette(idx)}
                className={`p-1.5 rounded border text-left flex items-center gap-1.5 transition-all ${
                  activePaletteIndex === idx
                    ? 'bg-slate-800 border-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-950/50 hover:bg-slate-800/60 border-slate-800'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: pal.primary }} />
                <span className="text-[9px] text-slate-300 truncate font-medium">{pal.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* LIGHTING & ENVIRONMENT MAP SELECTION TOOL */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">
              Lighting & Environment Map
            </label>
            <span className="text-[10px] font-mono text-cyan-400">HDRI Sync</span>
          </div>
          <div className="space-y-1.5">
            {LIGHTING_PRESETS.map((lp) => {
              const isSelected = lightingPreset === lp.id;
              return (
                <button
                  key={lp.id}
                  id={`lighting-preset-${lp.id}`}
                  onClick={() => handleLightingChange(lp.id)}
                  className={`w-full p-2 rounded-lg text-left transition-all flex items-center justify-between border ${
                    isSelected
                      ? 'bg-indigo-950/40 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-950/50 hover:bg-slate-800/60 border-slate-800'
                  }`}
                >
                  <div>
                    <div className={`text-xs font-semibold ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                      {lp.label}
                    </div>
                    <div className="text-[10px] text-slate-400 leading-tight">
                      {lp.desc}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* GENERATE ASSET CTA */}
      <button
        id="btn-generate-3d"
        disabled={isGenerating}
        onClick={handleTriggerGenerate}
        className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-lg text-white font-bold text-xs shadow-xl shadow-cyan-900/20 hover:shadow-cyan-400/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 tracking-wider uppercase shrink-0"
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>{generationStep || 'SYNTHESIZING...'}</span>
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4" />
            <span>Regenerate 3D Mesh</span>
          </>
        )}
      </button>
    </aside>
  );
};
