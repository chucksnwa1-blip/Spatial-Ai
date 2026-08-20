import React, { useState, useRef, useEffect } from 'react';
import {
  User as UserIcon,
  LogIn,
  LogOut,
  Shield,
  Cloud,
  Save,
  Layers,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Settings,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SpatialAsset } from '../../types';

interface UserProfileDropdownProps {
  onOpenCloudModal: (tab?: 'library' | 'save' | 'auth') => void;
  currentAsset: SpatialAsset;
}

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({
  onOpenCloudModal,
  currentAsset,
}) => {
  const { user, userProfile, signOutUser, updateUserRole, signInWithGoogle } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'lead_architect':
        return 'Lead Architect';
      case 'viewer':
        return 'Viewer / Reviewer';
      case 'cad_engineer':
      default:
        return 'CAD Engineer';
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'lead_architect':
        return 'bg-purple-950/70 text-purple-300 border-purple-500/40';
      case 'viewer':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'cad_engineer':
      default:
        return 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40';
    }
  };

  const getUserInitials = () => {
    if (userProfile?.displayName) {
      const parts = userProfile.displayName.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return userProfile.displayName.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'EN';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {user ? (
        /* SIGNED IN USER PROFILE BUTTON */
        <button
          id="btn-user-profile-dropdown"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all ${
            isOpen
              ? 'bg-slate-800 border-cyan-500/50 text-white shadow-[0_0_12px_rgba(6,182,212,0.25)]'
              : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 hover:border-cyan-500/40 text-slate-200'
          }`}
          title="Account Profile & Cloud Settings"
        >
          {/* Avatar / Photo */}
          <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0 border border-cyan-400/40">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span>{getUserInitials()}</span>
            )}
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900 shadow-[0_0_6px_#10b981]" />
          </div>

          <div className="hidden md:flex flex-col text-left leading-none">
            <span className="text-xs font-semibold truncate max-w-[100px]">
              {userProfile?.displayName || user.email?.split('@')[0]}
            </span>
            <span className="text-[9px] font-mono text-cyan-400 mt-0.5">
              {getRoleLabel(userProfile?.role)}
            </span>
          </div>

          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
        </button>
      ) : (
        /* GUEST / SIGN IN BUTTON */
        <button
          id="btn-nav-sign-in"
          onClick={() => onOpenCloudModal('auth')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-cyan-600/90 to-indigo-600/90 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-md shadow-cyan-950/40 border border-cyan-400/30 transition-all active:scale-95"
          title="Sign In / Register with Firebase"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign In</span>
          <span className="sm:hidden">Login</span>
        </button>
      )}

      {/* DROPDOWN MENU */}
      {isOpen && user && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-cyan-500/40 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl p-3.5 z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150">
          
          {/* USER INFO HEADER */}
          <div className="flex items-start gap-3 pb-3 border-b border-slate-800">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 border-2 border-cyan-400/50 shadow-md">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>{getUserInitials()}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white truncate">
                  {userProfile?.displayName || 'CAD Engineer'}
                </h4>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${getRoleBadgeColor(userProfile?.role)}`}>
                  {getRoleLabel(userProfile?.role)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.email}</p>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-400 font-mono">
                <CheckCircle2 className="w-3 h-3" />
                <span>Cloud Firestore Synced</span>
              </div>
            </div>
          </div>

          {/* QUICK CLOUD ACTIONS */}
          <div className="space-y-1">
            <button
              id="dropdown-item-my-assets"
              onClick={() => {
                setIsOpen(false);
                onOpenCloudModal('library');
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-left"
            >
              <FolderOpen className="w-4 h-4 text-cyan-400" />
              <div className="flex-1">
                <div className="font-medium">My Cloud 3D Library</div>
                <div className="text-[10px] text-slate-500">Access saved models & telemetry</div>
              </div>
            </button>

            <button
              id="dropdown-item-save-active"
              onClick={() => {
                setIsOpen(false);
                onOpenCloudModal('save');
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-left"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              <div className="flex-1">
                <div className="font-medium">Save Active Model</div>
                <div className="text-[10px] text-slate-500 font-mono truncate max-w-[160px]">
                  "{currentAsset.title}"
                </div>
              </div>
            </button>
          </div>

          {/* ROLE SELECTOR */}
          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            <div className="text-[10px] font-mono uppercase text-slate-500 font-bold px-1">
              Engineering Role
            </div>
            <div className="grid grid-cols-3 gap-1 text-[10px]">
              {(['cad_engineer', 'lead_architect', 'viewer'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => updateUserRole(role)}
                  className={`py-1 px-1.5 rounded text-center transition-all ${
                    userProfile?.role === role
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {role === 'cad_engineer' ? 'Engineer' : role === 'lead_architect' ? 'Architect' : 'Reviewer'}
                </button>
              ))}
            </div>
          </div>

          {/* SIGN OUT BUTTON */}
          <div className="pt-2 border-t border-slate-800">
            <button
              id="btn-dropdown-sign-out"
              onClick={() => {
                setIsOpen(false);
                signOutUser();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/30 hover:border-red-700/50 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of SpatialAI</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
