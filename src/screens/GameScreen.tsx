import { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Board, GameControls, Header, ScreenContainer } from '../components';
import { spacing } from '../constants';
import { simulateGrid } from '../game/engine';
import { getFirstLevelId, getLevel, getLevelOrThrow } from '../game/levels';
import { computeScore, computeStars } from '../game/mechanics';
import { useBoard } from '../hooks';
import { useProgressStore } from '../store';
import { SimulationStatus } from '../types';
import type { RootStackScreenProps } from '../navigation/types';

export function GameScreen({ navigation, route }: RootStackScreenProps<'Game'>) {
  const { levelId } = route.params;
  // Load from the level catalog; fall back to the first level for any bad id.
  const level = useMemo(
    () => getLevel(levelId) ?? getLevelOrThrow(getFirstLevelId()),
    [levelId],
  );
  const { grid, moves, canUndo, rotateTile, undo, reset } = useBoard(level);
  const recordResult = useProgressStore((s) => s.recordResult);
  const startedAt = useRef(Date.now());

  const handlePlay = useCallback(() => {
    // Run the engine on the current (player-rotated) board. Animated step-by-step
    // playback arrives in Phase 8; for now the outcome is instant.
    const result = simulateGrid(grid);
    const timeSec = Math.round((Date.now() - startedAt.current) / 1000);
    const won = result.status === SimulationStatus.Won;

    if (won) {
      const rating = { movesUsed: moves, timeSec, thresholds: level.stars };
      const stars = computeStars(rating);
      const score = computeScore(rating);
      recordResult({ levelId, won: true, movesUsed: moves, timeSec, stars, score });
      navigation.navigate('Victory', { levelId, stars, moves, timeSec, score });
    } else {
      navigation.navigate('Failure', { levelId, reason: result.failureReason });
    }
  }, [grid, moves, level, levelId, navigation, recordResult]);

  const handleRestart = useCallback(() => {
    reset();
    startedAt.current = Date.now();
  }, [reset]);

  return (
    <ScreenContainer>
      <Header title={`Level ${levelId}`} onBack={() => navigation.goBack()} />

      <View style={styles.stats}>
        <AppText variant="caption" color="textSecondary">{`Moves: ${moves}`}</AppText>
        {level.name ? (
          <AppText variant="caption" color="textMuted">{level.name}</AppText>
        ) : null}
      </View>

      <View style={styles.boardArea}>
        <Board grid={grid} interactive onRotateTile={rotateTile} maxWidth={460} />
        <AppText variant="caption" color="textMuted" center style={styles.hint}>
          Tap arrow tiles to rotate them, then press Play.
        </AppText>
      </View>

      <View style={styles.controls}>
        <GameControls
          isPlaying={false}
          canUndo={canUndo}
          onPlayPause={handlePlay}
          onUndo={undo}
          onRestart={handleRestart}
          onHint={() => undefined}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  boardArea: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  hint: {
    paddingHorizontal: spacing.lg,
  },
  controls: {
    paddingVertical: spacing.xl,
  },
});
