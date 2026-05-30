/**
 * Centralized dark theme. Every component reads colors from here, so we can
 * later introduce alternate palettes (light mode, white-labeled skins) without
 * editing component code. Dark is the default per the design brief.
 */

export const palette = {
  // Surfaces
  background: '#0E1116',
  surface: '#161B22',
  surfaceElevated: '#1F2630',
  border: '#2A323D',

  // Text
  textPrimary: '#F4F6F8',
  textSecondary: '#9BA6B2',
  textMuted: '#5E6B7A',

  // Brand / accents
  primary: '#5B8CFF',
  primaryDark: '#3A66D8',
  accent: '#8A6BFF',

  // Semantic
  success: '#43D08A',
  warning: '#FFC75A',
  danger: '#FF6B6B',
  star: '#FFD24A',

  // Misc
  overlay: 'rgba(8, 10, 14, 0.72)',
  transparent: 'transparent',
} as const;

/** Per-tile-type fill/glyph colors, referenced by the grid renderer (Phase 4). */
export const tileColors = {
  empty: '#1A2029',
  start: '#43D08A',
  exit: '#5B8CFF',
  wall: '#3A434F',
  arrow: '#222B36',
  arrowGlyph: '#F4F6F8',
  teleporter: '#8A6BFF',
  speed: '#FFC75A',
  rotate: '#FF9F43',
  oneWay: '#36C5C0',
  breakable: '#B07A52',
  ice: '#7FD7FF',
  switch: '#E36BFF',
} as const;

export interface Theme {
  readonly palette: typeof palette;
  readonly tileColors: typeof tileColors;
  readonly isDark: boolean;
}

export const darkTheme: Theme = {
  palette,
  tileColors,
  isDark: true,
};
