import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { AmbientShape } from "./AmbientShape";
import { GlowOrb } from "./GlowOrb";
import { heroLayout } from "../theme/heroLayout";
import { useTheme } from "../theme/ThemeContext";

interface HeroAmbientLayerProps {
  style?: StyleProp<ViewStyle>;
}

/**
 * Layered hero backdrop — soft gradients, ambient glow, and blurred shapes.
 * Sits behind hero typography; children render in the foreground slot.
 */
export function HeroAmbientLayer({ style, children }: HeroAmbientLayerProps & { children?: React.ReactNode }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View pointerEvents="none" style={styles.backdrop}>
        <LinearGradient
          colors={[colors.gradientHeroStart, colors.gradientHeroEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={[colors.glowWarm, colors.gradientHeroEnd]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={[colors.overlay, colors.gradientHeroEnd]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <GlowOrb
          tone="pulse"
          size={heroLayout.glowSizePrimary}
          style={styles.glowPrimary}
          animated
        />
        <GlowOrb
          tone="warm"
          size={heroLayout.glowSizeSecondary}
          style={styles.glowSecondary}
          animated
        />

        <AmbientShape
          tone="pulse"
          kind="ellipse"
          size={heroLayout.shapeSizeLg}
          style={styles.shapePrimary}
        />
        <AmbientShape
          tone="warm"
          kind="pill"
          size={heroLayout.shapeSizeMd}
          style={styles.shapeSecondary}
        />
        <AmbientShape
          tone="neutral"
          kind="circle"
          size={heroLayout.shapeSizeSm}
          style={styles.shapeTertiary}
        />
      </View>

      <View style={styles.foreground}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
    borderRadius: heroLayout.heroRadius,
    minHeight: heroLayout.minHeight,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  foreground: {
    paddingTop: heroLayout.paddingTop,
    paddingBottom: heroLayout.paddingBottom,
    gap: heroLayout.contentGap,
  },
  glowPrimary: {
    top: -heroLayout.ambientInset * 2,
    right: -heroLayout.ambientInset,
    opacity: 0.75,
  },
  glowSecondary: {
    bottom: -heroLayout.ambientInset,
    left: -heroLayout.ambientInset,
    opacity: 0.6,
  },
  shapePrimary: {
    top: heroLayout.ambientInset,
    right: heroLayout.shapeSizeLg * 0.35,
    opacity: 0.55,
    transform: [{ rotate: "-18deg" }],
  },
  shapeSecondary: {
    bottom: heroLayout.shapeSizeMd * 0.4,
    left: -heroLayout.ambientInset,
    opacity: 0.45,
    transform: [{ rotate: "12deg" }],
  },
  shapeTertiary: {
    top: heroLayout.shapeSizeSm,
    left: heroLayout.shapeSizeSm * 0.6,
    opacity: 0.35,
  },
});
