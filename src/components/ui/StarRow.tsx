import { StyleSheet, View } from 'react-native';

import { palette } from '../../constants';
import { gameConfig } from '../../constants/gameConfig';
import { Icon } from './Icon';

export interface StarRowProps {
  /** Number of filled stars, 0..maxStars. */
  count: number;
  size?: number;
  gap?: number;
}

/** Renders the 3-star rating, filling `count` stars and outlining the rest. */
export function StarRow({ count, size = 24, gap = 4 }: StarRowProps) {
  const stars = Array.from({ length: gameConfig.maxStars }, (_, i) => i < count);
  return (
    <View style={[styles.row, { gap }]}>
      {stars.map((filled, i) => (
        <Icon
          key={i}
          name={filled ? 'star' : 'star-outline'}
          size={size}
          color={filled ? palette.star : palette.textMuted}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
