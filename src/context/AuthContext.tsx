import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'lead_architect' | 'cad_engineer' | 'viewer';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  updateUserRole: (role: 'lead_architect' | 'cad_engineer' | 'viewer') => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Sync profile document with Firestore
  const syncUserProfile = async (firebaseUser: User) => {
    // Provide immediate profile for snappy UI
    const defaultProfile: UserProfile = {
      userId: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Engineer',
      photoURL: firebaseUser.photoURL || undefined,
      role: 'cad_engineer',
      createdAt: new Date().toISOString(),
    };
    setUserProfile(defaultProfile);

    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      } else {
        await setDoc(userRef, {
          ...defaultProfile,
          serverCreated: serverTimestamp(),
        });
      }
    } catch (err) {
      console.warn('Firestore profile sync note (operating with active profile):', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await syncUserProfile(firebaseUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      setError(err.message || 'Failed to sign in with Google');
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      console.error('Email sign in failed:', err);
      setError(err.message || 'Failed to sign in with Email');
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    setError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const newProfile: UserProfile = {
        userId: res.user.uid,
        email: res.user.email || email,
        displayName: name || email.split('@')[0],
        role: 'cad_engineer',
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', res.user.uid), newProfile);
      setUserProfile(newProfile);
    } catch (err: any) {
      console.error('Sign up failed:', err);
      setError(err.message || 'Failed to create account');
      throw err;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (err: any) {
      console.error('Sign out failed:', err);
    }
  };

  const updateUserRole = async (role: 'lead_architect' | 'cad_engineer' | 'viewer') => {
    if (!user) return;
    try {
      const updatedProfile: UserProfile = {
        ...(userProfile || {
          userId: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Engineer',
          createdAt: new Date().toISOString(),
        }),
        role,
      };
      setUserProfile(updatedProfile);
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { role }, { merge: true });
    } catch (err) {
      console.warn('Role update saved locally:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOutUser,
        updateUserRole,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
