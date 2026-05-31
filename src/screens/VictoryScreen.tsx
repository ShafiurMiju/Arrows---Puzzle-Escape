import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { AppText, Button, Card, StarRow } from '../components';
import { palette, spacing } from '../constants';
import { getNextLevelId } from '../game/levels';
import { ads } from '../services/ads';
import { audio } from '../services/audio';
import { haptics } from '../services/haptics';
import { useProgressStore } from '../store';
import type { RootStackScreenProps } from '../navigation/types';
import { formatTime } from '../utils';

export function VictoryScreen({ navigation, route }: RootStackScreenProps<'Victory'>) {
  const { levelId, stars, moves, timeSec, score } = route.params;
  const nextLevelId = getNextLevelId(levelId);
  const completedCount = useProgressStore((s) => s.progress.completedCount);

  useEffect(() => {
    audio.playEffect('victory');
    haptics.trigger('success');
  }, []);

  // Show an interstitial (every Nth completed level, unless ads are removed)
  // as the player leaves the victory screen.
  const leaveTo = (navigate: () => void) => {
    ads.maybeShowInterstitial(completedCount);
    navigate();
  };

  return (
    <Animated.View style={styles.overlay} entering={FadeIn.duration(180)}>
      <Animated.View style={styles.cardWrap} entering={ZoomIn.duration(280)}>
        <Card elevated style={styles.card}>
          <AppText variant="heading" center>
            Level Complete!
          </AppText>

          <View style={styles.stars}>
            <StarRow count={stars} size={40} gap={10} />
          </View>

          <View style={styles.stats}>
            <Stat label="Moves" value={String(moves)} />
            <Stat label="Time" value={formatTime(timeSec)} />
            <Stat label="Score" value={String(score)} />
          </View>

          <View style={styles.actions}>
            {nextLevelId !== null ? (
              <Button
                label="Next Level"
                icon="next"
                fullWidth
                onPress={() => leaveTo(() => navigation.replace('Game', { levelId: nextLevelId }))}
              />
            ) : null}
            <Button
              label="Level Select"
              variant="secondary"
              fullWidth
              onPress={() => leaveTo(() => navigation.navigate('LevelSelect'))}
            />
          </View>
        </Card>
      </Animated.View>
    </Animated.View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="title" center>
        {value}
      </AppText>
      <AppText variant="caption" color="textSecondary" center>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: palette.overlay,
  },
  cardWrap: {
    width: '100%',
    maxWidth: 420,
  },
  card: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.lg,
  },
  stars: {
    marginVertical: spacing.xs,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignSelf: 'stretch',
  },
  stat: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  actions: {
    alignSelf: 'stretch',
    gap: spacing.md,
  },
});
