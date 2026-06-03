import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const Colors = {
  light: {
    bg: '#f8fafc',
    card: '#ffffff',
    cardMuted: '#f3f4f6',
    cardSunken: '#e5e7eb',
    ink: '#0f172a',
    inkMuted: '#475569',
    border: '#e2e8f0',
    primary: '#10b981',
    primaryDark: '#047857',
    secondary: '#f59e0b',
    secondaryDark: '#b45309',
    secondaryInk: '#78350f',
    success: '#10b981',
    danger: '#ba1a1a',
  },
  dark: {
    bg: '#0f172a',
    card: '#1e293b',
    cardMuted: '#334155',
    cardSunken: '#475569',
    ink: '#f8fafc',
    inkMuted: '#cbd5e1',
    border: '#334155',
    primary: '#34d399',
    primaryDark: '#10b981',
    secondary: '#fbbf24',
    secondaryDark: '#f59e0b',
    secondaryInk: '#fde68a',
    success: '#34d399',
    danger: '#ef4444',
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ThemeColor = keyof typeof Colors.light;

// Multi-stop background gradients. RN-only (expo-linear-gradient), so these live here
// rather than tailwind.config.js. The light `screen` gradient is the soft mint→white→mint
// wash used behind app screens; cards/content sit on top of it.
export const Gradients = {
  light: {
    // Faint mint at the bottom-left fading diagonally into a soft light-gray top-right.
    // Kept light so the bar/footer area reads white (the old stop was a saturated mint).
    screen: ['#dff2ea', '#e9f3ee', '#f2f6f9', '#f8fafc'],
    // Venue-owner counterpart: a warm amber glow fading into a warm off-white. Kept
    // fully warm end-to-end so it never muddies into green against cool grays.
    screenOwner: ['#fbe2ab', '#fbeecb', '#fdf6e8', '#fdfaf3'],
    screenLocations: [0, 0.28, 0.6, 1],
  },
  dark: {
    screen: ['#0b3b2c', '#122a3f', '#0f172a', '#0f172a'],
    screenOwner: ['#3b2e0b', '#2a1d08', '#171206', '#0f0c07'],
    screenLocations: [0, 0.28, 0.6, 1],
  },
} as const;

export const FontFamily = {
  display: 'PlusJakartaSans_800ExtraBold',
  sans: 'PlusJakartaSans_400Regular',
  sansMedium: 'PlusJakartaSans_500Medium',
  sansSemiBold: 'PlusJakartaSans_600SemiBold',
  sansBold: 'PlusJakartaSans_700Bold',
  sansExtraBold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const TypographyStyles: Record<string, TextStyle> = {
  'display-lg': {
    fontFamily: FontFamily.display,
    fontSize: 48,
    lineHeight: 53,
    letterSpacing: 0.96,
  },
  'headline-lg': {
    fontFamily: FontFamily.display,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: 0.32,
  },
  'headline-md': {
    fontFamily: FontFamily.display,
    fontSize: 24,
    lineHeight: 29,
  },
  'body-lg': {
    fontFamily: FontFamily.sans,
    fontSize: 18,
    lineHeight: 28,
  },
  'body-md': {
    fontFamily: FontFamily.sans,
    fontSize: 16,
    lineHeight: 24,
  },
  'label-lg': {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.16,
  },
  'label-md': {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
  },
  'label-sm': {
    fontFamily: FontFamily.sansBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.36,
    textTransform: 'uppercase',
  },
  'data-mono': {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    lineHeight: 20,
  },
};

export type TypographyVariant = keyof typeof TypographyStyles;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  page: 16,
} as const;

// Approx. height of the native bottom tab bar (excludes the safe-area inset, which is
// added on top). Used to keep scroll content + the FAB clear of the tab bar.
export const TAB_BAR_HEIGHT = Platform.select({ ios: 49, android: 64, default: 56 }) as number;

export const Radius = {
  sm: 2,
  DEFAULT: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
} as const;

export const Shadow: Record<'none' | 'sm' | 'md' | 'lg', ViewStyle> = {
  none: {},
  sm: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
};

export const TouchTarget = {
  min: 44,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
