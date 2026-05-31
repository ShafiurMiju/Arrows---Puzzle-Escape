import { StyleSheet, View } from 'react-native';

import { AppText, Button, Card, Icon } from '../components';
import { palette, radius, spacing } from '../constants';
import { FailureReason } from '../types';
import type { RootStackScreenProps } from '../navigation/types';

const REASON_TEXT: Record<FailureReason, string> = {
  [FailureReason.HitWall]: 'The arrow crashed into a wall.',
  [FailureReason.HitObstacle]: 'The arrow hit an obstacle.',
  [FailureReason.OutOfBounds]: 'The arrow flew off the board.',
  [FailureReason.InfiniteLoop]: 'The arrow got stuck in a loop.',
  [FailureReason.Stuck]: 'The arrow got stuck with nowhere to go.',
};

export function FailureScreen({ navigation, route }: RootStackScreenProps<'Failure'>) {
  const { levelId, reason } = route.params;
  const message = reason ? REASON_TEXT[reason] : 'The arrow did not reach the exit.';

  return (
    <View style={styles.overlay}>
      <Card elevated style={styles.card}>
        <View style={styles.iconWrap}>
          <Icon name="close" size={36} color={palette.danger} />
        </View>

        <AppText variant="heading" center>
          Try Again
        </AppText>
        <AppText variant="body" color="textSecondary" center>
          {message}
        </AppText>

        <View style={styles.actions}>
          <Button
            label="Retry"
            icon="restart"
            fullWidth
            onPress={() => navigation.replace('Game', { levelId })}
          />
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
    gap: spacing.md,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: palette.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  actions: {
    alignSelf: 'stretch',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});
