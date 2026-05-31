import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { AppText, Header, Icon, ScreenContainer, StarRow } from '../components';
import { palette, radius, spacing } from '../constants';
import { isLevelUnlocked, LEVEL_COUNT } from '../game/levels';
import type { RootStackScreenProps } from '../navigation/types';

const COLUMNS = 4;

// TEMP placeholder progress until the Phase 7 progress store: a few levels open,
// no stars earned yet. The level list itself is now the real catalog.
const PLACEHOLDER_COMPLETED = new Set<number>([1, 2, 3, 4, 5, 6, 7]);

interface LevelItem {
  id: number;
  unlocked: boolean;
  stars: number;
}

const LEVELS: LevelItem[] = Array.from({ length: LEVEL_COUNT }, (_, i) => {
  const id = i + 1;
  return { id, unlocked: isLevelUnlocked(id, PLACEHOLDER_COMPLETED), stars: 0 };
});

export function LevelSelectScreen({ navigation }: RootStackScreenProps<'LevelSelect'>) {
  return (
    <ScreenContainer padded={false}>
      <View style={styles.headerWrap}>
        <Header title="Select Level" onBack={() => navigation.goBack()} />
      </View>

      <FlatList
        data={LEVELS}
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
