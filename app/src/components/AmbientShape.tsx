import { StyleSheet, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeContext";

type AmbientTone = "pulse" | "warm" | "neutral";
type AmbientShapeKind = "circle" | "ellipse" | "pill";

interface AmbientShapeProps {
  tone?: AmbientTone;
  kind?: AmbientShapeKind;
  size?: number;
  style?: ViewStyle;
}

function resolveDimensions(
  kind: AmbientShapeKind,
  size: number,
): Pick<ViewStyle, "width" | "height" | "borderRadius"> {
  switch (kind) {
    case "ellipse":
      return {
        width: size * 1.4,
        height: size,
        borderRadius: size / 2,
      };
    case "pill":
      return {
        width: size * 2,
        height: size * 0.55,
        borderRadius: size,
      };
    case "circle":
    default:
      return {
        width: size,
        height: size,
        borderRadius: size / 2,
      };
  }
}

/**
 * Soft decorative shape — simulates ambient blur via low-opacity fills.
 * Position absolutely within a hero backdrop container.
 */
export function AmbientShape({
  tone = "neutral",
  kind = "circle",
  size = 64,
  style,
}: AmbientShapeProps) {
  const { colors } = useTheme();

  const toneColors: Record<AmbientTone, string> = {
    pulse: colors.glowPulse,
    warm: colors.glowWarm,
    neutral: colors.overlayStrong,
  };

  const dimensions = resolveDimensions(kind, size);

  return (
    <View
      pointerEvents="none"
      style={[
        styles.shape,
        dimensions,
        { backgroundColor: toneColors[tone] },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  shape: {
    position: "absolute",
    opacity: 0.85,
  },
});
