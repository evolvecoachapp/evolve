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

interface UseGlowPulseOptions {
  enabled?: boolean;
}

/**
 * Subtle opacity + scale pulse for ambient glow layers.
 */
export function useGlowPulse({ enabled = true }: UseGlowPulseOptions = {}) {
  const reduceMotion = useReduceMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!enabled || reduceMotion) {
      progress.value = 1;
      return;
    }

    progress.value = withRepeat(
      withTiming(1, {
        duration: motion.duration.glow,
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
    const opacity =
      motion.glow.opacityMin + (motion.glow.opacityMax - motion.glow.opacityMin) * t;
    const scale =
      motion.glow.scaleMin + (motion.glow.scaleMax - motion.glow.scaleMin) * t;

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return { animatedStyle, reduceMotion };
}
