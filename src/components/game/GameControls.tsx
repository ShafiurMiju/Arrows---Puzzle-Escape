import { StyleSheet, View } from 'react-native';

import { elevation, palette, spacing } from '../../constants';
import { IconButton } from '../ui/IconButton';

export interface GameControlsProps {
  isPlaying: boolean;
  canUndo: boolean;
  onPlayPause: () => void;
  onUndo: () => void;
  onRestart: () => void;
  onHint: () => void;
}

/**
 * The gameplay control bar: Undo · Restart · Play/Pause · Hint.
 *
 * In Phase 2 the handlers are wired by the Game screen as placeholders; the real
 * simulation behaviour is connected in Phase 3 (engine) and Phase 5/7.
 */
export function GameControls({
  isPlaying,
  canUndo,
  onPlayPause,
  onUndo,
  onRestart,
  onHint,
}: GameControlsProps) {
  return (
    <View style={styles.row}>
      <IconButton
        icon="undo"
        accessibilityLabel="Undo last move"
        onPress={onUndo}
        disabled={!canUndo}
      />
      <IconButton icon="restart" accessibilityLabel="Restart level" onPress={onRestart} />
      <IconButton
        icon={isPlaying ? 'pause' : 'play'}
        accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
        variant="primary"
        size={68}
        onPress={onPlayPause}
        style={styles.primary}
      />
      <IconButton icon="hint" accessibilityLabel="Show a hint" onPress={onHint} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  primary: {
    shadowColor: palette.primary,
    ...elevation.raised,
  },
});
