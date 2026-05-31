import { StyleSheet, View } from 'react-native';

import { AppText, Button, Card, StarRow } from '../components';
import { palette, spacing } from '../constants';
import { getNextLevelId } from '../game/levels';
import type { RootStackScreenProps } from '../navigation/types';
import { formatTime } from '../utils';

export function VictoryScreen({ navigation, route }: RootStackScreenProps<'Victory'>) {
  const { levelId, stars, moves, timeSec, score } = route.params;
  const nextLevelId = getNextLevelId(levelId);

  return (
    <View style={styles.overlay}>
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
              onPress={() => navigation.replace('Game', { levelId: nextLevelId })}
            />
          ) : null}
          <Button
            label="Level Select"
            variant="secondary"
            fullWidth
            onPress={() => navigation.navigate('LevelSelect')}
          />
        </View>
      </Card>
    </View>
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
  card: {
    width: '100%',
    maxWidth: 420,
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
