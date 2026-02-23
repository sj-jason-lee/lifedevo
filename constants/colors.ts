/**
 * Preset B — "Midnight Luxe" (Light Ivory Edition)
 * A private members' club meets a high-end watchmaker's atelier — in daylight.
 */

export const Colors = {
  // Core palette
  primary: '#FAF8F5',
  accent: '#C9A84C',
  background: '#FAF8F5',
  textDark: '#1A1A1A',

  // Light theme surfaces
  surface: '#F0EDE6',
  surfaceElevated: '#FFFFFF',
  surfaceCard: '#F5F2EB',
  surfaceMuted: '#E8E4DD',

  // Text variants
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textMuted: '#9A9A9A',
  textAccent: '#C9A84C',

  // Accent variants
  accentDim: 'rgba(201, 168, 76, 0.15)',
  accentGlow: 'rgba(201, 168, 76, 0.3)',
  accentSoft: 'rgba(201, 168, 76, 0.08)',

  // Borders
  border: 'rgba(0, 0, 0, 0.06)',
  borderAccent: 'rgba(201, 168, 76, 0.25)',

  // Overlays
  overlay: 'rgba(250, 248, 245, 0.85)',
  overlayLight: 'rgba(250, 248, 245, 0.5)',

  // Tab bar
  tabBarBackground: '#FAF8F5',
  tabBarBorder: 'rgba(0, 0, 0, 0.08)',
  tabInactive: '#B0B0B0',
  tabActive: '#C9A84C',
} as const;

export type ColorToken = keyof typeof Colors;
