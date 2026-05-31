import { StyleSheet, View } from 'react-native';

import { AppText, Button, Card, Header, ScreenContainer, SettingRow } from '../components';
import { palette, spacing } from '../constants';
import { useSettingsStore } from '../store';
import type { RootStackScreenProps } from '../navigation/types';

export function SettingsScreen({ navigation }: RootStackScreenProps<'Settings'>) {
  // Backed by the persisted settings store; the toggles drive the audio/haptics
  // services (Phase 9) and Remove Ads gates AdMob (Phase 10).
  const settings = useSettingsStore((s) => s.settings);
  const setMusicEnabled = useSettingsStore((s) => s.setMusicEnabled);
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled);
  const setVibrationEnabled = useSettingsStore((s) => s.setVibrationEnabled);
  const setRemoveAds = useSettingsStore((s) => s.setRemoveAds);

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

      <View style={styles.removeAds}>
        {settings.removeAds ? (
          <AppText variant="subtitle" color="success" center>
            Ads removed — thank you!
          </AppText>
        ) : (
          <Button label="Remove Ads" variant="secondary" onPress={() => setRemoveAds(true)} />
        )}
        <AppText variant="caption" color="textMuted" center style={styles.removeAdsNote}>
          {settings.removeAds
            ? 'Rewarded hints are now free.'
            : 'Removes interstitials and makes hints free. (Will become an in-app purchase.)'}
        </AppText>
      </View>

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
  removeAds: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  removeAdsNote: {
    paddingHorizontal: spacing.md,
  },
  version: {
    marginTop: 'auto',
    paddingVertical: spacing.xl,
  },
});
