import { useCallback } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { motion } from "../theme/motion";

interface UsePressScaleOptions {
  pressedScale?: number;
  disabled?: boolean;
  /** Stronger spring for floating action buttons. */
  variant?: "default" | "floating";
}

export function usePressScale({
  pressedScale = 0.96,
  disabled = false,
  variant = "default",
}: UsePressScaleOptions = {}) {
  const scale = useSharedValue(1);

  const pressIn = useCallback(() => {
    if (disabled) {
      return;
    }
    scale.value = withTiming(pressedScale, {
      duration: motion.duration.instant,
      easing: motion.easing.standard,
    });
  }, [disabled, pressedScale, scale]);

  const pressOut = useCallback(() => {
    if (disabled) {
      return;
    }
    const springConfig =
      variant === "floating" ? motion.spring.floating : motion.spring.release;
    scale.value = withSpring(1, springConfig);
  }, [disabled, scale, variant]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { animatedStyle, pressIn, pressOut };
}
