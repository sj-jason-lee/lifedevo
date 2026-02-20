import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import auth, { type FirebaseAuthTypes } from '@react-native-firebase/auth';
import type { UserProfile, UserRole } from '../types';
import * as authService from '../services/authService';

type AuthContextValue = {
  user: FirebaseAuthTypes.User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function friendlyError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Prevents onAuthStateChanged from interfering during explicit sign-in flows
  const signingIn = useRef(false);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      // During explicit sign-in, let the sign-in handler manage state
      if (signingIn.current) {
        setUser(firebaseUser);
        return;
      }
      setUser(firebaseUser);
      if (firebaseUser) {
        const profile = await authService.getUserProfile(firebaseUser.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const signUp = useCallback(async (email: string, password: string, name: string, role: UserRole) => {
    try {
      setError(null);
      setLoading(true);
      signingIn.current = true;
      await authService.signUpWithEmail(email, password, name, role);
      const currentUser = auth().currentUser;
      if (currentUser) {
        setUser(currentUser);
        const profile = await authService.getUserProfile(currentUser.uid);
        setUserProfile(profile);
      }
    } catch (e: any) {
      setError(friendlyError(e.code));
      throw e;
    } finally {
      signingIn.current = false;
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      signingIn.current = true;
      await authService.signInWithEmail(email, password);
      const currentUser = auth().currentUser;
      if (currentUser) {
        setUser(currentUser);
        const profile = await authService.getUserProfile(currentUser.uid);
        setUserProfile(profile);
      }
    } catch (e: any) {
      setError(friendlyError(e.code));
      throw e;
    } finally {
      signingIn.current = false;
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async (role?: UserRole) => {
    try {
      setError(null);
      setLoading(true);
      signingIn.current = true;
      console.log('[AUTH] Starting Google sign-in...');
      await authService.signInWithGoogle(role);
      const currentUser = auth().currentUser;
      console.log('[AUTH] currentUser after Google sign-in:', currentUser?.uid);
      if (currentUser) {
        setUser(currentUser);
        const profile = await authService.getUserProfile(currentUser.uid);
        console.log('[AUTH] profile fetched:', JSON.stringify(profile));
        setUserProfile(profile);
      }
    } catch (e: any) {
      console.log('[AUTH] Google sign-in error:', e.code, e.message);
      if (e.code === 'auth/account-exists-different-role') {
        setError(e.message);
      } else if (e.code !== 'SIGN_IN_CANCELLED') {
        setError(friendlyError(e.code));
      }
      throw e;
    } finally {
      signingIn.current = false;
      setLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      setError(null);
      await authService.signOut();
    } catch (e: any) {
      setError('Failed to sign out. Please try again.');
      throw e;
    }
  }, []);

  const completeOnboarding = useCallback(async () => {
    if (!user) return;
    await authService.completeOnboarding(user.uid);
    setUserProfile((prev) => prev ? { ...prev, hasCompletedOnboarding: true } : prev);
  }, [user]);

  const resetOnboarding = useCallback(async () => {
    if (!user) return;
    await authService.resetOnboarding(user.uid);
    setUserProfile((prev) => prev ? { ...prev, hasCompletedOnboarding: false } : prev);
  }, [user]);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!user) return;
    const profile = await authService.getUserProfile(user.uid);
    setUserProfile(profile ? { ...profile, ...data } : profile);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        error,
        signUp,
        signIn,
        signInWithGoogle,
        signOut: handleSignOut,
        completeOnboarding,
        resetOnboarding,
        updateProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
