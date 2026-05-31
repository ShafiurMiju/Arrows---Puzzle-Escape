import { FlatList, StyleSheet, View } from 'react-native';

import { AppText, Card, Header, Icon, ScreenContainer } from '../components';
import { ACHIEVEMENTS, palette, radius, spacing } from '../constants';
import type { RootStackScreenProps } from '../navigation/types';

// TEMP unlocked set until the achievements system (Phase 11) tracks real progress.
const UNLOCKED_IDS = new Set<string>(['first_victory']);

export function AchievementsScreen({ navigation }: RootStackScreenProps<'Achievements'>) {
  return (
    <ScreenContainer padded={false}>
      <View style={styles.headerWrap}>
        <Header title="Achievements" onBack={() => navigation.goBack()} />
      </View>

      <FlatList
        data={ACHIEVEMENTS}
        keyExtractor={(item) => item.id}
        style={styles.grow}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const unlocked = UNLOCKED_IDS.has(item.id);
          return (
            <Card style={styles.row}>
              <View style={[styles.iconWrap, unlocked && styles.iconWrapUnlocked]}>
                <Icon
                  name={unlocked ? 'trophy' : 'lock'}
                  size={24}
                  color={unlocked ? palette.star : palette.textMuted}
                />
              </View>
              <View style={styles.texts}>
                <AppText variant="subtitle" color={unlocked ? 'textPrimary' : 'textSecondary'}>
                  {item.title}
                </AppText>
                <AppText variant="caption" color="textMuted">
                  {item.description}
                </AppText>
              </View>
              {unlocked ? <Icon name="check" size={20} color={palette.success} /> : null}
            </Card>
          );
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    paddingHorizontal: spacing.xl,
  },
  grow: {
    flex: 1,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  separator: {
    height: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: palette.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapUnlocked: {
    backgroundColor: palette.surface,
  },
  texts: {
    flex: 1,
    gap: spacing.xs,
  },
});
