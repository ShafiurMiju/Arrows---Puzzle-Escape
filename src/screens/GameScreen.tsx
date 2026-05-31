import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  AppText,
  Board,
  type BoardGeometry,
  GameControls,
  Header,
  Icon,
  ScreenContainer,
} from '../components';
import { palette, spacing } from '../constants';
import { findStart, simulateGrid } from '../game/engine';
import { getFirstLevelId, getLevel, getLevelOrThrow } from '../game/levels';
import { computeScore, computeStars } from '../game/mechanics';
import { useBoard, useSimulationPlayback } from '../hooks';
import { audio } from '../services/audio';
import { haptics } from '../services/haptics';
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

  const [geometry, setGeometry] = useState<BoardGeometry | null>(null);
  const { status, animatedStyle, play, pause, resume, stop } = useSimulationPlayback(geometry);
  const startedAt = useRef(Date.now());

  // Stop any running playback if we leave the screen.
  useEffect(() => stop, [stop]);

  const handlePlayPause = useCallback(() => {
    if (status === 'playing') {
      pause();
      return;
    }
    if (status === 'paused') {
      resume();
      return;
    }

    // Idle → run the engine and animate the result.
    const start = findStart(grid);
    if (!start) {
      return;
    }
    const result = simulateGrid(grid);
    const movesUsed = moves;
    const playStartedAt = startedAt.current;

    play(result, { position: start.position, direction: start.direction }, () => {
      const timeSec = Math.round((Date.now() - playStartedAt) / 1000);
      if (result.status === SimulationStatus.Won) {
        const rating = { movesUsed, timeSec, thresholds: level.stars };
        const stars = computeStars(rating);
        const score = computeScore(rating);
        recordResult({ levelId, won: true, movesUsed, timeSec, stars, score });
        navigation.navigate('Victory', { levelId, stars, moves: movesUsed, timeSec, score });
      } else {
        navigation.navigate('Failure', { levelId, reason: result.failureReason });
      }
    });
  }, [status, pause, resume, play, grid, moves, level, levelId, navigation, recordResult]);

  const handleRotate = useCallback(
    (tileId: string) => {
      rotateTile(tileId);
      audio.playEffect('rotate');
      haptics.trigger('selection');
    },
    [rotateTile],
  );

  const handleRestart = useCallback(() => {
    stop();
    reset();
    startedAt.current = Date.now();
  }, [stop, reset]);

  const traveler =
    geometry !== null ? (
      <Animated.View
        style={[
          styles.traveler,
          { width: geometry.cellSize, height: geometry.cellSize },
          animatedStyle,
        ]}
      >
        <View
          style={[
            styles.travelerInner,
            {
              width: geometry.cellSize * 0.66,
              height: geometry.cellSize * 0.66,
              borderRadius: geometry.cellSize * 0.33,
            },
          ]}
        >
          <Icon name="arrow" size={Math.round(geometry.cellSize * 0.42)} color={palette.background} />
        </View>
      </Animated.View>
    ) : null;

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
        <Board
          grid={grid}
          interactive={status === 'idle'}
          onRotateTile={handleRotate}
          maxWidth={460}
          onGeometry={setGeometry}
          overlay={traveler}
        />
        <AppText variant="caption" color="textMuted" center style={styles.hint}>
          Tap arrow tiles to rotate them, then press Play.
        </AppText>
      </View>

      <View style={styles.controls}>
        <GameControls
          isPlaying={status === 'playing'}
          canUndo={canUndo && status === 'idle'}
          onPlayPause={handlePlayPause}
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
  traveler: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  travelerInner: {
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.primary,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});
