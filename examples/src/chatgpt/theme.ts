export const theme = {
  colors: {
    bgPrimary: '#212121',
    bgSecondary: '#303030',
    bgTertiary: '#424242',
    messageSurface: '#424242',
    textPrimary: '#ececec',
    textSecondary: '#ffffffb3',
    textTertiary: '#ffffff94',
    textQuaternary: '#ffffff69',
    mainSurfaceSecondary: '#2f2f2f',
    borderXlight: '#ffffff0d',
    borderLight: '#ffffff1a',
    borderMedium: '#ffffff26',
    submitBtnBg: '#ececec',
    submitBtnText: '#212121',
    interactiveBgSecondaryHover: '#ffffff1a',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
  },

  typography: {
    body: {
      fontSize: 16,
      lineHeight: 24,
    },
    bodyLarge: {
      fontSize: 18,
      lineHeight: 28,
    },
    headerTitle: {
      fontSize: 20,
      lineHeight: 24,
      fontWeight: '600' as const,
    },
    headerSubtitle: {
      fontSize: 14,
      lineHeight: 20,
    },
  },

  animation: {
    springCommon: {
      damping: 20,
      stiffness: 300,
    },
    springFast: {
      damping: 25,
      stiffness: 400,
    },
    fadeInDuration: 700,
    slideUpDuration: 700,
  },

  layout: {
    bubbleRadius: 18,
    maxUserBubbleWidth: '70%' as const,
    userBubblePaddingH: 16,
    userBubblePaddingV: 6,
    composerRadius: 28,
    composerHeight: 56,
    composerPadding: 10,
    composerGap: 6,
    sendButtonSize: 36,
    headerHeight: 56,
    headerPadding: 8,
    headerTitleSize: 18,
  },

  shadows: {
    composer: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    header: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
  },
} as const;

export type Theme = typeof theme;
