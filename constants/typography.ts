/**
 * Typography tokens for Preset B — "Midnight Luxe"
 *
 * Headings: Inter (tight tracking)
 * Drama: Playfair Display Italic
 * Data: JetBrains Mono
 */

export const FontFamily = {
  heading: 'Inter_700Bold',
  headingSemiBold: 'Inter_600SemiBold',
  headingMedium: 'Inter_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  drama: 'PlayfairDisplay_400Regular_Italic',
  dramaBold: 'PlayfairDisplay_700Bold_Italic',
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
} as const;

export const TypeScale = {
  heroDramatic: {
    fontSize: 52,
    lineHeight: 52 * 1.05,
    fontFamily: FontFamily.dramaBold,
  },
  heroSans: {
    fontSize: 17,
    lineHeight: 17 * 1.4,
    fontFamily: FontFamily.heading,
    letterSpacing: 4,
    textTransform: 'uppercase' as const,
  },
  sectionHeading: {
    fontSize: 36,
    lineHeight: 36 * 1.1,
    fontFamily: FontFamily.heading,
  },
  sectionSubheading: {
    fontSize: 24,
    lineHeight: 24 * 1.2,
    fontFamily: FontFamily.headingSemiBold,
  },
  body: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: FontFamily.body,
  },
  bodyMedium: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: FontFamily.bodyMedium,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FontFamily.body,
  },
  mono: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: FontFamily.mono,
    letterSpacing: 1.5,
  },
  monoLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: FontFamily.monoMedium,
    letterSpacing: 1,
  },
  drama: {
    fontSize: 22,
    lineHeight: 22 * 1.4,
    fontFamily: FontFamily.drama,
  },
} as const;
