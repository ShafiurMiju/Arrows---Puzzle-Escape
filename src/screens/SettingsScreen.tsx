import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Card, Header, ScreenContainer, SettingRow } from '../components';
import { DEFAULT_SETTINGS, palette, spacing } from '../constants';
import type { RootStackScreenProps } from '../navigation/types';

export function SettingsScreen({ navigation }: RootStackScreenProps<'Settings'>) {
  // Local state for Phase 2. Phase 7 wires these to a persisted settings store,
  // and Phase 9 connects them to the audio/haptics services.
  const [music, setMusic] = useState(DEFAULT_SETTINGS.musicEnabled);
  const [sound, setSound] = useState(DEFAULT_SETTINGS.soundEnabled);
  const [vibration, setVibration] = useState(DEFAULT_SETTINGS.vibrationEnabled);

  return (
    <ScreenContainer>
      <Header title="Settings" onBack={() => navigation.goBack()} />

      <Card style={styles.card}>
        <SettingRow icon="music" label="Music" value={music} onValueChange={setMusic} />
        <View style={styles.divider} />
        <SettingRow
          icon="sound"
          label="Sound Effects"
          value={sound}
          onValueChange={setSound}
        />
        <View style={styles.divider} />
        <SettingRow
          icon="vibrate"
          label="Vibration"
          value={vibration}
          onValueChange={setVibration}
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
