import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SpatialAsset } from '../types';

export interface CloudAssetRecord {
  id: string;
  userId: string;
  userDisplayName?: string;
  title: string;
  description: string;
  category: string;
  prompt: string;
  materials: any;
  dimensions: any;
  diagnostics: any;
  annotations: any[];
  subcomponents?: any[];
  aiInsights?: any;
  complexityFactor?: number;
  particleDensity?: number;
  lighting: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// Save asset to user's private collection & optionally public gallery
export async function saveAssetToFirestore(
  asset: SpatialAsset,
  userId: string,
  userDisplayName = 'Engineer',
  isPublic = false
): Promise<string> {
  const assetId = asset.id || `cad-${Date.now()}`;
  const now = new Date().toISOString();

  const record: CloudAssetRecord = {
    id: assetId,
    userId,
    userDisplayName,
    title: asset.title,
    description: asset.description || '',
    category: asset.category,
    prompt: asset.prompt || '',
    materials: asset.materials,
    dimensions: asset.dimensions,
    diagnostics: asset.diagnostics,
    annotations: asset.annotations || [],
    subcomponents: asset.subcomponents || [],
    aiInsights: asset.aiInsights || {
      engineeringSummary: 'Parametric CAD Model',
      manufacturingMethod: 'Additive 3D Sintering',
      optimizationsSuggested: ['Topology optimization complete'],
      complianceStandards: ['ISO-10303 STEP'],
    },
    complexityFactor: asset.complexityFactor || 1.0,
    particleDensity: asset.particleDensity || 400,
    lighting: asset.lighting || 'industrial-hall',
    isPublic,
    createdAt: asset.createdAt || now,
    updatedAt: now,
  };

  // 1. Save to user's private collection
  const userAssetRef = doc(db, 'users', userId, 'assets', assetId);
  await setDoc(userAssetRef, {
    ...record,
    serverTimestamp: serverTimestamp(),
  });

  // 2. If marked public, save to public collection
  if (isPublic) {
    const publicAssetRef = doc(db, 'publicAssets', assetId);
    await setDoc(publicAssetRef, {
      ...record,
      serverTimestamp: serverTimestamp(),
    });
  }

  return assetId;
}

// Retrieve all assets saved by current user
export async function getUserSavedAssets(userId: string): Promise<SpatialAsset[]> {
  try {
    const userAssetsRef = collection(db, 'users', userId, 'assets');
    const q = query(userAssetsRef, orderBy('updatedAt', 'desc'), limit(30));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as CloudAssetRecord;
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        category: data.category as any,
        prompt: data.prompt,
        createdAt: data.createdAt || new Date().toISOString(),
        materials: data.materials,
        dimensions: data.dimensions,
        diagnostics: data.diagnostics,
        annotations: data.annotations || [],
        subcomponents: data.subcomponents || [],
        aiInsights: data.aiInsights || {
          engineeringSummary: 'Cloud Restored CAD Model',
          manufacturingMethod: '5-Axis CNC / Direct Metal Laser',
          optimizationsSuggested: ['Cloud verified tolerance matrix'],
          complianceStandards: ['ISO-10303 STEP AP242'],
        },
        complexityFactor: data.complexityFactor || 1.0,
        particleDensity: data.particleDensity || 400,
        lighting: (data.lighting as any) || 'industrial-hall',
        polygonBudget: 45000,
        lodLevel: 'high',
        rotationSpeed: 0,
        explodedOffset: 0,
      };
    });
  } catch (err) {
    console.error('Error getting user assets:', err);
    return [];
  }
}

// Delete asset
export async function deleteAssetFromFirestore(assetId: string, userId: string): Promise<void> {
  const userAssetRef = doc(db, 'users', userId, 'assets', assetId);
  await deleteDoc(userAssetRef);
}
