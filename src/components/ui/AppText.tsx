import { StyleSheet, Text, TextProps } from 'react-native';

import { fontSize, fontWeight, palette } from '../../constants';

export type TextVariant =
  | 'display'
  | 'heading'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'button'
  | 'caption';

type ColorKey = keyof typeof palette;

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: ColorKey;
  center?: boolean;
}

/**
 * Theme-driven text. Every label in the app uses this so typography and color
 * stay consistent and easy to re-skin.
 */
export function AppText({
  variant = 'body',
  color = 'textPrimary',
  center = false,
  style,
  ...rest
}: AppTextProps) {
  return (
    <Text
      {...rest}
      style={[styles[variant], { color: palette[color] }, center && styles.center, style]}
    />
  );
}

const styles = StyleSheet.create({
  display: { fontSize: fontSize.display, fontWeight: fontWeight.bold, letterSpacing: 1 },
  heading: { fontSize: fontSize.heading, fontWeight: fontWeight.bold },
  title: { fontSize: fontSize.title, fontWeight: fontWeight.semibold },
  subtitle: { fontSize: fontSize.subtitle, fontWeight: fontWeight.semibold },
  body: { fontSize: fontSize.body, fontWeight: fontWeight.regular },
  button: { fontSize: fontSize.subtitle, fontWeight: fontWeight.semibold },
  caption: { fontSize: fontSize.caption, fontWeight: fontWeight.medium },
  center: { textAlign: 'center' },
});
