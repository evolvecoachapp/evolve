import * as Haptics from "expo-haptics";
import { useMemo } from "react";
import type { RestTimerEvents } from "./useRestTimer";

interface UseRestFeedbackOptions {
  /** When true, fires haptic cues at rest milestones. Defaults to true. */
  hapticEnabled?: boolean;
  /** Hook point for audio cues — wire to a sound player when preferences allow. */
  soundEnabled?: boolean;
}

/**
 * Prepares rest-timer feedback integration points.
 * Haptics are wired now; sound hooks are reserved for future preferences wiring.
 */
export function useRestFeedback({
  hapticEnabled = true,
  soundEnabled = false,
}: UseRestFeedbackOptions = {}): RestTimerEvents {
  return useMemo(
    () => ({
      onComplete: () => {
        if (hapticEnabled) {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        if (soundEnabled) {
          // playRestCompleteSound();
        }
      },
      onTick: (secondsLeft: number) => {
        if (hapticEnabled && secondsLeft > 0 && secondsLeft <= 3) {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        if (soundEnabled && secondsLeft > 0 && secondsLeft <= 3) {
          // playRestTickSound(secondsLeft);
        }
      },
      onSkip: () => {
        if (hapticEnabled) {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        if (soundEnabled) {
          // playRestSkipSound();
        }
      },
      onAdjust: () => {
        if (hapticEnabled) {
          void Haptics.selectionAsync();
        }
        if (soundEnabled) {
          // playRestAdjustSound();
        }
      },
    }),
    [hapticEnabled, soundEnabled],
  );
}
