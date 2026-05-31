import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

import { palette, spacing } from '../../constants';

export interface ScreenContainerProps {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  center?: boolean;
  edges?: readonly Edge[];
  style?: ViewStyle;
}

/**
 * Standard screen frame: themed background + safe-area insets + optional scroll,
 * padding, and centering. Every screen renders inside one of these.
 */
export function ScreenContainer({
  children,
  scroll = false,
  padded = true,
  center = false,
  edges = ['top', 'bottom'],
  style,
}: ScreenContainerProps) {
  const inner: ViewStyle[] = [
    padded ? styles.padded : styles.flat,
    center ? styles.center : styles.flex,
  ];

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, padded && styles.padded, style]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[...inner, style]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.background,
  },
  flex: {
    flex: 1,
  },
  flat: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.xl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: spacing.lg,
  },
});
