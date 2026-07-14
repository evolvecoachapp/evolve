import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeContext";

type GradientVariant = "canvas" | "hero" | "surface";

interface GradientBackgroundProps {
  children?: React.ReactNode;
  variant?: GradientVariant;
  style?: ViewStyle;
}

/**
 * Soft ambient gradient — use as screen backdrop or hero wash.
 * Keeps surfaces floating above a warm, non-white canvas.
 */
export function GradientBackground({
  children,
  variant = "canvas",
  style,
}: GradientBackgroundProps) {
  const { colors } = useTheme();

  const variants: Record<GradientVariant, readonly [string, string]> = {
    canvas: [colors.gradientCanvasStart, colors.gradientCanvasEnd],
    hero: [colors.gradientHeroStart, colors.gradientHeroEnd],
    surface: [colors.surface, colors.canvas],
  };

  const [start, end] = variants[variant];

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={[start, end]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
