import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { AppText, Header, Icon, ScreenContainer, StarRow } from '../components';
import { palette, radius, spacing } from '../constants';
import { isLevelUnlocked, LEVEL_COUNT } from '../game/levels';
import { completedLevelIds } from '../game/mechanics';
import { useProgressStore } from '../store';
import type { RootStackScreenProps } from '../navigation/types';

const COLUMNS = 4;

interface LevelItem {
  id: number;
  unlocked: boolean;
  stars: number;
}

export function LevelSelectScreen({ navigation }: RootStackScreenProps<'LevelSelect'>) {
  const progress = useProgressStore((s) => s.progress);
  const levels = useMemo<LevelItem[]>(() => {
    const completed = completedLevelIds(progress);
    return Array.from({ length: LEVEL_COUNT }, (_, i) => {
      const id = i + 1;
      return {
        id,
        unlocked: isLevelUnlocked(id, completed),
        stars: progress.levels[id]?.bestStars ?? 0,
      };
    });
  }, [progress]);

  return (
    <ScreenContainer padded={false}>
      <View style={styles.headerWrap}>
        <Header title="Select Level" onBack={() => navigation.goBack()} />
      </View>

      <FlatList
        data={levels}
        keyExtractor={(item) => String(item.id)}
        numColumns={COLUMNS}
        style={styles.grow}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.column}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            disabled={!item.unlocked}
            accessibilityRole="button"
            accessibilityLabel={`Level ${item.id}${item.unlocked ? '' : ', locked'}`}
            onPress={() => navigation.navigate('Game', { levelId: item.id })}
            style={({ pressed }) => [
              styles.tile,
              !item.unlocked && styles.tileLocked,
              pressed && styles.tilePressed,
            ]}
          >
            {item.unlocked ? (
              <>
                <AppText variant="title">{item.id}</AppText>
                <StarRow count={item.stars} size={11} gap={2} />
              </>
            ) : (
              <Icon name="lock" size={22} color={palette.textMuted} />
            )}
          </Pressable>
        )}
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  column: {
    gap: spacing.sm,
  },
  tile: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  tileLocked: {
    backgroundColor: palette.background,
    opacity: 0.6,
  },
  tilePressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
});
