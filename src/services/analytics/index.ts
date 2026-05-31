import { AnalyticsService, LevelResult } from '../../types';

/**
 * Analytics + crash-reporting integration STRUCTURE. This no-op adapter
 * implements the {@link AnalyticsService} port and logs to the console in dev.
 * To ship real telemetry, drop in a Firebase Analytics + Crashlytics adapter
 * that implements the same port — no call sites change. This is the "prepare
 * the integration structure" deliverable; wiring a provider is a later, isolated
 * step behind this interface.
 */
class NoopAnalyticsService implements AnalyticsService {
  async init(): Promise<void> {
    // A real adapter would initialize the SDK and enable Crashlytics here.
  }

  logScreenView(screen: string): void {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log(`[analytics] screen → ${screen}`);
    }
  }

  logEvent(name: string, params?: Record<string, unknown>): void {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log(`[analytics] ${name}`, params ?? {});
    }
  }

  logLevelComplete(result: LevelResult): void {
    this.logEvent('level_complete', {
      levelId: result.levelId,
      stars: result.stars,
      moves: result.movesUsed,
      timeSec: result.timeSec,
      score: result.score,
      usedHint: result.usedHint,
    });
  }

  setUserProperty(key: string, value: string): void {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log(`[analytics] property ${key} = ${value}`);
    }
  }

  recordError(error: unknown, context?: Record<string, unknown>): void {
    const message = error instanceof Error ? error.message : String(error);
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn(`[analytics] error: ${message}`, context ?? {});
    }
    // A real adapter would forward to Crashlytics here.
  }
}

export const analytics: AnalyticsService = new NoopAnalyticsService();
