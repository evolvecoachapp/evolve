import {
  FadeIn,
  FadeInDown,
  type BaseAnimationBuilder,
} from "react-native-reanimated";
import { motion } from "../theme/motion";

/** Hero/content entrance — fade + translate Y with smooth easing. */
export function heroEntering(delay = 0, reduceMotion = false): BaseAnimationBuilder {
  if (reduceMotion) {
    return FadeIn.duration(motion.duration.fast).delay(delay);
  }

  return FadeInDown.duration(motion.duration.medium)
    .delay(delay)
    .easing(motion.easing.smooth)
    .withInitialValues({
      opacity: motion.enter.opacityFrom,
      transform: [{ translateY: motion.enter.translateY }],
    });
}

/** Floating chip entrance — tiny fade + scale. */
export function chipEntering(index = 0, reduceMotion = false): BaseAnimationBuilder {
  const delay = index * motion.enter.chipStaggerDelay;

  if (reduceMotion) {
    return FadeIn.duration(motion.duration.fast).delay(delay);
  }

  return FadeIn.duration(motion.duration.normal)
    .delay(delay)
    .easing(motion.easing.smooth)
    .withInitialValues({
      opacity: motion.enter.opacityFrom,
      transform: [{ scale: motion.enter.chipScaleFrom }],
    });
}
