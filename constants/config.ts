export const Config = {
  appName: 'Pasture',

  // Border radii
  radius: {
    sm: 12,
    md: 20,
    lg: 28,
    xl: 32,
  },

  // Spacing / padding
  spacing: {
    screenHorizontal: 20,
    cardPadding: 24,
    sectionGap: 32,
    itemGap: 16,
  },

  // Animation config
  animation: {
    entrance: {
      duration: 600,
      translateY: 30,
    },
    stagger: {
      text: 100,
      card: 150,
    },
    spring: {
      damping: 12,
      stiffness: 100,
    },
    pressable: {
      scaleDown: 0.97,
      damping: 15,
      stiffness: 150,
    },
  },
} as const;
