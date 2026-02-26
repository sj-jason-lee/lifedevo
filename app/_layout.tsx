import { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_700Bold_Italic,
} from '@expo-google-fonts/playfair-display';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { ReflectionProvider } from '../lib/ReflectionContext';
import { CompletionProvider } from '../lib/CompletionContext';
import { ReadingPlanProvider } from '../lib/ReadingPlanContext';
import { OnboardingProvider, useOnboarding } from '../lib/OnboardingContext';
import { AuthProvider, useAuth } from '../lib/AuthContext';
import { ChurchProvider } from '../lib/ChurchContext';
import { initSentry, Sentry } from '../lib/sentry';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { OfflineBanner } from '../components/ui/OfflineBanner';

initSentry();
SplashScreen.preventAutoHideAsync().catch(() => {});

function AppGate() {
  const { session, isLoading: authLoading } = useAuth();
  const { isComplete, isLoading: onboardingLoading, userName } = useOnboarding();
  const segments = useSegments();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  const isLoading = authLoading || onboardingLoading;

  useEffect(() => {
    if (isLoading) return;

    const inAuth = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';
    const hasProfile = userName.trim().length > 0;

    if (!session && !inAuth) {
      // Not signed in — send to auth welcome
      router.replace('/auth');
    } else if (session && !hasProfile && !inOnboarding && !inAuth) {
      // Signed in but no profile name — send to profile setup
      router.replace('/onboarding/name');
    } else if (session && hasProfile && (inAuth || (inOnboarding && isComplete))) {
      // Signed in with profile — send to main app
      router.replace('/');
    } else {
      setReady(true);
    }
  }, [session, isLoading, segments, userName, isComplete]);

  return (
    <ChurchProvider>
      <CompletionProvider>
        <ReflectionProvider>
          <ReadingPlanProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.primary },
              }}
            />
            {(!ready || isLoading) && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={Colors.accent} />
              </View>
            )}
          </ReadingPlanProvider>
        </ReflectionProvider>
      </CompletionProvider>
    </ChurchProvider>
  );
}

function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_700Bold_Italic,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <OfflineBanner />
        <AuthProvider>
          <OnboardingProvider>
            <AppGate />
          </OnboardingProvider>
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(RootLayout);

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
