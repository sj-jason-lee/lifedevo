import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { makeRedirectUri } from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session, User } from '@supabase/supabase-js';
import { logger } from './logger';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  resendConfirmation: (email: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signInWithApple: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    },
    []
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string): Promise<{ error: string | null; needsConfirmation: boolean }> => {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: error.message, needsConfirmation: false };
      const needsConfirmation = data.user != null && data.session == null;
      return { error: null, needsConfirmation };
    },
    []
  );

  const resendConfirmation = useCallback(
    async (email: string): Promise<{ error: string | null }> => {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      return { error: error?.message ?? null };
    },
    []
  );

  const signInWithGoogle = useCallback(async (): Promise<{ error: string | null }> => {
    try {
      const redirectTo = makeRedirectUri({ scheme: 'pasture', path: 'auth/callback' });
      logger.debug('[OAuth] redirectTo:', redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });

      if (error) {
        logger.debug('[OAuth] signInWithOAuth error:', error.message);
        return { error: error.message };
      }

      logger.debug('[OAuth] authorize URL:', data.url);

      if (!data.url) return { error: 'No OAuth URL returned' };

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      logger.debug('[OAuth] browser result:', result.type, 'url' in result ? result.url : 'N/A');

      if (result.type !== 'success' || !('url' in result)) {
        return { error: null }; // user cancelled/dismissed
      }

      // Parse tokens safely — avoid new URL() on exp:// URIs
      const url = result.url;
      const hashIndex = url.indexOf('#');
      let accessToken: string | null = null;
      let refreshToken: string | null = null;

      if (hashIndex !== -1) {
        const hashParams = new URLSearchParams(url.substring(hashIndex + 1));
        accessToken = hashParams.get('access_token');
        refreshToken = hashParams.get('refresh_token');
      } else {
        const queryIndex = url.indexOf('?');
        if (queryIndex !== -1) {
          const queryParams = new URLSearchParams(url.substring(queryIndex + 1));
          accessToken = queryParams.get('access_token');
          refreshToken = queryParams.get('refresh_token');
        }
      }

      logger.debug('[OAuth] tokens found:', !!accessToken, !!refreshToken);

      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) return { error: sessionError.message };
      } else {
        return { error: 'Sign-in succeeded but tokens were missing from the response.' };
      }

      return { error: null };
    } catch (e: any) {
      logger.debug('[OAuth] unexpected error:', e.message);
      return { error: e.message ?? 'An unexpected error occurred.' };
    }
  }, []);

  const signInWithApple = useCallback(async (): Promise<{ error: string | null }> => {
    try {
      if (Platform.OS !== 'ios') {
        return { error: 'Apple Sign-In is only available on iOS.' };
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        return { error: 'No identity token returned from Apple.' };
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (error) return { error: error.message };
      return { error: null };
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        return { error: null }; // user cancelled
      }
      logger.debug('[AppleAuth] unexpected error:', e.message);
      return { error: e.message ?? 'An unexpected error occurred.' };
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const deleteAccount = useCallback(async (): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.rpc('delete_user');
      if (error) return { error: error.message };

      // Clear local data
      await AsyncStorage.multiRemove([
        '@pasture/onboarding',
        '@pasture/notification-settings',
      ]);

      await supabase.auth.signOut();
      return { error: null };
    } catch (e: any) {
      return { error: e.message ?? 'Failed to delete account.' };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isLoading,
        signInWithEmail,
        signUpWithEmail,
        resendConfirmation,
        signInWithGoogle,
        signInWithApple,
        signOut,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
