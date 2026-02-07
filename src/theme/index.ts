export const colors = {
  primary: '#4A6741',      // Forest green - spiritual, grounded
  primaryLight: '#6B8F5E',
  primaryDark: '#2F4A28',
  secondary: '#C8A96E',    // Warm gold - sacred, hopeful
  secondaryLight: '#E0C88A',
  background: '#FAFAF7',   // Warm off-white
  surface: '#FFFFFF',
  surfaceSecondary: '#F5F3EE',
  text: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textTertiary: '#9B9B9B',
  border: '#E8E5DE',
  borderLight: '#F0EDE6',
  error: '#C0392B',
  success: '#27AE60',
  warning: '#F39C12',
  streak: '#E67E22',
  prayerBlue: '#5B8DB8',
  amen: '#8E6BBF',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const typography = {
  largeTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  scripture: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 30,
    fontStyle: 'italic' as const,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  captionBold: {
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 18,
  },
  small: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};
