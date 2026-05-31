import { Pressable, StyleSheet, ViewStyle } from 'react-native';

import { palette, radius } from '../../constants';
import { Icon, IconName } from './Icon';

export type IconButtonVariant = 'surface' | 'primary' | 'ghost';

export interface IconButtonProps {
  icon: IconName;
  onPress?: () => void;
  accessibilityLabel: string;
  variant?: IconButtonVariant;
  size?: number;
  disabled?: boolean;
  active?: boolean;
  style?: ViewStyle;
}

const BACKGROUND: Record<IconButtonVariant, string> = {
  surface: palette.surfaceElevated,
  primary: palette.primary,
  ghost: palette.transparent,
};

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  variant = 'surface',
  size = 52,
  disabled = false,
  active = false,
  style,
}: IconButtonProps) {
  const iconColor = variant === 'primary' ? palette.textPrimary : palette.textSecondary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, selected: active }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { width: size, height: size, borderRadius: radius.md, backgroundColor: BACKGROUND[variant] },
        active && styles.active,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Icon name={icon} size={size * 0.42} color={active ? palette.primary : iconColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
  },
  active: {
    borderColor: palette.primary,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  disabled: {
    opacity: 0.35,
  },
});
