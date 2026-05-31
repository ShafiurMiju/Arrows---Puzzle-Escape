import { StyleSheet, View } from 'react-native';

import { AppText, Card, Header, ScreenContainer, SettingRow } from '../components';
import { palette, spacing } from '../constants';
import { useSettingsStore } from '../store';
import type { RootStackScreenProps } from '../navigation/types';

export function SettingsScreen({ navigation }: RootStackScreenProps<'Settings'>) {
  // Backed by the persisted settings store. Phase 9 connects these toggles to
  // the audio/haptics services.
  const settings = useSettingsStore((s) => s.settings);
  const setMusicEnabled = useSettingsStore((s) => s.setMusicEnabled);
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled);
  const setVibrationEnabled = useSettingsStore((s) => s.setVibrationEnabled);

  return (
    <ScreenContainer>
      <Header title="Settings" onBack={() => navigation.goBack()} />

      <Card style={styles.card}>
        <SettingRow
          icon="music"
          label="Music"
          value={settings.musicEnabled}
          onValueChange={setMusicEnabled}
        />
        <View style={styles.divider} />
        <SettingRow
          icon="sound"
          label="Sound Effects"
          value={settings.soundEnabled}
          onValueChange={setSoundEnabled}
        />
        <View style={styles.divider} />
        <SettingRow
          icon="vibrate"
          label="Vibration"
          value={settings.vibrationEnabled}
          onValueChange={setVibrationEnabled}
        />
      </Card>

      <AppText variant="caption" color="textMuted" center style={styles.version}>
        Arrows – Puzzle Escape · v1.0.0
      </AppText>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.lg,
    paddingVertical: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: palette.border,
  },
  version: {
    marginTop: 'auto',
    paddingVertical: spacing.xl,
  },
});
