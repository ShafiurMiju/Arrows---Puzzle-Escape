import type { TextStyle } from 'react-native';

/** 4-pt spacing scale used for padding, margins, and gaps. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/** Corner radii for cards, tiles, and buttons. */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const fontSize = {
  caption: 12,
  body: 14,
  subtitle: 16,
  title: 20,
  heading: 28,
  display: 40,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const satisfies Record<string, TextStyle['fontWeight']>;

/** Animation durations (ms). `arrowStep` is the per-cell travel time. */
export const durations = {
  fast: 150,
  base: 250,
  slow: 400,
  arrowStep: 220,
} as const;

export const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 } as const;

/** Brand-logo badge sizes (Splash uses the larger entrance size). */
export const brandBadge = {
  md: 88,
  lg: 104,
} as const;

/** Reusable raised-surface shadow/elevation values (shadowColor stays per-surface). */
export const elevation = {
  raised: {
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
} as const;
