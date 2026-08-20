import React, { useState } from 'react';
import {
  FileText,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Send,
  Copy,
  Check,
  Cpu,
  Layers,
  Activity,
  Code,
  Gauge,
  Flame,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus
} from 'lucide-react';
import { SpatialAsset, RefinementMessage, SpatialAnnotation } from '../../types';

interface InsightsPanelProps {
  asset: SpatialAsset;
  onUpdateAsset: (asset: SpatialAsset) => void;
  onRefineAsset: (prompt: string) => Promise<void>;
  isRefining: boolean;
  selectedAnnotation: SpatialAnnotation | null;
}

const QUICK_REFINEMENT_SUGGESTIONS = [
  'Add thermal camera sensors to the top rig',
  'Reinforce structural cross-braces for high wind load',
  'Optimize poly budget for Meta Quest 3 standalone',
  'Add gold MLI insulation radiation shielding'
];

export const InsightsPanel: React.FC<InsightsPanelProps> = ({
  asset,
  onUpdateAsset,
  onRefineAsset,
  isRefining,
  selectedAnnotation,
}) => {
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'refine' | 'materials' | 'code'>('diagnostics');
  const [refinementInput, setRefinementInput] = useState('');
  const [chatMessages, setChatMessages] = useState<RefinementMessage[]>([
    {
      id: 'msg-initial',
      sender: 'ai',
      text: `SpatialAI Gemini Copilot active for "${asset.title}". You can prompt refinements like adding sensors, re-calculating structural stress, or altering PBR materials.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleSendRefinement = async (textToSend?: string) => {
    const prompt = textToSend || refinementInput;
    if (!prompt.trim() || isRefining) return;

    const userMsg: RefinementMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setRefinementInput('');

    try {
      await onRefineAsset(prompt);

      const aiMsg: RefinementMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Refinement applied: incorporated "${prompt}". Recalculated FEA stress matrix and updated 3D subcomponents.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: RefinementMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `Applied simulated spatial updates for "${prompt}".`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(asset.diagnostics, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const r3fCodeSnippet = `import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

export function SpatialViewer() {
  return (
    <Canvas>
      <PerspectiveCamera makeDefault position={[4, 3.5, 4.5]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} />
      
      {/* ${asset.title} */}
      <mesh>
        <boxGeometry args={[${asset.dimensions.width}, ${asset.dimensions.height}, ${asset.dimensions.depth}]} />
        <meshStandardMaterial
          color="${asset.materials.primaryColor}"
          roughness={${asset.materials.roughness}}
          metalness={${asset.materials.metalness}}
          wireframe={${asset.materials.wireframe}}
        />
      </mesh>

      <OrbitControls />
    </Canvas>
  );
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(r3fCodeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <aside className="w-full lg:w-72 border-l border-slate-800 bg-slate-900/40 backdrop-blur-sm p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar z-20">
      {/* TAB NAVIGATION HEADER */}
      <div className="grid grid-cols-4 w-full gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 shrink-0">
        <button
          id="tab-btn-diagnostics"
          onClick={() => setActiveTab('diagnostics')}
          className={`py-1.5 text-[10px] font-bold rounded transition-all text-center ${
            activeTab === 'diagnostics'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Metrics
        </button>

        <button
          id="tab-btn-refine"
          onClick={() => setActiveTab('refine')}
          className={`py-1.5 text-[10px] font-bold rounded transition-all text-center ${
            activeTab === 'refine'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-[0_0_8px_rgba(99,102,241,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Refine
        </button>

        <button
          id="tab-btn-materials"
          onClick={() => setActiveTab('materials')}
          className={`py-1.5 text-[10px] font-bold rounded transition-all text-center ${
            activeTab === 'materials'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Shader
        </button>

        <button
          id="tab-btn-code"
          onClick={() => setActiveTab('code')}
          className={`py-1.5 text-[10px] font-bold rounded transition-all text-center ${
            activeTab === 'code'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          R3F
        </button>
      </div>

      {/* SELECTED ANNOTATION BANNER IF ACTIVE */}
      {selectedAnnotation && (
        <div className="p-3 rounded-lg bg-slate-950 border border-cyan-500/40 space-y-1 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
              {selectedAnnotation.type}
            </span>
            <span className="font-mono text-[9px] text-slate-500">
              [{selectedAnnotation.position.map((p) => p.toFixed(1)).join(', ')}]
            </span>
          </div>
          <h4 className="text-xs font-semibold text-slate-100">{selectedAnnotation.title}</h4>
          <p className="text-[10px] text-slate-400 leading-relaxed">{selectedAnnotation.description}</p>
        </div>
      )}

      {/* TAB 1: AI SPATIAL DIAGNOSTICS & FORMATTED JSON */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">
                Spatial Diagnostics
              </label>
              <button
                onClick={handleCopyJson}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono text-[9px]"
              >
                {copiedJson ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                <span>{copiedJson ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* SYNTAX HIGHLIGHTED DIAGNOSTICS JSON BOX */}
            <div className="bg-slate-950 rounded-lg p-3 font-mono text-[10px] border border-slate-800 h-[240px] overflow-auto leading-relaxed shadow-inner custom-scrollbar select-text">
              <div className="text-pink-400">{'{'}</div>
              <div className="pl-3">
                <span className="text-cyan-400">"asset_id"</span>: <span className="text-amber-400">"{asset.id.toUpperCase()}"</span>,
              </div>
              <div className="pl-3">
                <span className="text-cyan-400">"mesh_density"</span>: <span className="text-amber-400">"{(asset.diagnostics.polygonCount / 1000).toFixed(0)}k Tris"</span>,
              </div>
              <div className="pl-3">
                <span className="text-cyan-400">"yield_strength"</span>: <span className="text-amber-400">{asset.diagnostics.yieldStrengthMpa}</span>, <span className="text-slate-600">// MPa</span>
              </div>
              <div className="pl-3">
                <span className="text-cyan-400">"safety_factor"</span>: <span className="text-amber-400">{asset.diagnostics.safetyFactor}</span>,
              </div>
              <div className="pl-3">
                <span className="text-cyan-400">"latency_est"</span>: <span className="text-amber-400">"{asset.diagnostics.estimatedLatencyMs}ms"</span>,
              </div>
              <div className="pl-3">
                <span className="text-cyan-400">"mass_kg"</span>: <span className="text-amber-400">{asset.diagnostics.massKg}</span>,
              </div>
              <div className="pl-3">
                <span className="text-cyan-400">"target_runtimes"</span>: {'{'}
              </div>
              <div className="pl-6">
                <span className="text-cyan-400">"vision_pro"</span>: <span className="text-emerald-400">"{asset.diagnostics.targetRuntimes.appleVisionPro}"</span>,
              </div>
              <div className="pl-6">
                <span className="text-cyan-400">"quest_3"</span>: <span className="text-emerald-400">"{asset.diagnostics.targetRuntimes.metaQuest3}"</span>,
              </div>
              <div className="pl-6">
                <span className="text-cyan-400">"webxr"</span>: <span className="text-emerald-400">"{asset.diagnostics.targetRuntimes.webXRBrowser}"</span>
              </div>
              <div className="pl-3">{'}'}</div>
              <div className="text-pink-400">{'}'}</div>
            </div>
          </div>

          {/* REFINE LOGIC SHORTCUT CONTAINER */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">
              Refine Logic
            </label>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2 shadow-inner">
              <div
                onClick={() => handleSendRefinement('Add thermal camera sensors to the top rig')}
                className="p-2 bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500/40 rounded text-[10px] text-slate-300 italic cursor-pointer transition-colors"
              >
                "Add thermal camera sensors to the top rig"
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={refinementInput}
                  onChange={(e) => setRefinementInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendRefinement();
                  }}
                  placeholder="Type adjustment..."
                  className="flex-1 h-8 bg-slate-900 rounded px-2 text-xs text-slate-200 placeholder-slate-600 outline-none border border-slate-800 focus:border-indigo-500"
                />
                <button
                  disabled={isRefining || !refinementInput.trim()}
                  onClick={() => handleSendRefinement()}
                  className="w-8 h-8 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 rounded flex items-center justify-center text-slate-300 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REFINE LOGIC FULL CHAT */}
      {activeTab === 'refine' && (
        <div className="flex flex-col h-full space-y-3">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">
              Suggestions
            </label>
            <div className="space-y-1">
              {QUICK_REFINEMENT_SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSendRefinement(sug)}
                  className="w-full text-[10px] text-slate-300 bg-slate-950 hover:bg-indigo-500/10 border border-slate-800 hover:border-indigo-500/30 rounded p-2 text-left transition-all truncate"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-2 min-h-[160px] max-h-[220px] overflow-y-auto p-2 bg-slate-950 rounded-lg border border-slate-800 custom-scrollbar">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-2 rounded text-[11px] space-y-1 ${
                  msg.sender === 'user'
                    ? 'bg-cyan-950/70 border border-cyan-500/30 text-cyan-100 ml-4'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 mr-2'
                }`}
              >
                <div className="flex items-center justify-between text-[9px] text-slate-500">
                  <span className="font-semibold text-cyan-400">{msg.sender === 'user' ? 'You' : 'Copilot'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            ))}
            {isRefining && (
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] flex items-center gap-1.5 text-cyan-300 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Synthesizing adjustment...</span>
              </div>
            )}
          </div>

          <div className="flex gap-1.5">
            <input
              type="text"
              value={refinementInput}
              onChange={(e) => setRefinementInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendRefinement();
              }}
              placeholder="Refine 3D model..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
            />
            <button
              disabled={isRefining || !refinementInput.trim()}
              onClick={() => handleSendRefinement()}
              className="px-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded text-xs font-semibold flex items-center justify-center transition-colors"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: PBR MATERIALS */}
      {activeTab === 'materials' && (
        <div className="space-y-3">
          <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">
            PBR Properties
          </label>
          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Primary Color</span>
              <span className="font-mono text-cyan-300">{asset.materials.primaryColor}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Emissive Accent</span>
              <span className="font-mono text-indigo-300">{asset.materials.accentColor}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Roughness</span>
              <span className="font-mono text-slate-200">{asset.materials.roughness}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Metalness</span>
              <span className="font-mono text-slate-200">{asset.materials.metalness}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: R3F CODE */}
      {activeTab === 'code' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">
              React Three Fiber
            </label>
            <button
              onClick={handleCopyCode}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono text-[9px]"
            >
              {copiedCode ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-mono text-indigo-300 overflow-x-auto max-h-[300px] custom-scrollbar">
            {r3fCodeSnippet}
          </pre>
        </div>
      )}
    </aside>
  );
};
