import { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Board, GameControls, Header, ScreenContainer } from '../components';
import { spacing } from '../constants';
import { simulateGrid } from '../game/engine';
import { getSampleLevel } from '../game/levels/sampleLevels';
import { useBoard } from '../hooks';
import { LevelDefinition, SimulationStatus } from '../types';
import type { RootStackScreenProps } from '../navigation/types';

export function GameScreen({ navigation, route }: RootStackScreenProps<'Game'>) {
  const { levelId } = route.params;
  // Sample content until the Phase 6 level catalog; cycles through the samples.
  const level = useMemo(() => getSampleLevel(levelId), [levelId]);
  const { grid, moves, rotateTile, reset } = useBoard(level);
  const startedAt = useRef(Date.now());

  const handlePlay = useCallback(() => {
    // Run the Phase 3 engine on the current (player-rotated) board. Animated
    // step-by-step playback arrives in Phase 8; for now the outcome is instant.
    const result = simulateGrid(grid);
    const timeSec = Math.round((Date.now() - startedAt.current) / 1000);

    if (result.status === SimulationStatus.Won) {
      navigation.navigate('Victory', {
        levelId,
        stars: rateStars(moves, level),
        moves,
        timeSec,
        score: scoreFor(moves, timeSec),
      });
    } else {
      navigation.navigate('Failure', { levelId, reason: result.failureReason });
    }
  }, [grid, moves, level, levelId, navigation]);

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
          canUndo={false}
          onPlayPause={handlePlay}
          onUndo={() => undefined}
          onRestart={handleRestart}
          onHint={() => undefined}
        />
      </View>
    </ScreenContainer>
  );
}

// Placeholder scoring. The formal rating + scoring system lands in Phase 7.
function rateStars(moves: number, level: LevelDefinition): number {
  if (moves <= level.stars.threeStarMoves) return 3;
  if (moves <= level.stars.twoStarMoves) return 2;
  return 1;
}

function scoreFor(moves: number, timeSec: number): number {
  return Math.max(100, 1000 - moves * 50 - timeSec * 5);
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
