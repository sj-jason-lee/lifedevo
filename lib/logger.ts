import { Sentry } from './sentry';

export const logger = {
  debug(...args: unknown[]) {
    if (__DEV__) {
      console.log('[DEBUG]', ...args);
    }
  },

  warn(...args: unknown[]) {
    if (__DEV__) {
      console.warn('[WARN]', ...args);
    }
    Sentry.addBreadcrumb({
      category: 'app.warn',
      message: args.map(String).join(' '),
      level: 'warning',
    });
  },

  error(error: unknown, context?: string) {
    if (__DEV__) {
      console.error('[ERROR]', context ?? '', error);
    }
    if (error instanceof Error) {
      Sentry.captureException(error, context ? { tags: { context } } : undefined);
    } else {
      Sentry.captureMessage(
        `${context ? context + ': ' : ''}${String(error)}`,
        'error',
      );
    }
  },
};
