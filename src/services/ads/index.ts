import mobileAds, {
  AdEventType,
  InterstitialAd,
  RewardedAd,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';

import { adConfig, getAdUnitId } from '../../constants';
import { AdsService, RewardKind, RewardOutcome } from '../../types';

/**
 * AdMob adapter implementing the {@link AdsService} port via
 * react-native-google-mobile-ads. Uses Google's test ad unit ids in dev (see
 * `constants/ads`). Requires a native build — it cannot run in a JS-only preview.
 *
 * Gating: interstitials are shown after every Nth completed level and suppressed
 * when ads are removed. Rewarded ads are user-initiated (hints); when ads are
 * removed the reward is simply granted for free (no ad).
 */
class AdMobService implements AdsService {
  private interstitial: InterstitialAd | null = null;
  private rewarded: RewardedAd | null = null;
  private adsRemoved = false;
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    try {
      await mobileAds().initialize();
      this.createInterstitial();
      this.createRewarded();
    } catch {
      // Ads are non-essential; never let initialization crash the app.
    }
  }

  setAdsRemoved(removed: boolean): void {
    this.adsRemoved = removed;
  }

  preloadInterstitial(): void {
    if (this.adsRemoved) {
      return;
    }
    try {
      this.interstitial?.load();
    } catch {
      /* best-effort */
    }
  }

  preloadRewarded(): void {
    try {
      this.rewarded?.load();
    } catch {
      /* best-effort */
    }
  }

  async maybeShowInterstitial(completedLevels: number): Promise<void> {
    if (this.adsRemoved || completedLevels <= 0) {
      return;
    }
    if (completedLevels % adConfig.interstitialEveryNLevels !== 0) {
      return;
    }
    const ad = this.interstitial;
    if (ad && ad.loaded) {
      try {
        await ad.show();
      } catch {
        /* best-effort */
      }
    } else {
      this.preloadInterstitial();
    }
  }

  showRewarded(kind: RewardKind): Promise<RewardOutcome> {
    // Players who removed ads get the reward without watching anything.
    if (this.adsRemoved) {
      return Promise.resolve({ granted: true, kind });
    }
    const ad = this.rewarded;
    if (!ad || !ad.loaded) {
      this.preloadRewarded();
      return Promise.resolve({ granted: false, kind });
    }

    return new Promise<RewardOutcome>((resolve) => {
      let earned = false;
      ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        earned = true;
      });
      ad.addAdEventListener(AdEventType.CLOSED, () => {
        ad.removeAllListeners();
        this.createRewarded();
        this.preloadRewarded();
        resolve({ granted: earned, kind });
      });
      ad.show().catch(() => {
        ad.removeAllListeners();
        this.createRewarded();
        resolve({ granted: false, kind });
      });
    });
  }

  private createInterstitial(): void {
    const ad = InterstitialAd.createForAdRequest(getAdUnitId('interstitial'));
    ad.addAdEventListener(AdEventType.CLOSED, () => {
      ad.removeAllListeners();
      this.createInterstitial(); // a fresh ad for next time
      this.preloadInterstitial();
    });
    this.interstitial = ad;
  }

  private createRewarded(): void {
    this.rewarded = RewardedAd.createForAdRequest(getAdUnitId('rewarded'));
  }
}

export const ads: AdsService = new AdMobService();
