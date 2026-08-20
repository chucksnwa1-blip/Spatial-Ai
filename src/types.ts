export type LightingPreset = 
  | 'industrial-hall'
  | 'sunlit-lab'
  | 'low-light-studio'
  | 'orbital-space'
  | 'cyberpunk-neon'
  | 'studio'
  | 'sunset'
  | 'cyberpunk'
  | 'space'
  | 'industrial';

export type PresetCategory = 
  | 'drone'
  | 'bim'
  | 'solar'
  | 'reactor'
  | 'lidar'
  | 'satellite'
  | 'custom';

export interface SpatialDimensions {
  width: number; // in meters
  height: number;
  depth: number;
  unit: string;
}

export interface MaterialProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  wireframeColor: string;
  roughness: number;
  metalness: number;
  opacity: number;
  emissiveIntensity: number;
  wireframe: boolean;
  clearcoat: number;
  transmission: number;
}

export interface StructuralDiagnostics {
  meshDensityRating: string;
  polygonCount: number;
  vertexCount: number;
  estimatedLatencyMs: number;
  drawCalls: number;
  memorySizeMb: number;
  yieldStrengthMpa: number;
  safetyFactor: number;
  massKg: number;
  volumeM3: number;
  centerOfGravity: [number, number, number];
  materialComposition: string[];
  targetRuntimes: {
    appleVisionPro: 'Optimal' | 'Warning' | 'Heavy';
    metaQuest3: 'Optimal' | 'Warning' | 'Heavy';
    webXRBrowser: 'Optimal' | 'Warning' | 'Heavy';
  };
  stressConcentrationZones: string[];
  thermalDissipationRating: string;
}

export interface SpatialSubcomponent {
  id: string;
  name: string;
  type: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color?: string;
  opacity?: number;
  wireframe?: boolean;
  children?: SpatialSubcomponent[];
}

export interface SpatialAnnotation {
  id: string;
  title: string;
  description: string;
  position: [number, number, number];
  type: 'sensor' | 'structural' | 'thermal' | 'power' | 'optical';
}

export interface SpatialAsset {
  id: string;
  title: string;
  category: PresetCategory;
  prompt: string;
  description: string;
  createdAt: string;
  dimensions: SpatialDimensions;
  polygonBudget: number; // e.g. 85000
  complexityFactor: number; // 0.1 to 2.0
  rotationSpeed: number;
  explodedOffset: number; // 0 to 1 for assembly view
  materials: MaterialProps;
  lighting: LightingPreset;
  particleDensity: number; // 100 to 2000
  subcomponents: SpatialSubcomponent[];
  annotations: SpatialAnnotation[];
  diagnostics: StructuralDiagnostics;
  aiInsights: {
    engineeringSummary: string;
    manufacturingMethod: string;
    optimizationsSuggested: string[];
    complianceStandards: string[];
  };
}

export interface RefinementMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  appliedChanges?: string[];
}

export interface ViewportCameraState {
  fov: number;
  distance: number;
  azimuth: number;
  elevation: number;
}
