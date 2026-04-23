import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';

export type HapticEvent = 'tap' | 'tap-strong' | 'selection' | 'success' | 'warning' | 'error';

/**
 * Small wrapper around expo-haptics that exposes a stable, UX-level vocabulary
 * (`tap`, `selection`, `success`…) instead of Apple/Android primitives, and
 * swallows the promise so callers don't need to `await`.
 *
 * Usage:
 *   const haptics = useHaptics();
 *   haptics('success');        // on form submit ok
 *   haptics('error');          // on validation fail
 *   haptics('selection');      // on filter toggle
 */
export function useHaptics() {
  return useCallback((event: HapticEvent = 'tap') => {
    switch (event) {
      case 'tap':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        return;
      case 'tap-strong':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        return;
      case 'selection':
        Haptics.selectionAsync().catch(() => {});
        return;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        return;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        return;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        return;
    }
  }, []);
}
