import Animated from "react-native-reanimated";
import { heroEntering } from "./entering";
import { useReduceMotion } from "./useReduceMotion";

interface HeroEntranceProps {
  children: React.ReactNode;
  /** Stagger delay in ms — 0 for headline, increment for subsequent blocks. */
  delay?: number;
}

/** Fade + translate Y entrance wrapper for hero content blocks. */
export function HeroEntrance({ children, delay = 0 }: HeroEntranceProps) {
  const reduceMotion = useReduceMotion();

  return (
    <Animated.View entering={heroEntering(delay, reduceMotion)}>{children}</Animated.View>
  );
}
