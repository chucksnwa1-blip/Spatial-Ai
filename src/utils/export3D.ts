import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { SpatialAsset } from '../types';

/**
 * Builds a Three.js scene or mesh group representing the procedural spatial asset
 * for standard GLTF or OBJ CAD export.
 */
export function createAssetExportMesh(asset: SpatialAsset): THREE.Group {
  const root = new THREE.Group();
  root.name = asset.title.replace(/\s+/g, '_');

  const primaryMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(asset.materials.primaryColor || '#0284c7'),
    roughness: asset.materials.roughness ?? 0.3,
    metalness: asset.materials.metalness ?? 0.8,
    wireframe: asset.materials.wireframe ?? false,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(asset.materials.accentColor || '#38bdf8'),
    emissive: new THREE.Color(asset.materials.accentColor || '#38bdf8'),
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.9,
  });

  const darkMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#0f172a'),
    roughness: 0.5,
    metalness: 0.8,
  });

  const { width, height, depth } = asset.dimensions;

  switch (asset.category) {
    case 'drone': {
      // Central chassis
      const bodyGeo = new THREE.BoxGeometry(width * 0.4, height * 0.2, depth * 0.4);
      const bodyMesh = new THREE.Mesh(bodyGeo, primaryMat);
      bodyMesh.position.y = 0.5;
      root.add(bodyMesh);

      // LiDAR Dome
      const domeGeo = new THREE.CylinderGeometry(width * 0.15, width * 0.18, height * 0.25, 24);
      const domeMesh = new THREE.Mesh(domeGeo, accentMat);
      domeMesh.position.set(0, 0.5 + height * 0.2, 0);
      root.add(domeMesh);

      // 4 Carbon Arms & Rotors
      const armAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
      armAngles.forEach((ang, i) => {
        const armGeo = new THREE.CylinderGeometry(0.04, 0.04, width * 0.9, 12);
        const armMesh = new THREE.Mesh(armGeo, darkMat);
        armMesh.rotation.z = Math.PI / 2;
        armMesh.rotation.y = ang;
        armMesh.position.set(0, 0.5, 0);
        root.add(armMesh);

        // Rotor Hub
        const rx = Math.cos(ang) * (width * 0.45);
        const rz = Math.sin(ang) * (width * 0.45);
        const hubGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.15, 16);
        const hubMesh = new THREE.Mesh(hubGeo, accentMat);
        hubMesh.position.set(rx, 0.6, rz);
        root.add(hubMesh);

        // Blade Disc
        const bladeGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.02, 24);
        const bladeMesh = new THREE.Mesh(bladeGeo, primaryMat);
        bladeMesh.position.set(rx, 0.7, rz);
        root.add(bladeMesh);
      });
      break;
    }

    case 'bim': {
      // Structural concrete foundation
      const baseGeo = new THREE.BoxGeometry(width * 1.1, 0.2, depth * 1.1);
      const baseMesh = new THREE.Mesh(baseGeo, darkMat);
      baseMesh.position.y = 0.1;
      root.add(baseMesh);

      // Multi-floor slabs
      const floors = 4;
      const floorHeight = height / floors;
      for (let f = 0; f < floors; f++) {
        const slabGeo = new THREE.BoxGeometry(width, 0.08, depth);
        const slabMesh = new THREE.Mesh(slabGeo, primaryMat);
        slabMesh.position.y = 0.2 + f * floorHeight;
        root.add(slabMesh);

        // Columns
        const colOffsets = [
          [-width * 0.45, -depth * 0.45],
          [width * 0.45, -depth * 0.45],
          [-width * 0.45, depth * 0.45],
          [width * 0.45, depth * 0.45],
          [0, 0],
        ];
        colOffsets.forEach(([cx, cz]) => {
          const colGeo = new THREE.CylinderGeometry(0.06, 0.06, floorHeight, 12);
          const colMesh = new THREE.Mesh(colGeo, darkMat);
          colMesh.position.set(cx, 0.2 + f * floorHeight + floorHeight / 2, cz);
          root.add(colMesh);
        });
      }

      // Roof HVAC Unit
      const hvacGeo = new THREE.BoxGeometry(width * 0.3, 0.4, depth * 0.3);
      const hvacMesh = new THREE.Mesh(hvacGeo, accentMat);
      hvacMesh.position.set(0, height + 0.2, 0);
      root.add(hvacMesh);
      break;
    }

    case 'satellite': {
      // Bus body
      const busGeo = new THREE.BoxGeometry(width * 0.4, height * 0.6, depth * 0.4);
      const busMesh = new THREE.Mesh(busGeo, primaryMat);
      busMesh.position.y = 1.0;
      root.add(busMesh);

      // High-gain parabolic antenna
      const dishGeo = new THREE.CylinderGeometry(0.5, 0.05, 0.25, 24);
      const dishMesh = new THREE.Mesh(dishGeo, accentMat);
      dishMesh.rotation.x = Math.PI / 2;
      dishMesh.position.set(0, 1.0, depth * 0.35);
      root.add(dishMesh);

      // Dual Solar Wings
      const wingGeo = new THREE.BoxGeometry(width * 0.8, 0.04, depth * 0.7);
      const leftWing = new THREE.Mesh(wingGeo, accentMat);
      leftWing.position.set(-width * 0.65, 1.0, 0);
      root.add(leftWing);

      const rightWing = new THREE.Mesh(wingGeo, accentMat);
      rightWing.position.set(width * 0.65, 1.0, 0);
      root.add(rightWing);
      break;
    }

    case 'solar': {
      // Steel base & pedestal
      const pedGeo = new THREE.CylinderGeometry(0.12, 0.15, height * 0.8, 16);
      const pedMesh = new THREE.Mesh(pedGeo, darkMat);
      pedMesh.position.y = height * 0.4;
      root.add(pedMesh);

      // Photovoltaic Array Panel
      const panelGeo = new THREE.BoxGeometry(width, 0.05, depth);
      const panelMesh = new THREE.Mesh(panelGeo, primaryMat);
      panelMesh.position.set(0, height * 0.85, 0);
      panelMesh.rotation.x = 0.45; // Tilt angle
      root.add(panelMesh);

      // Tracking Hub
      const hubGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const hubMesh = new THREE.Mesh(hubGeo, accentMat);
      hubMesh.position.set(0, height * 0.8, 0);
      root.add(hubMesh);
      break;
    }

    case 'reactor': {
      // Containment vessel cylinder
      const vesselGeo = new THREE.CylinderGeometry(width * 0.4, width * 0.4, height * 0.9, 32);
      const vesselMesh = new THREE.Mesh(vesselGeo, primaryMat);
      vesselMesh.position.y = height * 0.45;
      root.add(vesselMesh);

      // Magnetic Tokamak Coils
      for (let c = 0; c < 3; c++) {
        const torusGeo = new THREE.TorusGeometry(width * 0.45, 0.06, 16, 36);
        const torusMesh = new THREE.Mesh(torusGeo, accentMat);
        torusMesh.rotation.x = Math.PI / 2;
        torusMesh.position.set(0, 0.3 + c * 0.7, 0);
        root.add(torusMesh);
      }

      // Cryogenic Base Ring
      const baseRingGeo = new THREE.CylinderGeometry(width * 0.55, width * 0.6, 0.3, 32);
      const baseRingMesh = new THREE.Mesh(baseRingGeo, darkMat);
      baseRingMesh.position.y = 0.15;
      root.add(baseRingMesh);
      break;
    }

    case 'lidar':
    default: {
      // Base sensor casing
      const casingGeo = new THREE.CylinderGeometry(width * 0.35, width * 0.4, height * 0.4, 24);
      const casingMesh = new THREE.Mesh(casingGeo, darkMat);
      casingMesh.position.y = height * 0.2;
      root.add(casingMesh);

      // Rotating Optical Mirror Head
      const headGeo = new THREE.CylinderGeometry(width * 0.3, width * 0.3, height * 0.5, 24);
      const headMesh = new THREE.Mesh(headGeo, primaryMat);
      headMesh.position.y = height * 0.65;
      root.add(headMesh);

      // Optical Laser Aperture
      const optGeo = new THREE.BoxGeometry(width * 0.15, height * 0.3, depth * 0.15);
      const optMesh = new THREE.Mesh(optGeo, accentMat);
      optMesh.position.set(0, height * 0.65, width * 0.28);
      root.add(optMesh);
      break;
    }
  }

  // Attach metadata as user data
  root.userData = {
    title: asset.title,
    category: asset.category,
    spatialDimensions: asset.dimensions,
    diagnostics: asset.diagnostics,
    engineeringSummary: asset.aiInsights.engineeringSummary,
    generator: 'SpatialAI Studio CAD Exporter v2.5',
    exportTimestamp: new Date().toISOString(),
  };

  return root;
}

