export const palette = {
  brand: {
    50: '#eef4ff',
    100: '#d9e6ff',
    200: '#b3ccff',
    300: '#7fa8ff',
    400: '#4a84f5',
    500: '#1f6feb',
    600: '#1859c4',
    700: '#13469c',
    800: '#0e3373',
    900: '#08204b',
  },
  neutral: {
    0: '#ffffff',
    50: '#f7f8fa',
    100: '#eef0f4',
    200: '#d8dde5',
    300: '#bac1cc',
    400: '#8e98a8',
    500: '#5f6b7f',
    600: '#414c5c',
    700: '#2b3542',
    800: '#1a2230',
    900: '#0b1220',
  },
  success: { 500: '#2c9a3a', 600: '#227b2d' },
  warning: { 500: '#f5c518', 600: '#c69a08' },
  danger: { 500: '#d0201c', 600: '#a41915' },
  dpe: {
    A: '#2c9a3a',
    B: '#68b738',
    C: '#c8d32f',
    D: '#f4d000',
    E: '#f08a1d',
    F: '#e4571b',
    G: '#d0201c',
  },
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
} as const;

export const typography = {
  size: {
    caption: 11,
    small: 12,
    body: 14,
    subtitle: 16,
    title: 20,
    headline: 24,
    display: 32,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

export const motion = {
  duration: { fast: 150, base: 250, slow: 400 },
  easing: { standard: 'ease-out' as const },
} as const;

export type Palette = typeof palette;
export type Spacing = keyof typeof spacing;
export type Radius = keyof typeof radius;
