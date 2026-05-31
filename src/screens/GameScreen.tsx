import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppText,
  BoardPlaceholder,
  GameControls,
  Header,
  ScreenContainer,
} from '../components';
import { spacing } from '../constants';
import type { RootStackScreenProps } from '../navigation/types';

export function GameScreen({ navigation, route }: RootStackScreenProps<'Game'>) {
  const { levelId } = route.params;
  const [isPlaying, setIsPlaying] = useState(false);

  // Phase 2 placeholder: Play simulates a win so the whole navigation flow is
  // demoable end-to-end. Phase 3 swaps this for the real engine, which routes to
  // Victory or Failure based on the simulation result. Undo/Restart/Hint are
  // wired in Phases 3/7/10.
  const handlePlayPause = () => {
    setIsPlaying(true);
    navigation.navigate('Victory', {
      levelId,
      stars: 3,
      moves: 8,
      timeSec: 24,
      score: 1200,
    });
  };

  return (
    <ScreenContainer>
      <Header title={`Level ${levelId}`} onBack={() => navigation.goBack()} />

      <View style={styles.boardArea}>
        <BoardPlaceholder />
        <AppText variant="caption" color="textMuted" center style={styles.hint}>
          Tap arrow tiles to rotate them, then press Play.
        </AppText>
      </View>

      <View style={styles.controls}>
        <GameControls
          isPlaying={isPlaying}
          canUndo={false}
          onPlayPause={handlePlayPause}
          onUndo={() => undefined}
          onRestart={() => undefined}
          onHint={() => undefined}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
