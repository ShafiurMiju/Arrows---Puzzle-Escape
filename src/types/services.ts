import { LevelResult } from './game';

/**
 * Service "ports" (Clean Architecture). The app's UI, stores, and game logic
 * depend ONLY on these interfaces — never on a concrete SDK. Adapters that wrap
 * AsyncStorage, react-native-sound, react-native-haptic-feedback, AdMob, and
 * Firebase implement them in `src/services`. This keeps the domain testable and
 * lets us swap or stub any provider (and add IAP) without touching feature code.
 */

/** Key-value persistence (AsyncStorage adapter behind it). */
export interface StorageService {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

export type SoundEffectName =
  | 'button'
  | 'rotate'
  | 'place'
  | 'victory'
  | 'failure'
  | 'star';

/** Background music + one-shot effects (react-native-sound adapter behind it). */
export interface AudioService {
  init(): Promise<void>;
  playMusic(): Promise<void>;
  stopMusic(): Promise<void>;
  setMusicEnabled(enabled: boolean): Promise<void>;
  playEffect(effect: SoundEffectName): Promise<void>;
  setSoundEnabled(enabled: boolean): void;
  dispose(): Promise<void>;
}

export type HapticPattern =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection'
  | 'success'
  | 'warning'
  | 'error';

/** Vibration / haptic feedback (react-native-haptic-feedback adapter behind it). */
export interface HapticsService {
  setEnabled(enabled: boolean): void;
  trigger(pattern: HapticPattern): void;
}

/** What a rewarded ad grants on completion. */
export type RewardKind = 'hint' | 'extra_retry';

export interface RewardOutcome {
  readonly granted: boolean;
  readonly kind: RewardKind;
}

/** AdMob abstraction (react-native-google-mobile-ads adapter behind it). */
export interface AdsService {
  init(): Promise<void>;
  /** When true (e.g. after a Remove Ads IAP) every ad is suppressed. */
  setAdsRemoved(removed: boolean): void;
  preloadInterstitial(): void;
  preloadRewarded(): void;
  /** Shows an interstitial after every Nth completed level (see ad config). */
  maybeShowInterstitial(completedLevels: number): Promise<void>;
  /** Presents a rewarded ad; resolves with whether the reward was earned. */
  showRewarded(kind: RewardKind): Promise<RewardOutcome>;
}

/** Analytics + crash reporting (Firebase adapter behind it; no-op until wired). */
export interface AnalyticsService {
  init(): Promise<void>;
  logScreenView(screen: string): void;
  logEvent(name: string, params?: Record<string, unknown>): void;
  logLevelComplete(result: LevelResult): void;
  setUserProperty(key: string, value: string): void;
  recordError(error: unknown, context?: Record<string, unknown>): void;
}

/** A purchasable product (future IAP). */
export interface IapProduct {
  readonly id: string;
  readonly title: string;
  readonly priceLabel: string;
}

export interface PurchaseResult {
  readonly success: boolean;
  readonly productId: string;
}

/** In-app purchases (future). The architecture reserves this port today. */
export interface PurchaseService {
  init(): Promise<void>;
  getProducts(): Promise<readonly IapProduct[]>;
  purchase(productId: string): Promise<PurchaseResult>;
  restore(): Promise<readonly string[]>;
}
