import * as Haptics from 'expo-haptics';

import { HapticPattern, HapticsService } from '../../types';

/**
 * `expo-haptics` adapter implementing the {@link HapticsService} port. Haptics
 * are best-effort (silently no-op on unsupported hardware / Low Power Mode) and
 * gated by the vibration setting. The only module importing the haptics SDK.
 */
class ExpoHapticsService implements HapticsService {
  private enabled = true;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  trigger(pattern: HapticPattern): void {
    if (!this.enabled) {
      return;
    }
    const ignore = () => undefined;
    switch (pattern) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(ignore);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(ignore);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(ignore);
        break;
      case 'selection':
        Haptics.selectionAsync().catch(ignore);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(ignore);
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(ignore);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(ignore);
        break;
      default:
        break;
    }
  }
}

export const haptics: HapticsService = new ExpoHapticsService();
