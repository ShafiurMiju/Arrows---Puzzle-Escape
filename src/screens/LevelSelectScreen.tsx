import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { AppText, Header, Icon, ScreenContainer, StarRow } from '../components';
import { palette, radius, spacing } from '../constants';
import type { RootStackScreenProps } from '../navigation/types';

const TOTAL_LEVELS = 100;
const UNLOCKED_THROUGH = 12; // placeholder boundary until the progress store (Phase 7)
const COLUMNS = 4;

interface LevelItem {
  id: number;
  unlocked: boolean;
  stars: number;
}

// TEMP placeholder list; replaced by the level + progress systems (Phase 6/7).
const LEVELS: LevelItem[] = Array.from({ length: TOTAL_LEVELS }, (_, i) => {
  const id = i + 1;
  const unlocked = id <= UNLOCKED_THROUGH;
  const stars = unlocked && id < UNLOCKED_THROUGH ? ((id % 3) + 1) : 0;
  return { id, unlocked, stars };
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
