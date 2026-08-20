import { SpatialAsset } from '../types';

export const INITIAL_PRESETS: Record<string, SpatialAsset> = {
  bim: {
    id: 'bim-structure-01',
    title: 'Parametric Architectural BIM Core',
    category: 'bim',
    prompt: 'Parametric multi-tier commercial BIM superstructure with exposed steel lattice, modular floor plates, and rooftop microgrid canopy.',
    description: 'Enterprise building information modeling asset with seismic-resistant diagrid trusses and integrated spatial MEP channels.',
    createdAt: new Date().toISOString(),
    dimensions: {
      width: 28.5,
      height: 64.2,
      depth: 28.5,
      unit: 'm',
    },
    polygonBudget: 124000,
    complexityFactor: 1.2,
    rotationSpeed: 0.2,
    explodedOffset: 0,
    materials: {
      primaryColor: '#0ea5e9', // cyan-500
      secondaryColor: '#334155', // slate-700
      accentColor: '#38bdf8', // light cyan
      wireframeColor: '#06b6d4',
      roughness: 0.28,
      metalness: 0.82,
      opacity: 0.95,
      emissiveIntensity: 0.35,
      wireframe: false,
      clearcoat: 0.6,
      transmission: 0.1,
    },
    lighting: 'cyberpunk',
    particleDensity: 450,
    subcomponents: [
      { id: 'foundation', name: 'Reinforced Sub-Structure', type: 'box', position: [0, -1.8, 0], rotation: [0, 0, 0], scale: [2.8, 0.4, 2.8] },
      { id: 'core-column', name: 'Vertical Elevator Core', type: 'box', position: [0, 0.2, 0], rotation: [0, 0, 0], scale: [0.8, 3.6, 0.8] },
      { id: 'floor-1', name: 'Atrium Level 01', type: 'box', position: [0, -1.1, 0], rotation: [0, 0, 0], scale: [2.5, 0.15, 2.5] },
      { id: 'floor-2', name: 'Mezzanine Level 02', type: 'box', position: [0, -0.4, 0], rotation: [0, 0.2, 0], scale: [2.3, 0.15, 2.3] },
      { id: 'floor-3', name: 'Executive Level 03', type: 'box', position: [0, 0.3, 0], rotation: [0, 0.4, 0], scale: [2.1, 0.15, 2.1] },
      { id: 'floor-4', name: 'Sky Observatory', type: 'box', position: [0, 1.0, 0], rotation: [0, 0.6, 0], scale: [1.9, 0.15, 1.9] },
      { id: 'canopy', name: 'PV Solar Kinetic Canopy', type: 'torus', position: [0, 1.9, 0], rotation: [Math.PI / 2, 0, 0], scale: [1.3, 1.3, 0.1] },
      { id: 'spire', name: '5G Telecommunication Spire', type: 'cylinder', position: [0, 2.5, 0], rotation: [0, 0, 0], scale: [0.08, 1.2, 0.08] }
    ],
    annotations: [
      { id: 'ann-1', title: 'Diagrid Shear Node', description: 'ASTM A992 structural steel joint rating 345 MPa yield strength.', position: [1.2, 0.3, 1.2], type: 'structural' },
      { id: 'ann-2', title: 'Solar Canopy Array', description: 'Perovskite-silicon tandem cells generating 48 kWp capacity.', position: [0, 1.95, 0], type: 'power' },
      { id: 'ann-3', title: 'MEP Environmental Sensor', description: 'Sub-millimeter IoT vibration & air quality telemetry beacon.', position: [-1.0, -0.4, 0.8], type: 'sensor' }
    ],
    diagnostics: {
      meshDensityRating: 'Optimal XR / Tier 1',
      polygonCount: 124000,
      vertexCount: 68400,
      estimatedLatencyMs: 0.72,
      drawCalls: 18,
      memorySizeMb: 14.8,
      yieldStrengthMpa: 345,
      safetyFactor: 2.85,
      massKg: 4200000,
      volumeM3: 31200,
      centerOfGravity: [0, 12.4, 0],
      materialComposition: [
        'ASTM A992 Structural Steel (46%)',
        'C45/55 High-Performance Concrete (34%)',
        'Low-E Double Glazed Glass (14%)',
        'Anodized Architectural Aluminum (6%)'
      ],
      targetRuntimes: {
        appleVisionPro: 'Optimal',
        metaQuest3: 'Optimal',
        webXRBrowser: 'Optimal'
      },
      stressConcentrationZones: ['Level 03 Cantilever Joint', 'Diagrid Ground Anchors'],
      thermalDissipationRating: 'A+ Passivhaus Standard'
    },
    aiInsights: {
      engineeringSummary: 'High-stiffness diagrid structural matrix with optimized floor-to-envelope ratios. Dynamic parametric geometry allows rapid LOD streaming.',
      manufacturingMethod: 'Off-site Prefabricated Modular Steel Nodes & Robotic Concrete Slipforming',
      optimizationsSuggested: [
        'Decimate level 01 non-visible internal core polygons for mobile AR render passes',
        'Compress normal maps to KTX2/Basis Universal texture format',
        'Activate GPU instancing for perimeter structural facade mullions'
      ],
      complianceStandards: ['Eurocode 3 (EN 1993-1-1)', 'BIM Level 3 ISO 19650', 'LEED Platinum v4.1']
    }
  },

  drone: {
    id: 'drone-chassis-02',
    title: 'Autonomous Hexacopter Airframe',
    category: 'drone',
    prompt: 'Autonomous cybernetic heavy-lift industrial drone with 6 modular carbon fiber rotor booms, dual-axis LiDAR gimbal, and hot-swap battery bay.',
    description: 'Enterprise aerospace asset engineered for autonomous infrastructure inspection and high-payload spatial photogrammetry.',
    createdAt: new Date().toISOString(),
    dimensions: {
      width: 1.45,
      height: 0.58,
      depth: 1.45,
      unit: 'm',
    },
    polygonBudget: 96000,
    complexityFactor: 1.4,
    rotationSpeed: 0.4,
    explodedOffset: 0,
    materials: {
      primaryColor: '#6366f1', // indigo-500
      secondaryColor: '#1e293b', // slate-800
      accentColor: '#22d3ee', // cyan-400
      wireframeColor: '#818cf8',
      roughness: 0.22,
      metalness: 0.9,
      opacity: 0.98,
      emissiveIntensity: 0.5,
      wireframe: false,
      clearcoat: 0.8,
      transmission: 0.05,
    },
    lighting: 'industrial',
    particleDensity: 600,
    subcomponents: [
      { id: 'fuselage', name: 'Toray T800 Carbon Monocoque', type: 'box', position: [0, 0, 0], rotation: [0, 0, 0], scale: [1.2, 0.35, 1.2] },
      { id: 'gimbal', name: '3-Axis LiDAR Optical Dome', type: 'sphere', position: [0, -0.32, 0.2], rotation: [0, 0, 0], scale: [0.3, 0.3, 0.3] },
      { id: 'arm-1', name: 'Rotor Boom 01 (Front-L)', type: 'cylinder', position: [-0.9, 0.1, -0.6], rotation: [0, 0, Math.PI / 4], scale: [0.06, 1.1, 0.06] },
      { id: 'arm-2', name: 'Rotor Boom 02 (Front-R)', type: 'cylinder', position: [0.9, 0.1, -0.6], rotation: [0, 0, -Math.PI / 4], scale: [0.06, 1.1, 0.06] },
      { id: 'arm-3', name: 'Rotor Boom 03 (Rear-L)', type: 'cylinder', position: [-0.9, 0.1, 0.6], rotation: [0, 0, Math.PI / 4], scale: [0.06, 1.1, 0.06] },
      { id: 'arm-4', name: 'Rotor Boom 04 (Rear-R)', type: 'cylinder', position: [0.9, 0.1, 0.6], rotation: [0, 0, -Math.PI / 4], scale: [0.06, 1.1, 0.06] },
      { id: 'motor-ring-1', name: 'Brushless Stator Housing FL', type: 'torus', position: [-1.3, 0.25, -0.85], rotation: [Math.PI / 2, 0, 0], scale: [0.4, 0.4, 0.08] },
      { id: 'motor-ring-2', name: 'Brushless Stator Housing FR', type: 'torus', position: [1.3, 0.25, -0.85], rotation: [Math.PI / 2, 0, 0], scale: [0.4, 0.4, 0.08] },
      { id: 'skid-l', name: 'Titanium Landing Skid Left', type: 'cylinder', position: [-0.6, -0.45, 0], rotation: [Math.PI / 2, 0, 0], scale: [0.04, 1.4, 0.04] },
      { id: 'skid-r', name: 'Titanium Landing Skid Right', type: 'cylinder', position: [0.6, -0.45, 0], rotation: [Math.PI / 2, 0, 0], scale: [0.04, 1.4, 0.04] }
    ],
    annotations: [
      { id: 'ann-d1', title: 'Multispectral Ouster LiDAR', description: '128-channel flash LiDAR with 200m range and 0.05° angular resolution.', position: [0, -0.35, 0.25], type: 'optical' },
      { id: 'ann-d2', title: 'ESC Vector Control Unit', description: 'Silicon Carbide (SiC) MOSFET motor controller delivering 120A continuous.', position: [0, 0.18, 0], type: 'power' },
      { id: 'ann-d3', title: 'Boom Vibration Damping Ring', description: 'Viscoelastic tuned mass damper mitigating harmonic motor resonance.', position: [-1.2, 0.25, -0.8], type: 'structural' }
    ],
    diagnostics: {
      meshDensityRating: 'High-Fidelity CAD Mesh',
      polygonCount: 96000,
      vertexCount: 51200,
      estimatedLatencyMs: 0.65,
      drawCalls: 14,
      memorySizeMb: 11.2,
      yieldStrengthMpa: 820,
      safetyFactor: 3.4,
      massKg: 14.2,
      volumeM3: 0.085,
      centerOfGravity: [0, -0.04, 0.02],
      materialComposition: [
        'Torayca T800 Carbon Fiber Prepreg (58%)',
        'Titanium Grade 5 Ti-6Al-4V (22%)',
        'Aerospace 7075-T6 Aluminum (12%)',
        'Sapphire Optical Crystal (8%)'
      ],
      targetRuntimes: {
        appleVisionPro: 'Optimal',
        metaQuest3: 'Optimal',
        webXRBrowser: 'Optimal'
      },
      stressConcentrationZones: ['Boom root intersection', 'Landing skid cross-strut'],
      thermalDissipationRating: 'Active Forced Convection (IP67)'
    },
    aiInsights: {
      engineeringSummary: 'Aerodynamically profiled monocoque chassis tuned for high torsional rigidity. Hexagonal motor layout provides complete N+1 motor failure redundancy.',
      manufacturingMethod: 'Autoclave Cured Carbon Fiber Monocoque & 5-Axis CNC Milled Titanium Nodes',
      optimizationsSuggested: [
        'Apply Level of Detail (LOD) generator for rotor hub internal bolts during far-plane rendering',
        'Pre-bake ambient occlusion into vertex color channels for real-time mobile XR performance'
      ],
      complianceStandards: ['FAA Part 107 Category 3', 'EASA Special Condition Light-UAS', 'DO-160G Environmental']
    }
  },

  solar: {
    id: 'solar-microgrid-03',
    title: 'Dual-Axis Solar Microgrid Array',
    category: 'solar',
    prompt: 'Dual-axis high-efficiency bifacial solar tracking array with hydraulic elevation actuator and smart micro-inverter telemetry pod.',
    description: 'Utility-scale parametric clean energy generator featuring astronomical tracking algorithms and bifacial photovoltaic yield optimization.',
    createdAt: new Date().toISOString(),
    dimensions: {
      width: 4.8,
      height: 3.2,
      depth: 2.6,
      unit: 'm',
    },
    polygonBudget: 78000,
    complexityFactor: 1.0,
    rotationSpeed: 0.15,
    explodedOffset: 0,
    materials: {
      primaryColor: '#0284c7', // sky-600
      secondaryColor: '#475569', // slate-600
      accentColor: '#10b981', // emerald-500
      wireframeColor: '#38bdf8',
      roughness: 0.15,
      metalness: 0.85,
      opacity: 0.96,
      emissiveIntensity: 0.4,
      wireframe: false,
      clearcoat: 0.9,
      transmission: 0.05,
    },
    lighting: 'sunset',
    particleDensity: 300,
    subcomponents: [
      { id: 'pedestal', name: 'Galvanized Steel Foundation Pylon', type: 'cylinder', position: [0, -1.0, 0], rotation: [0, 0, 0], scale: [0.35, 1.8, 0.35] },
      { id: 'gimbal-hub', name: 'Dual-Axis Slew Drive Gearbox', type: 'sphere', position: [0, 0, 0], rotation: [0, 0, 0], scale: [0.6, 0.6, 0.6] },
      { id: 'torque-tube', name: 'Cold-Formed High Torque Beam', type: 'cylinder', position: [0, 0.2, 0], rotation: [0, 0, Math.PI / 2], scale: [0.18, 3.8, 0.18] },
      { id: 'panel-left', name: 'Bifacial HJT Solar Wing Left', type: 'box', position: [-1.2, 0.6, 0], rotation: [-0.4, 0, 0], scale: [1.8, 0.1, 2.2] },
      { id: 'panel-right', name: 'Bifacial HJT Solar Wing Right', type: 'box', position: [1.2, 0.6, 0], rotation: [-0.4, 0, 0], scale: [1.8, 0.1, 2.2] },
      { id: 'inverter-pod', name: 'Smart Micro-Inverter Enclosure', type: 'box', position: [0, -0.4, -0.4], rotation: [0, 0, 0], scale: [0.6, 0.4, 0.3] }
    ],
    annotations: [
      { id: 'ann-s1', title: 'Heterojunction PV Silicon', description: 'Bifacial N-type monocrystalline cells with 24.8% module efficiency rating.', position: [1.2, 0.7, 0.5], type: 'power' },
      { id: 'ann-s2', title: 'Hydraulic Slew Actuator', description: 'Harmonic drive positioning accuracy within ±0.02° solar vector alignment.', position: [0, 0.1, 0.3], type: 'structural' },
      { id: 'ann-s3', title: 'MPPT Wireless Telemetry', description: 'LoRaWAN + Zigbee grid feedback node with thermal runaway protection.', position: [0, -0.4, -0.55], type: 'sensor' }
    ],
    diagnostics: {
      meshDensityRating: 'Real-Time XR Optimal',
      polygonCount: 78000,
      vertexCount: 42000,
      estimatedLatencyMs: 0.52,
      drawCalls: 11,
      memorySizeMb: 8.4,
      yieldStrengthMpa: 275,
      safetyFactor: 3.1,
      massKg: 380,
      volumeM3: 1.45,
      centerOfGravity: [0, 0.35, -0.08],
      materialComposition: [
        'Hot-Dip Galvanized HDG Steel (62%)',
        'Photovoltaic Crystalline Silicon (21%)',
        'Anti-Reflective Tempered Glass (12%)',
        'Copper Busbar Micro-Inverter Core (5%)'
      ],
      targetRuntimes: {
        appleVisionPro: 'Optimal',
        metaQuest3: 'Optimal',
        webXRBrowser: 'Optimal'
      },
      stressConcentrationZones: ['Slew drive torque flange', 'Base pedestal anchor bolts'],
      thermalDissipationRating: 'Passive Radiative Aluminum Heat Sink'
    },
    aiInsights: {
      engineeringSummary: 'Aerodynamic wind-stow automated profile reduces drag coefficient during gale conditions (>120 km/h). Real-time irradiance tracking maximizes energy yield.',
      manufacturingMethod: 'Automated Roll-Forming Steel Beam & High-Precision Robotic Slew Assembly',
      optimizationsSuggested: [
        'Instanced geometry for silicon cell grid lines',
        'Dynamic shadow bias clamp for solar panel backface reflections'
      ],
      complianceStandards: ['IEC 61215 Terrestrial PV', 'UL 3703 Solar Trackers', 'ASCE 7-22 Wind Load']
    }
  },

  reactor: {
    id: 'reactor-core-04',
    title: 'Cybernetic Confinement Reactor',
    category: 'reactor',
    prompt: 'Concentric magnetic confinement fusion reactor with triple-axis gimbal superconductor rings and pulsing luminous plasma field.',
    description: 'Advanced experimental energy reactor featuring superconducting magnetic coils and active cryogenic cooling conduits.',
    createdAt: new Date().toISOString(),
    dimensions: {
      width: 3.6,
      height: 3.6,
      depth: 3.6,
      unit: 'm',
    },
    polygonBudget: 148000,
    complexityFactor: 1.6,
    rotationSpeed: 0.5,
    explodedOffset: 0,
    materials: {
      primaryColor: '#8b5cf6', // purple-500
      secondaryColor: '#0f172a', // slate-900
      accentColor: '#ec4899', // pink-500
      wireframeColor: '#c084fc',
      roughness: 0.18,
      metalness: 0.95,
      opacity: 0.92,
      emissiveIntensity: 0.8,
      wireframe: false,
      clearcoat: 0.9,
      transmission: 0.2,
    },
    lighting: 'space',
    particleDensity: 900,
    subcomponents: [
      { id: 'outer-ring', name: 'YBCO Superconducting Outer Gyro', type: 'torus', position: [0, 0, 0], rotation: [0, 0, 0], scale: [2.2, 2.2, 0.15] },
      { id: 'mid-ring', name: 'Helical Magnetic Shunt Ring', type: 'torus', position: [0, 0, 0], rotation: [Math.PI / 4, 0, 0], scale: [1.7, 1.7, 0.12] },
      { id: 'inner-ring', name: 'Poloidal Field Stabilizer', type: 'torus', position: [0, 0, 0], rotation: [0, Math.PI / 4, 0], scale: [1.2, 1.2, 0.1] },
      { id: 'plasma-core', name: 'Deuterium-Tritium Plasma Sphere', type: 'sphere', position: [0, 0, 0], rotation: [0, 0, 0], scale: [0.65, 0.65, 0.65] },
      { id: 'collector-t', name: 'Cryogenic Injector Top', type: 'cylinder', position: [0, 1.6, 0], rotation: [0, 0, 0], scale: [0.2, 0.9, 0.2] },
      { id: 'collector-b', name: 'Cryogenic Injector Bottom', type: 'cylinder', position: [0, -1.6, 0], rotation: [0, 0, 0], scale: [0.2, 0.9, 0.2] }
    ],
    annotations: [
      { id: 'ann-r1', title: 'High-Temperature Superconductor (HTS)', description: 'Yttrium Barium Copper Oxide tape operating at 20 Kelvin with 18 Tesla magnetic field.', position: [2.1, 0.4, 0], type: 'power' },
      { id: 'ann-r2', title: 'Plasma Confinement Chamber', description: 'Magnetic magnetic mirror topology confining 150 million °C ionization matrix.', position: [0, 0, 0.7], type: 'thermal' },
      { id: 'ann-r3', title: 'Liquid Helium Cryostat', description: 'Vacuum-insulated cryogenic jacket maintaining 4.2K operational thermal threshold.', position: [0, 1.8, 0.2], type: 'sensor' }
    ],
    diagnostics: {
      meshDensityRating: 'Dense Parametric Assembly',
      polygonCount: 148000,
      vertexCount: 82000,
      estimatedLatencyMs: 0.95,
      drawCalls: 22,
      memorySizeMb: 18.6,
      yieldStrengthMpa: 980,
      safetyFactor: 4.2,
      massKg: 18500,
      volumeM3: 7.2,
      centerOfGravity: [0, 0, 0],
      materialComposition: [
        'Inconel 718 Superalloy (45%)',
        'YBCO Superconducting Tape (28%)',
        'Beryllium Divertor Armor (18%)',
        'Liquid Helium Cryogen (9%)'
      ],
      targetRuntimes: {
        appleVisionPro: 'Optimal',
        metaQuest3: 'Warning',
        webXRBrowser: 'Optimal'
      },
      stressConcentrationZones: ['Magnetic gyro pivot bearings', 'Cryo-injector expansion bellows'],
      thermalDissipationRating: 'Closed-Loop Supercritical Helium Cryo-Cooler'
    },
    aiInsights: {
      engineeringSummary: 'Tri-axial counter-rotating magnetic coils counteract Lorentz torque forces while maintaining symmetric plasma equilibrium.',
      manufacturingMethod: 'Selective Laser Melting (SLM) Additive Superalloy Printing & Vacuum Induction Brazing',
      optimizationsSuggested: [
        'Use custom vertex shader for plasma pulsing rather than heavy geometry subdivision',
        'Implement billboard particle emitter for outer quantum emission halo'
      ],
      complianceStandards: ['ITER Nuclear Safety Standard 4.1', 'ASME Section III Nuclear Components', 'ISO 28000']
    }
  },

  lidar: {
    id: 'lidar-pod-05',
    title: 'Autonomous Subsea LiDAR Pod',
    category: 'lidar',
    prompt: 'Autonomous deep-ocean bathymetric LiDAR probe with titanium pressure hull, dome optical port, and vectored magnetic thrusters.',
    description: 'Subsea exploration instrument capable of sub-millimeter 3D spatial seabed photogrammetry up to 6,000 meters depth.',
    createdAt: new Date().toISOString(),
    dimensions: {
      width: 1.8,
      height: 1.1,
      depth: 2.2,
      unit: 'm',
    },
    polygonBudget: 84000,
    complexityFactor: 1.1,
    rotationSpeed: 0.25,
    explodedOffset: 0,
    materials: {
      primaryColor: '#059669', // emerald-600
      secondaryColor: '#1e293b',
      accentColor: '#34d399',
      wireframeColor: '#6ee7b7',
      roughness: 0.2,
      metalness: 0.88,
      opacity: 0.95,
      emissiveIntensity: 0.45,
      wireframe: false,
      clearcoat: 0.85,
      transmission: 0.15,
    },
    lighting: 'cyberpunk',
    particleDensity: 500,
    subcomponents: [
      { id: 'hull', name: 'Grade 5 Titanium Pressure Hull', type: 'cylinder', position: [0, 0, 0], rotation: [Math.PI / 2, 0, 0], scale: [0.7, 1.8, 0.7] },
      { id: 'dome', name: 'Fused Silica Optical Dome', type: 'sphere', position: [0, 0, 1.0], rotation: [0, 0, 0], scale: [0.65, 0.65, 0.65] },
      { id: 'thruster-l', name: 'Magnetic Coupling Thruster L', type: 'cylinder', position: [-0.9, 0, -0.6], rotation: [Math.PI / 2, 0, 0], scale: [0.25, 0.6, 0.25] },
      { id: 'thruster-r', name: 'Magnetic Coupling Thruster R', type: 'cylinder', position: [0.9, 0, -0.6], rotation: [Math.PI / 2, 0, 0], scale: [0.25, 0.6, 0.25] },
      { id: 'sonar-fin', name: 'Hydrodynamic Telemetry Fin', type: 'box', position: [0, 0.7, -0.4], rotation: [0, 0, 0], scale: [0.08, 0.6, 0.9] }
    ],
    annotations: [
      { id: 'ann-l1', title: '532nm Green Laser Bathymetry', description: 'Pulsed green laser optimized for high-transmittance underwater scanning.', position: [0, 0, 1.2], type: 'optical' },
      { id: 'ann-l2', title: 'Syntactic Foam Buoyancy Module', description: 'Glass microsphere matrix engineered for 60 MPa hydrostatic pressure.', position: [0, 0.5, 0], type: 'structural' },
      { id: 'ann-l3', title: 'Magnetic Vector Propulsor', description: 'Shaftless magnetic induction thruster with zero dynamic seal leak risk.', position: [-0.9, 0, -0.9], type: 'power' }
    ],
    diagnostics: {
      meshDensityRating: 'XR Hydrodynamic CAD',
      polygonCount: 84000,
      vertexCount: 46000,
      estimatedLatencyMs: 0.58,
      drawCalls: 12,
      memorySizeMb: 9.6,
      yieldStrengthMpa: 880,
      safetyFactor: 3.8,
      massKg: 120,
      volumeM3: 0.125,
      centerOfGravity: [0, -0.15, 0.05],
      materialComposition: [
        'Titanium Grade 5 Ti-6Al-4V (52%)',
        'Syntactic Epoxy Foam (24%)',
        'Corning Fused Silica Glass (16%)',
        'Neodymium N52 Magnetic Rotor (8%)'
      ],
      targetRuntimes: {
        appleVisionPro: 'Optimal',
        metaQuest3: 'Optimal',
        webXRBrowser: 'Optimal'
      },
      stressConcentrationZones: ['Dome viewport flange O-ring groove', 'Thruster bracket mounts'],
      thermalDissipationRating: 'Direct Seawater Passive Heat Exchange'
    },
    aiInsights: {
      engineeringSummary: 'Calculated for 600 bar hydrostatic pressure at abyssal depths. Modular payload bay allows rapid sensor payload interchange.',
      manufacturingMethod: 'Electron Beam Welded Titanium Forgings & Optical Precision Diamond Turning',
      optimizationsSuggested: [
        'Enable screen-space refraction for optical dome shader',
        'Generate simplified collision mesh for physics simulation passes'
      ],
      complianceStandards: ['DNV-GL Subsea Craft Standard 0042', 'ISO 13628-8 Subsea Systems']
    }
  },

  satellite: {
    id: 'satellite-bus-06',
    title: 'LEO Communications Satellite Bus',
    category: 'satellite',
    prompt: 'Low Earth Orbit microsatellite bus with deployable multi-fold solar wings, phased array antenna tile, and star tracker optics.',
    description: 'Next-generation satellite chassis designed for high-throughput LEO mesh constellation communication.',
    createdAt: new Date().toISOString(),
    dimensions: {
      width: 3.4,
      height: 1.8,
      depth: 1.2,
      unit: 'm',
    },
    polygonBudget: 110000,
    complexityFactor: 1.3,
    rotationSpeed: 0.3,
    explodedOffset: 0,
    materials: {
      primaryColor: '#eab308', // yellow-500 / gold
      secondaryColor: '#0f172a',
      accentColor: '#38bdf8',
      wireframeColor: '#fde047',
      roughness: 0.25,
      metalness: 0.92,
      opacity: 0.95,
      emissiveIntensity: 0.4,
      wireframe: false,
      clearcoat: 0.8,
      transmission: 0.05,
    },
    lighting: 'space',
    particleDensity: 700,
    subcomponents: [
      { id: 'bus-core', name: 'Hexagonal Carbon Honeycomb Core', type: 'cylinder', position: [0, 0, 0], rotation: [0, 0, 0], scale: [0.7, 1.4, 0.7] },
      { id: 'solar-l', name: 'Deployable Solar Wing Port', type: 'box', position: [-1.6, 0, 0], rotation: [0, 0.2, 0], scale: [1.8, 0.05, 0.8] },
      { id: 'solar-r', name: 'Deployable Solar Wing Starboard', type: 'box', position: [1.6, 0, 0], rotation: [0, -0.2, 0], scale: [1.8, 0.05, 0.8] },
      { id: 'antenna-dish', name: 'Ka-Band Phased Array Antenna', type: 'torus', position: [0, 0.9, 0.3], rotation: [Math.PI / 4, 0, 0], scale: [0.5, 0.5, 0.1] },
      { id: 'ion-thruster', name: 'Hall-Effect Xenon Thruster', type: 'cylinder', position: [0, -0.85, 0], rotation: [0, 0, 0], scale: [0.25, 0.3, 0.25] }
    ],
    annotations: [
      { id: 'ann-sat1', title: 'Triple-Junction GaAs Solar Cells', description: 'Gallium Arsenide space-qualified cells delivering 32% end-of-life conversion.', position: [1.6, 0.1, 0], type: 'power' },
      { id: 'ann-sat2', title: 'Star Tracker Navigation Camera', description: 'Dual autonomous star catalog sensors achieving 0.5 arcsec pointing precision.', position: [0, 0.4, 0.6], type: 'optical' },
      { id: 'ann-sat3', title: 'Hall-Effect Ion Thruster', description: 'Specific impulse of 1,800s for precision orbit maintenance and de-orbiting.', position: [0, -0.9, 0], type: 'structural' }
    ],
    diagnostics: {
      meshDensityRating: 'Space-Qualified XR Model',
      polygonCount: 110000,
      vertexCount: 60000,
      estimatedLatencyMs: 0.68,
      drawCalls: 16,
      memorySizeMb: 13.4,
      yieldStrengthMpa: 740,
      safetyFactor: 2.9,
      massKg: 180,
      volumeM3: 0.68,
      centerOfGravity: [0, 0.02, 0.01],
      materialComposition: [
        'Multi-Layer Insulation MLI Gold Mylar (38%)',
        'Aluminum-Lithium 2195 Alloy (32%)',
        'Triple-Junction Gallium Arsenide (20%)',
        'Tantalum Radiation Shielding (10%)'
      ],
      targetRuntimes: {
        appleVisionPro: 'Optimal',
        metaQuest3: 'Optimal',
        webXRBrowser: 'Optimal'
      },
      stressConcentrationZones: ['Solar wing deployment hinges', 'Launch vehicle clamp band interface'],
      thermalDissipationRating: 'Active Heat Pipe Ammonia Loop with Optical Solar Reflectors (OSR)'
    },
    aiInsights: {
      engineeringSummary: 'Thermal management optimized for high eclipse-to-sunlight temperature swings (-120°C to +150°C). Multi-layer gold insulation minimizes radiation flux.',
      manufacturingMethod: 'Additive Layer Manufacturing Titanium Nodes & Composite Honeycomb Autoclave Assembly',
      optimizationsSuggested: [
        'Apply anisotropic shader for solar panel anti-reflective coating',
        'Bake thermal radiation radiance field into roughness map channel'
      ],
      complianceStandards: ['ECSS-E-ST-32C Space Engineering', 'NASA-STD-5001 Structural Design', 'FCC LEO Orbital Debris Mitigation']
    }
  }
};
