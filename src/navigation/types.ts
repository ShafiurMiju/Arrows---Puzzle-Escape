import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { FailureReason } from '../types';

/**
 * The single source of truth for routes and their params. Adding a screen here
 * makes `navigation.navigate(...)` and `route.params` type-checked everywhere.
 */
export type RootStackParamList = {
  Splash: undefined;
  MainMenu: undefined;
  LevelSelect: undefined;
  Game: { levelId: number };
  Victory: {
    levelId: number;
    stars: number;
    moves: number;
    timeSec: number;
    score: number;
  };
  Failure: { levelId: number; reason?: FailureReason };
  Settings: undefined;
  Achievements: undefined;
};

/** Convenience props type for a screen component, e.g. RootStackScreenProps<'Game'>. */
export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

declare global {
  // Makes the typed param list the default for useNavigation()/useRoute().
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
