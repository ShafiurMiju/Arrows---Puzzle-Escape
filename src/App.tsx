import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './navigation/RootNavigator';

// Keep the native splash visible until the navigation tree has mounted.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore — splash may already be hidden in dev */
});

/**
 * Root component: providers + navigation. The native splash hides as soon as the
 * navigator is ready, handing off to the animated JS Splash screen. Later phases
 * add font preloading, store hydration, and audio/ads warm-up to this boot path.
 */
export default function App() {
  const onNavigationReady = useCallback(() => {
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);

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
