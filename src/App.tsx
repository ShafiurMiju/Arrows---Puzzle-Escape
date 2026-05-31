import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './navigation/RootNavigator';
import { audio } from './services/audio';
import { haptics } from './services/haptics';
import { useProgressStore, useSettingsStore } from './store';

// Keep the native splash visible until persisted state has hydrated.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore — splash may already be hidden in dev */
});

/**
 * Root component: providers + navigation. The persisted progress/settings stores
 * hydrate from AsyncStorage on launch; the native splash stays up until both are
 * ready, then hides once the navigator mounts. Later phases add font preloading
 * and audio/ads warm-up to this boot path.
 */
export default function App() {
  const progressHydrated = useProgressStore((s) => s.hasHydrated);
  const settingsHydrated = useSettingsStore((s) => s.hasHydrated);
  const settings = useSettingsStore((s) => s.settings);
  const isReady = progressHydrated && settingsHydrated;

  const onNavigationReady = useCallback(() => {
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  // Initialise audio once ready (after hydration), then apply persisted settings.
  useEffect(() => {
    if (!isReady) {
      return undefined;
    }
    let active = true;
    audio.init().then(() => {
      if (!active) {
        return;
      }
      audio.setSoundEnabled(settings.soundEnabled);
      haptics.setEnabled(settings.vibrationEnabled);
      audio.setMusicEnabled(settings.musicEnabled);
    });
    return () => {
      active = false;
    };
    // Runs once when the app becomes ready; later changes handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  // Keep the audio/haptics services in sync with settings changes.
  useEffect(() => {
    if (!isReady) {
      return;
    }
    audio.setSoundEnabled(settings.soundEnabled);
    haptics.setEnabled(settings.vibrationEnabled);
    audio.setMusicEnabled(settings.musicEnabled);
  }, [isReady, settings.soundEnabled, settings.vibrationEnabled, settings.musicEnabled]);

  if (!isReady) {
    return null; // native splash remains visible while stores hydrate
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <RootNavigator onReady={onNavigationReady} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
