import * as Sentry from '@sentry/react-native';

export function initSentry() {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    if (__DEV__) {
      console.warn('[Sentry] No DSN configured — skipping initialization');
    }
    return;
  }

  Sentry.init({
    dsn,
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    sendDefaultPii: false,
    enabled: !__DEV__,
    environment: __DEV__ ? 'development' : 'production',
    beforeBreadcrumb(breadcrumb) {
      // Strip Supabase API keys from network breadcrumbs
      if (breadcrumb.category === 'fetch' || breadcrumb.category === 'xhr') {
        const url = breadcrumb.data?.url as string | undefined;
        if (url) {
          breadcrumb.data = {
            ...breadcrumb.data,
            url: url.replace(/apikey=[^&]+/, 'apikey=[REDACTED]'),
          };
        }
      }
      return breadcrumb;
    },
  });
}

export { Sentry };
