import { StyleSheet, Switch, View } from 'react-native';

import { palette, spacing } from '../../constants';
import { AppText } from './AppText';
import { Icon, IconName } from './Icon';

export interface SettingRowProps {
  icon: IconName;
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

/** A labeled toggle row used by the Settings screen. */
export function SettingRow({ icon, label, value, onValueChange }: SettingRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Icon name={icon} size={22} color={palette.textSecondary} />
        <AppText variant="subtitle">{label}</AppText>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        accessibilityLabel={label}
        trackColor={{ false: palette.border, true: palette.primary }}
        thumbColor={palette.textPrimary}
        ios_backgroundColor={palette.border}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
});
