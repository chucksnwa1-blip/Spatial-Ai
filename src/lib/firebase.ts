import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDocFromServer,
  setLogLevel,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Silence verbose backend polling warnings in sandboxed preview iframe
try {
  setLogLevel('error');
} catch {
  // Ignored if unsupported
}

// Initialize Firestore with force long-polling for instant connectivity inside container & iframe environments
let firestoreInstance: Firestore;
const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';

try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
    },
    databaseId
  );
} catch {
  // If already initialized, retrieve instance
  firestoreInstance = databaseId && databaseId !== '(default)'
    ? getFirestore(app, databaseId)
    : getFirestore(app);
}

export const db = firestoreInstance;

// Test connection probe as required by Firebase skill
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline cache active.');
    }
  }
}

// Execute connection test
if (typeof window !== 'undefined') {
  testConnection();
}

export default app;
