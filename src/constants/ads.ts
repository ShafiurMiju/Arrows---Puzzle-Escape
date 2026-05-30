/**
 * AdMob configuration.
 *
 * In development we ALWAYS use Google's official test ad unit IDs. Real ad
 * units are only served in production release builds — serving real ads in
 * debug (or clicking your own live ads) risks an AdMob account ban for invalid
 * traffic. The App ID itself lives in `app.json` under the config plugin, not
 * here (it is written into the native manifest at build time).
 */

/** Google's public Android test ad unit IDs (note the `/` — these are UNIT ids). */
export const TestAdUnitIds = {
  banner: 'ca-app-pub-3940256099942544/6300978111',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
} as const;

/** TODO(release): fill in real AdMob unit IDs before publishing to Play. */
export const ProdAdUnitIds = {
  banner: '',
  interstitial: '',
  rewarded: '',
} as const;

export type AdUnitKind = keyof typeof TestAdUnitIds;

export const adConfig = {
  /** Show an interstitial after every N completed levels. */
  interstitialEveryNLevels: 3,
  /** Use test ads in any non-production build. */
  useTestAds: __DEV__,
} as const;

/** Resolve the correct ad unit id for the current build. */
export function getAdUnitId(kind: AdUnitKind): string {
  if (adConfig.useTestAds) {
    return TestAdUnitIds[kind];
  }
  // Fall back to test ids if a prod id is missing, so we never crash on launch.
  return ProdAdUnitIds[kind] || TestAdUnitIds[kind];
}
