import { StyleSheet, View } from 'react-native';

import { palette, radius, spacing } from '../../constants';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';

/**
 * Stand-in for the puzzle board until the grid renderer lands in Phase 4.
 * Draws a faux 4×4 grid so the Game screen layout is representative.
 */
export function BoardPlaceholder() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.board}>
        {Array.from({ length: 4 }).map((_, r) => (
          <View key={r} style={styles.gridRow}>
            {Array.from({ length: 4 }).map((__, c) => (
              <View key={c} style={styles.cell} />
            ))}
          </View>
        ))}
        <View style={styles.overlay}>
          <Icon name="grid" size={28} color={palette.textMuted} />
          <AppText variant="caption" color="textMuted" center style={styles.label}>
            Puzzle grid renders in Phase 4
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
  },
  board: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 420,
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    justifyContent: 'space-between',
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cell: {
    flex: 1,
    margin: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: palette.surfaceElevated,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  label: {
    marginTop: spacing.xs,
  },
});
