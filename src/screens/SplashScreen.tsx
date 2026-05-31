import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { AppText, Icon, ScreenContainer } from '../components';
import { brandBadge, palette, radius, spacing } from '../constants';
import type { RootStackScreenProps } from '../navigation/types';

const SPLASH_DURATION_MS = 1600;

/**
 * Animated logo splash. A simple entrance animation here (richer motion lands in
 * Phase 8); after a short beat it replaces itself with the Main Menu.
 */
export function SplashScreen({ navigation }: RootStackScreenProps<'Splash'>) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => navigation.replace('MainMenu'), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [navigation, opacity, scale]);

  return (
    <ScreenContainer center>
      <Animated.View style={[styles.logo, { opacity, transform: [{ scale }] }]}>
        <View style={styles.badge}>
          <Icon name="arrow" size={48} color={palette.textPrimary} />
        </View>
        <AppText variant="display" center style={styles.title}>
          Arrows
        </AppText>
        <AppText variant="subtitle" color="primary" center>
          Puzzle Escape
        </AppText>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logo: {
    alignItems: 'center',
  },
  badge: {
    width: brandBadge.lg,
    height: brandBadge.lg,
    borderRadius: radius.xl,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.xs,
  },
});
