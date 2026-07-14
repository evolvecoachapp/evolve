import { StyleSheet, type ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { useGlowPulse } from "../animation/useGlowPulse";
import { useTheme } from "../theme/ThemeContext";

type GlowTone = "pulse" | "warm" | "neutral";

interface GlowOrbProps {
  tone?: GlowTone;
  size?: number;
  style?: ViewStyle;
  /** Enable subtle breathing pulse — for ambient hero layers. */
  animated?: boolean;
}

/**
 * Decorative ambient glow — position absolutely behind hero content.
 * Subtle depth without flashy color.
 */
export function GlowOrb({ tone = "pulse", size = 160, style, animated = false }: GlowOrbProps) {
  const { colors } = useTheme();
  const { animatedStyle } = useGlowPulse({ enabled: animated });

  const toneColors: Record<GlowTone, string> = {
    pulse: colors.glowPulse,
    warm: colors.glowWarm,
    neutral: colors.overlayStrong,
  };

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.orb,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: toneColors[tone],
        },
        style,
        animated && animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  orb: {
    position: "absolute",
    opacity: 0.9,
  },
});
