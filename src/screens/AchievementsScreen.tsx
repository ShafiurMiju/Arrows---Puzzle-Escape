import { useEffect, useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { AppText, Card, Header, Icon, ScreenContainer } from '../components';
import { ACHIEVEMENTS, palette, radius, spacing } from '../constants';
import { evaluateAchievements } from '../game/mechanics';
import { useAchievementsStore, useProgressStore } from '../store';
import type { RootStackScreenProps } from '../navigation/types';

export function AchievementsScreen({ navigation }: RootStackScreenProps<'Achievements'>) {
  const progress = useProgressStore((s) => s.progress);
  const sync = useAchievementsStore((s) => s.sync);

  const items = useMemo(() => evaluateAchievements(ACHIEVEMENTS, progress), [progress]);
  const unlockedCount = items.filter((item) => item.unlocked).length;

  // Stamp unlock timestamps for anything already earned (idempotent).
  useEffect(() => {
    sync(progress, Date.now());
  }, [progress, sync]);

  return (
    <ScreenContainer padded={false}>
      <View style={styles.headerWrap}>
        <Header title="Achievements" onBack={() => navigation.goBack()} />
        <AppText variant="caption" color="textSecondary" center style={styles.summary}>
          {`${unlockedCount} / ${items.length} unlocked`}
        </AppText>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.definition.id}
        style={styles.grow}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const { definition, unlocked, progress: fraction, current } = item;
          const target = definition.condition.count;
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
                  {definition.title}
                </AppText>
                <AppText variant="caption" color="textMuted">
                  {definition.description}
                </AppText>
                {!unlocked && target > 1 ? (
                  <View style={styles.progressRow}>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${Math.round(fraction * 100)}%` }]} />
                    </View>
                    <AppText variant="caption" color="textMuted">
                      {`${Math.min(current, target)} / ${target}`}
                    </AppText>
                  </View>
                ) : null}
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
  summary: {
    paddingBottom: spacing.sm,
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
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: palette.surfaceElevated,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: palette.primary,
  },
});
