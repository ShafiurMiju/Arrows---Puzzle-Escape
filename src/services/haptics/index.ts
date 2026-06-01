import ReactNativeHapticFeedback, {
  type HapticOptions,
} from 'react-native-haptic-feedback';

import { HapticPattern, HapticsService } from '../../types';

/**
 * `react-native-haptic-feedback` adapter implementing the {@link HapticsService}
 * port. Haptics are best-effort (silently no-op on unsupported hardware) and
 * gated by the vibration setting. The only module importing the haptics SDK.
 */
const HAPTIC_OPTIONS: HapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

class RNHapticsService implements HapticsService {
  private enabled = true;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  trigger(pattern: HapticPattern): void {
    if (!this.enabled) {
      return;
    }
    switch (pattern) {
      case 'light':
        ReactNativeHapticFeedback.trigger('impactLight', HAPTIC_OPTIONS);
        break;
      case 'medium':
        ReactNativeHapticFeedback.trigger('impactMedium', HAPTIC_OPTIONS);
        break;
      case 'heavy':
        ReactNativeHapticFeedback.trigger('impactHeavy', HAPTIC_OPTIONS);
        break;
      case 'selection':
        ReactNativeHapticFeedback.trigger('selection', HAPTIC_OPTIONS);
        break;
      case 'success':
        ReactNativeHapticFeedback.trigger('notificationSuccess', HAPTIC_OPTIONS);
        break;
      case 'warning':
        ReactNativeHapticFeedback.trigger('notificationWarning', HAPTIC_OPTIONS);
        break;
      case 'error':
        ReactNativeHapticFeedback.trigger('notificationError', HAPTIC_OPTIONS);
        break;
      default:
        break;
    }
  }
}

export const haptics: HapticsService = new RNHapticsService();
