import React, { useState, useEffect } from 'react';
import {
  User,
  LogIn,
  LogOut,
  Save,
  FolderOpen,
  Trash2,
  Share2,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Box,
  Layers,
  Sparkles,
  Cloud
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SpatialAsset } from '../../types';
import {
  saveAssetToFirestore,
  getUserSavedAssets,
  deleteAssetFromFirestore,
} from '../../services/assetStorage';

interface CloudLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAsset: SpatialAsset;
  onLoadAsset: (asset: SpatialAsset) => void;
  initialTab?: 'library' | 'save' | 'auth';
}

export const CloudLibraryModal: React.FC<CloudLibraryModalProps> = ({
  isOpen,
  onClose,
  currentAsset,
  onLoadAsset,
  initialTab = 'library',
}) => {
  const {
    user,
    userProfile,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOutUser,
    error,
    clearError,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'library' | 'save' | 'auth'>(initialTab);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Save State
  const [saveTitle, setSaveTitle] = useState(currentAsset.title);
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Saved Assets State
  const [savedAssets, setSavedAssets] = useState<SpatialAsset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    setSaveTitle(currentAsset.title);
  }, [currentAsset]);

  useEffect(() => {
    if (user && isOpen) {
      loadAssets();
    }
  }, [user, isOpen]);

  const loadAssets = async () => {
    if (!user) return;
    setIsLoadingAssets(true);
    try {
      const assets = await getUserSavedAssets(user.uid);
      setSavedAssets(assets);
    } catch (err) {
      console.error('Failed to load cloud assets:', err);
    } finally {
      setIsLoadingAssets(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    clearError();
    try {
      if (authMode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, displayName);
      }
      setActiveTab('library');
    } catch (err) {
      // Error handled in context
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    clearError();
    try {
      await signInWithGoogle();
      setActiveTab('library');
    } catch (err) {
      // Handled
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveCurrentAsset = async () => {
    if (!user) {
      setActiveTab('auth');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(null);
    try {
      const assetToSave = {
        ...currentAsset,
        title: saveTitle || currentAsset.title,
      };
      await saveAssetToFirestore(
        assetToSave,
        user.uid,
        userProfile?.displayName || user.displayName || 'Engineer',
        isPublic
      );
      setSaveSuccess(`Saved "${assetToSave.title}" to Cloud Firestore!`);
      await loadAssets();
      setTimeout(() => {
        setSaveSuccess(null);
        setActiveTab('library');
      }, 1500);
    } catch (err: any) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!user) return;
    try {
      await deleteAssetFromFirestore(assetId, user.uid);
      setSavedAssets((prev) => prev.filter((a) => a.id !== assetId));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-2xl w-full max-h-[85vh] shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Spatial Cloud Workspace
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Firestore & Auth
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {user ? `Signed in as ${user.email}` : 'Sign in to persist 3D CAD models across sessions'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('library')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'library'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Saved Models ({savedAssets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('save')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'save'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Current Model</span>
          </button>

          <button
            onClick={() => setActiveTab('auth')}
            className={`py-3 flex items-center gap-2 border-b-2 ml-auto transition-all ${
              activeTab === 'auth'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{user ? 'Account Profile' : 'Sign In / Register'}</span>
          </button>
        </div>

        {/* BODY CONTENT */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {/* TAB 1: SAVED ASSETS LIBRARY */}
          {activeTab === 'library' && (
            <div className="space-y-4">
              {!user ? (
                <div className="text-center py-10 space-y-3 bg-slate-950/60 rounded-xl border border-slate-800 p-6">
                  <Cloud className="w-10 h-10 text-cyan-400 mx-auto opacity-80" />
                  <h4 className="text-sm font-bold text-white">Authentication Required</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Sign in to your account to save, synchronize, and load your custom 3D parametric CAD models from Cloud Firestore.
                  </p>
                  <button
                    onClick={() => setActiveTab('auth')}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-lg transition-all shadow-lg shadow-cyan-900/30"
                  >
                    Sign In or Register
                  </button>
                </div>
              ) : isLoadingAssets ? (
                <div className="text-center py-12 space-y-2">
                  <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400 font-mono">Querying Firestore Database...</p>
                </div>
              ) : savedAssets.length === 0 ? (
                <div className="text-center py-10 space-y-3 bg-slate-950/40 rounded-xl border border-slate-800 p-6">
                  <Box className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="text-sm font-semibold text-slate-300">No Saved 3D Models Yet</h4>
                  <p className="text-xs text-slate-400">
                    Switch to the "Save Current Model" tab to save your active viewport scene to Firestore.
                  </p>
                  <button
                    onClick={() => setActiveTab('save')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-all"
                  >
                    Save Active Model
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="p-4 bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 rounded-xl space-y-3 transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {asset.title}
                          </div>
                          <div className="text-[10px] font-mono text-cyan-400 uppercase mt-0.5">
                            {asset.category}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteAsset(asset.id)}
                          title="Delete from Firestore"
                          className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {asset.description || asset.prompt}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[10px] text-slate-500 font-mono">
                        <span>{asset.annotations?.length || 0} Caliper Pins</span>
                        <button
                          onClick={() => {
                            onLoadAsset(asset);
                            onClose();
                          }}
                          className="px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded text-[10px] font-bold transition-all"
                        >
                          Load into 3D View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAVE ACTIVE MODEL */}
          {activeTab === 'save' && (
            <div className="space-y-4">
              {!user ? (
                <div className="text-center py-8 space-y-3">
                  <p className="text-xs text-slate-400">Please sign in to save this asset to your cloud profile.</p>
                  <button
                    onClick={() => setActiveTab('auth')}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg"
                  >
                    Sign In
                  </button>
                </div>
              ) : (
                <div className="space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                      Asset Title
                    </label>
                    <input
                      type="text"
                      value={saveTitle}
                      onChange={(e) => setSaveTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Category</div>
                      <div className="font-semibold text-white capitalize">{currentAsset.category}</div>
                    </div>
                    <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Active HDRI Lighting</div>
                      <div className="font-semibold text-cyan-400">{currentAsset.lighting}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Public Team Visibility</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Allow team members to inspect and load this model in their studio
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="w-4 h-4 accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {saveSuccess && (
                    <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{saveSuccess}</span>
                    </div>
                  )}

                  <button
                    disabled={isSaving}
                    onClick={handleSaveCurrentAsset}
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{isSaving ? 'Persisting to Firestore...' : 'Save to Cloud Firestore'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AUTHENTICATION & USER PROFILE */}
          {activeTab === 'auth' && (
            <div className="max-w-md mx-auto space-y-4">
              {user ? (
                <div className="space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {userProfile?.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{userProfile?.displayName || 'Engineer'}</h4>
                      <p className="text-xs text-slate-400 font-mono">{user.email}</p>
                      <span className="inline-block mt-1 text-[9px] font-mono px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded">
                        ROLE: {userProfile?.role?.toUpperCase() || 'CAD_ENGINEER'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 text-xs text-slate-400 space-y-1">
                    <div className="flex justify-between font-mono text-[10px]">
                      <span>User UID:</span>
                      <span className="text-slate-300 truncate max-w-[200px]">{user.uid}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[10px]">
                      <span>Persistence Status:</span>
                      <span className="text-emerald-400 font-bold">Cloud Connected</span>
                    </div>
                  </div>

                  <button
                    onClick={signOutUser}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all border border-slate-700"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                  <div className="flex border-b border-slate-800 gap-4 text-xs font-semibold">
                    <button
                      onClick={() => setAuthMode('signin')}
                      className={`pb-2 border-b-2 ${
                        authMode === 'signin' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setAuthMode('signup')}
                      className={`pb-2 border-b-2 ${
                        authMode === 'signup' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400'
                      }`}
                    >
                      Create Account
                    </button>
                  </div>

                  {/* Google OAuth */}
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 border border-slate-700 transition-all shadow-sm"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <div className="flex-1 h-px bg-slate-800" />
                    <span>OR EMAIL</span>
                    <div className="flex-1 h-px bg-slate-800" />
                  </div>

                  <form onSubmit={handleAuthSubmit} className="space-y-3">
                    {authMode === 'signup' && (
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase">Full Name</label>
                        <input
                          type="text"
                          required
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Dr. Alex Rivera"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="engineer@spatial.ai"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Password</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    {error && (
                      <div className="p-2.5 bg-red-950/80 border border-red-500/50 rounded-lg text-red-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-cyan-900/30 flex items-center justify-center gap-2"
                    >
                      {authLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <LogIn className="w-4 h-4" />
                      )}
                      <span>{authMode === 'signin' ? 'Sign In to Studio' : 'Create Engineering Account'}</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>End-to-End Encrypted Cloud Persistence</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
