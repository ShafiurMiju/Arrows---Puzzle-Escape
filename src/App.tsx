import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { fontSize, fontWeight, palette, radius, spacing } from './constants';

// Keep the native splash visible until the app has finished its initial work.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore — splash may already be hidden in dev */
});

/**
 * Root component. In Phase 1 it renders a themed placeholder that proves the
 * toolchain, providers, theme, and splash flow all work end-to-end.
 *
 * Later phases replace the placeholder body with the navigation tree (Phase 2),
 * and use this same boot sequence to preload fonts, hydrate the persisted
 * stores, and warm up audio/ads before hiding the splash.
 */
export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Nothing async to load yet. Future phases await store hydration, fonts,
    // and service initialization here before flipping `isReady`.
    setIsReady(true);
  }, []);

  const onLayoutRootView = useCallback(async () => {
    // The view carrying this callback only mounts once `isReady` is true, so
    // the splash hides exactly when the first real frame has been laid out.
    await SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} onLayout={onLayoutRootView}>
          <StatusBar style="light" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PHASE 1 · FOUNDATION READY</Text>
          </View>
          <Text style={styles.title}>Arrows</Text>
          <Text style={styles.subtitle}>Puzzle Escape</Text>
          <Text style={styles.hint}>
            Project scaffold, type system, theme, and service ports are in place.
            Navigation and screens arrive in Phase 2.
          </Text>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: palette.background,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: palette.surfaceElevated,
    marginBottom: spacing.xl,
  },
  badgeText: {
    color: palette.textSecondary,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
    letterSpacing: 1,
  },
  title: {
    color: palette.textPrimary,
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
  },
  subtitle: {
    color: palette.primary,
    fontSize: fontSize.title,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.xs,
  },
  hint: {
    color: palette.textMuted,
    fontSize: fontSize.body,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 22,
  },
});
