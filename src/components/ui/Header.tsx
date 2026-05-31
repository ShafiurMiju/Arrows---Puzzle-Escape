import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../constants';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

export interface HeaderProps {
  title?: string;
  onBack?: () => void;
  right?: ReactNode;
}

/** Top bar with an optional back button, centered title, and a right slot. */
export function Header({ title, onBack, right }: HeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.side}>
        {onBack ? (
          <IconButton
            icon="back"
            accessibilityLabel="Go back"
            variant="ghost"
            size={44}
            onPress={onBack}
          />
        ) : null}
      </View>

      {title ? (
        <AppText variant="title" center numberOfLines={1} style={styles.title}>
          {title}
        </AppText>
      ) : (
        <View style={styles.title} />
      )}

      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    minHeight: 56,
  },
  side: {
    width: 56,
    justifyContent: 'center',
  },
  right: {
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
  },
});
