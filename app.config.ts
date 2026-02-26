import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  name: 'Pasture',
  slug: 'pasture',
  owner: 'sj-jason-lee',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  scheme: 'pasture',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#FAF8F5',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.pasture.app',
    buildNumber: '1',
  },
  android: {
    package: 'com.pasture.app',
    versionCode: 1,
    permissions: ['POST_NOTIFICATIONS'],
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FAF8F5',
    },
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  updates: {
    url: 'https://u.expo.dev/4f7c89b0-3b9b-4782-adaf-bf82665acac0',
    fallbackToCacheTimeout: 0,
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-secure-store',
    'expo-web-browser',
    'expo-notifications',
    '@react-native-community/datetimepicker',
    'expo-document-picker',
    [
      '@sentry/react-native/expo',
      {
        organization: 'jason-mj',
        project: 'pasture',
      },
    ],
  ],
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    privacyUrl: 'https://YOUR_DOMAIN/privacy',
    termsUrl: 'https://YOUR_DOMAIN/terms',
    supportEmail: 'YOUR_EMAIL',
    eas: {
      projectId: '4f7c89b0-3b9b-4782-adaf-bf82665acac0',
    },
  },
});
