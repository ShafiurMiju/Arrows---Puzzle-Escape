import { useEffect } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from './components/ErrorBoundary';
import { palette } from './constants';
import { RootNavigator } from './navigation/RootNavigator';
import { ads } from './services/ads';
import { analytics } from './services/analytics';
import { audio } from './services/audio';
import { haptics } from './services/haptics';
import { useProgressStore, useSettingsStore } from './store';

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

  // Initialise audio once ready (after hydration), then apply persisted settings.
  useEffect(() => {
    if (!isReady) {
      return undefined;
    }
    let active = true;
    Promise.all([audio.init(), ads.init(), analytics.init()]).then(() => {
      if (!active) {
        return;
      }
      audio.setSoundEnabled(settings.soundEnabled);
      haptics.setEnabled(settings.vibrationEnabled);
      audio.setMusicEnabled(settings.musicEnabled);
      ads.setAdsRemoved(settings.removeAds);
      ads.preloadInterstitial();
      ads.preloadRewarded();
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
    ads.setAdsRemoved(settings.removeAds);
  }, [
    isReady,
    settings.soundEnabled,
    settings.vibrationEnabled,
    settings.musicEnabled,
    settings.removeAds,
  ]);

  if (!isReady) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={palette.background} />
        <ErrorBoundary>
          <RootNavigator />
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.background,
  },
});