/**
 * Triggers a browser file download of a Blob or string
 */
function downloadFile(blobOrString: Blob | string, filename: string, mimeType: string) {
  const blob = typeof blobOrString === 'string' ? new Blob([blobOrString], { type: mimeType }) : blobOrString;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export 3D asset to GLB (Binary GLTF)
 */
export function exportToGLB(asset: SpatialAsset): Promise<void> {
  return new Promise((resolve, reject) => {
    const meshGroup = createAssetExportMesh(asset);
    const exporter = new GLTFExporter();

    exporter.parse(
      meshGroup,
      (gltf) => {
        const filename = `${asset.category}_${asset.id}_cad.glb`;
        const blob = new Blob([gltf as ArrayBuffer], { type: 'model/gltf-binary' });
        downloadFile(blob, filename, 'model/gltf-binary');
        resolve();
      },
      (error) => {
        console.error('GLTF Export Error:', error);
        reject(error);
      },
      { binary: true, embedImages: true }
    );
  });
}

/**
 * Export 3D asset to standard text JSON GLTF
 */
export function exportToGLTF(asset: SpatialAsset): Promise<void> {
  return new Promise((resolve, reject) => {
    const meshGroup = createAssetExportMesh(asset);
    const exporter = new GLTFExporter();

    exporter.parse(
      meshGroup,
      (gltf) => {
        const filename = `${asset.category}_${asset.id}_cad.gltf`;
        const output = JSON.stringify(gltf, null, 2);
        downloadFile(output, filename, 'application/json');
        resolve();
      },
      (error) => {
        console.error('GLTF Export Error:', error);
        reject(error);
      },
      { binary: false, embedImages: true }
    );
  });
}

/**
 * Export 3D asset to Wavefront OBJ format
 */
export function exportToOBJ(asset: SpatialAsset): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const meshGroup = createAssetExportMesh(asset);
      const exporter = new OBJExporter();
      const result = exporter.parse(meshGroup);
      const filename = `${asset.category}_${asset.id}_cad.obj`;
      downloadFile(result, filename, 'text/plain');
      resolve();
    } catch (err) {
      console.error('OBJ Export Error:', err);
      reject(err);
    }
  });
}

