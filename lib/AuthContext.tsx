import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { supabase } from './supabase';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import type { Session, User } from '@supabase/supabase-js';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  resendConfirmation: (email: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
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
      console.log('[OAuth] redirectTo:', redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });

      if (error) {
        console.log('[OAuth] signInWithOAuth error:', error.message);
        return { error: error.message };
      }

      console.log('[OAuth] authorize URL:', data.url);

      if (!data.url) return { error: 'No OAuth URL returned' };

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      console.log('[OAuth] browser result:', result.type, 'url' in result ? result.url : 'N/A');

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

      console.log('[OAuth] tokens found:', !!accessToken, !!refreshToken);

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
      console.log('[OAuth] unexpected error:', e.message);
      return { error: e.message ?? 'An unexpected error occurred.' };
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
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
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
