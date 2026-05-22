import '@/global.css';

import { Platform, type TextStyle } from 'react-native';

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

export const FontFamily = {
  display: 'Anton_400Regular',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
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

export const Radius = {
  sm: 2,
  DEFAULT: 4,
  md: 6,
  lg: 8,
  xl: 12,
  full: 9999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
