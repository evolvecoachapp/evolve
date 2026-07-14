import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View, type ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { useBreathingAnimation } from "../animation/useBreathingAnimation";
import { GlowOrb } from "./GlowOrb";
import { spacing } from "../theme/theme";
import { useTheme } from "../theme/ThemeContext";
import { useThemedStyles } from "../theme/useThemedStyles";

interface AiPresenceOrbProps {
  size?: number;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

/**
 * Large AI presence orb — hero centerpiece for Coach and future AI surfaces.
 */
export function AiPresenceOrb({
  size = spacing["3xl"] * 4,
  icon = "sparkles",
  style,
}: AiPresenceOrbProps) {
  const { colors } = useTheme();
  const { animatedStyle } = useBreathingAnimation();
  const styles = useThemedStyles(({ colors, shadows }) =>
    StyleSheet.create({
      wrapper: {
        alignItems: "center",
        justifyContent: "center",
      },
      glowPrimary: {
        position: "absolute",
        opacity: 0.85,
      },
      glowSecondary: {
        position: "absolute",
        opacity: 0.55,
      },
      core: {
        alignItems: "center",
        justifyContent: "center",
        ...shadows.glow,
      },
      coreInner: {
        backgroundColor: colors.ink,
        alignItems: "center",
        justifyContent: "center",
      },
    }),
  );

  const innerSize = size * 0.42;
  const iconSize = innerSize * 0.42;

  return (
    <Animated.View style={[styles.wrapper, { width: size, height: size }, style, animatedStyle]}>
      <GlowOrb tone="pulse" size={size} style={styles.glowPrimary} animated />
      <GlowOrb tone="warm" size={size * 0.72} style={styles.glowSecondary} animated />
      <LinearGradient
        colors={[colors.pulse, colors.ink]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.core,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
          },
        ]}
      >
        <View
          style={[
            styles.coreInner,
            {
              width: innerSize - spacing.xs,
              height: innerSize - spacing.xs,
              borderRadius: (innerSize - spacing.xs) / 2,
            },
          ]}
        >
          <Ionicons name={icon} size={iconSize} color={colors.canvas} />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}