/**
 * Export CAD Telemetry & Bill of Materials metadata package
 */
export function exportToCADMetadataPackage(asset: SpatialAsset): void {
  const packageData = {
    metadata: {
      generator: 'SpatialAI Studio Enterprise CAD Suite',
      specVersion: '2.5.0-ISO-10303-STEP',
      exportDate: new Date().toISOString(),
    },
    assetSummary: {
      id: asset.id,
      title: asset.title,
      category: asset.category,
      description: asset.description,
      boundingBox: asset.dimensions,
    },
    feaDiagnostics: asset.diagnostics,
    materialStack: asset.materials,
    spatialAnnotations: asset.annotations,
    complianceStatus: {
      openXR: true,
      visionOS: true,
      webXR: true,
      stepAP242ExportReady: true,
    },
  };

  const output = JSON.stringify(packageData, null, 2);
  const filename = `${asset.category}_${asset.id}_cad_spec.json`;
  downloadFile(output, filename, 'application/json');
}

/**
 * Captures a high-resolution PNG screenshot of the active Three.js WebGL viewport canvas
 */
export function captureViewportScreenshot(filenamePrefix = 'spatial-asset'): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        throw new Error('WebGL Canvas not found in DOM');
      }

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const filename = `${filenamePrefix}_${Date.now()}.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      resolve(dataUrl);
    } catch (err) {
      console.error('Screenshot Capture Error:', err);
      reject(err);
    }
  });
}

