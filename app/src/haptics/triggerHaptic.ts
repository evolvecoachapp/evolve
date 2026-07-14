import * as Haptics from "expo-haptics";

export type HapticFeedback = "light" | "medium" | "selection";

/**
 * Trigger platform haptic feedback where appropriate.
 * Silently no-ops on unsupported platforms.
 */
export function triggerHaptic(type: HapticFeedback): void {
  switch (type) {
    case "light":
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case "medium":
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
    case "selection":
      void Haptics.selectionAsync();
      break;
  }
}
