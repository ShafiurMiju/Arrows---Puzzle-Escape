import { StyleSheet, View } from 'react-native';

import { AppText, Button, Icon, ScreenContainer } from '../components';
import { brandBadge, palette, radius, spacing } from '../constants';
import { useProgressStore } from '../store';
import type { RootStackScreenProps } from '../navigation/types';

export function MainMenuScreen({ navigation }: RootStackScreenProps<'MainMenu'>) {
  const currentLevelId = useProgressStore((s) => s.progress.currentLevelId);

  return (
    <ScreenContainer>
      <View style={styles.brand}>
        <View style={styles.badge}>
          <Icon name="arrow" size={40} color={palette.textPrimary} />
        </View>
        <AppText variant="display" center>
          Arrows
        </AppText>
        <AppText variant="subtitle" color="primary" center>
          Puzzle Escape
        </AppText>
      </View>

      <View style={styles.actions}>
        <Button
          label="Play"
          icon="play"
          fullWidth
          onPress={() => navigation.navigate('Game', { levelId: currentLevelId })}
        />
        <Button
          label="Levels"
          icon="grid"
          variant="secondary"
          fullWidth
          onPress={() => navigation.navigate('LevelSelect')}
        />
        <Button
          label="Achievements"
          icon="trophy"
          variant="secondary"
          fullWidth
          onPress={() => navigation.navigate('Achievements')}
        />
        <Button
          label="Settings"
          icon="settings"
          variant="secondary"
          fullWidth
          onPress={() => navigation.navigate('Settings')}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  brand: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: brandBadge.md,
    height: brandBadge.md,
    borderRadius: radius.xl,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  actions: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
});
