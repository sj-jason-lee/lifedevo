export const colors = {
  primary: '#5C4A3A',        // Warm dark brown
  primaryLight: '#7B6B5B',
  primaryDark: '#3E3028',
  secondary: '#C8A96E',      // Warm gold
  secondaryLight: '#E0C88A',
  secondaryDark: '#A8894E',
  headerBrown: '#6B5B4B',    // Header background
  headerText: '#C8A96E',     // Gold text in header
  background: '#FAF7F2',     // Warm cream
  surface: '#FFFFFF',
  surfaceSecondary: '#F5F0E8',
  surfaceWarm: '#F0EBE0',
  text: '#2C2420',
  textSecondary: '#6B5B4B',
  textTertiary: '#9B8B7B',
  textMuted: '#B8A898',
  border: '#E8E2D8',
  borderLight: '#F0EBE0',
  error: '#C0392B',
  success: '#4A8B5C',
  warning: '#C8A96E',
  streak: '#C8A96E',         // Gold streak color
  streakBg: '#F5F0E8',
  prayerRed: '#C0392B',
  amenGold: '#C8A96E',
  thanksRed: '#E74C3C',
  prayerBlue: '#5B8DB8',    // Kept for backward compat
  amen: '#C8A96E',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  completedGreen: '#4A8B5C',
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
    lineHeight: 26,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  scripture: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 30,
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
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 1.5,
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
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
};
