import { StyleSheet, View, ViewProps } from 'react-native';

import { palette, radius, spacing } from '../../constants';

export interface CardProps extends ViewProps {
  elevated?: boolean;
  padded?: boolean;
}

/** A themed surface container with consistent radius/padding. */
export function Card({ elevated = false, padded = true, style, ...rest }: CardProps) {
  return (
    <View
      {...rest}
      style={[
        styles.base,
        { backgroundColor: elevated ? palette.surfaceElevated : palette.surface },
        padded && styles.padded,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
  },
  padded: {
    padding: spacing.lg,
  },
});
