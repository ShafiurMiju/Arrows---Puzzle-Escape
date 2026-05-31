import Ionicons from '@expo/vector-icons/Ionicons';

import { palette } from '../../constants';

/**
 * Semantic icon names used across the app. Mapping to a concrete icon set lives
 * here so the underlying library can be swapped in one place. `@expo/vector-icons`
 * is declared as a direct dependency (see package.json) so module resolution
 * never relies on transitive hoisting.
 */
export type IconName =
  | 'back'
  | 'close'
  | 'play'
  | 'pause'
  | 'undo'
  | 'restart'
  | 'hint'
  | 'settings'
  | 'trophy'
  | 'grid'
  | 'lock'
  | 'star'
  | 'star-outline'
  | 'next'
  | 'music'
  | 'sound'
  | 'vibrate'
  | 'check'
  | 'flag'
  | 'flash'
  | 'snow'
  | 'swap'
  | 'rotate'
  | 'oneway'
  | 'breakable'
  | 'toggle'
  | 'arrow';

const GLYPHS: Record<IconName, keyof typeof Ionicons.glyphMap> = {
  back: 'chevron-back',
  close: 'close',
  play: 'play',
  pause: 'pause',
  undo: 'arrow-undo',
  restart: 'refresh',
  hint: 'bulb',
  settings: 'settings-sharp',
  trophy: 'trophy',
  grid: 'grid',
  lock: 'lock-closed',
  star: 'star',
  'star-outline': 'star-outline',
  next: 'arrow-forward',
  music: 'musical-notes',
  sound: 'volume-high',
  vibrate: 'phone-portrait',
  check: 'checkmark',
  flag: 'flag',
  flash: 'flash',
  snow: 'snow',
  swap: 'swap-horizontal',
  rotate: 'sync',
  oneway: 'caret-forward-circle',
  breakable: 'square-outline',
  toggle: 'toggle',
  arrow: 'arrow-forward',
};

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 24, color = palette.textPrimary }: IconProps) {
  return <Ionicons name={GLYPHS[name]} size={size} color={color} />;
}
