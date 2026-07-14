import { useEffect } from "react";
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { motion } from "../theme/motion";
import { useReduceMotion } from "./useReduceMotion";

interface UseBreathingAnimationOptions {
  enabled?: boolean;
}

/**
 * Very slow opacity + scale breathing loop for AI presence orbs.
 */
export function useBreathingAnimation({ enabled = true }: UseBreathingAnimationOptions = {}) {
  const reduceMotion = useReduceMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!enabled || reduceMotion) {
      progress.value = 1;
      return;
    }

    progress.value = withRepeat(
      withTiming(1, {
        duration: motion.duration.breathe,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
  }, [enabled, progress, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => {
    if (reduceMotion || !enabled) {
      return {};
    }

    const t = progress.value;
    const scale =
      motion.breathe.scaleMin + (motion.breathe.scaleMax - motion.breathe.scaleMin) * t;
    const opacity =
      motion.breathe.opacityMin + (motion.breathe.opacityMax - motion.breathe.opacityMin) * t;

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return { animatedStyle, reduceMotion };
}
