import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useReduceMotion } from "../../../animation/useReduceMotion";
import { motion } from "../../../theme/motion";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

interface CircularCountdownProps {
  secondsLeft: number;
  totalSeconds: number;
  size?: number;
}

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * Circular rest countdown ring with animated depletion.
 * Built without SVG — uses clipped half-circle rotation.
 */
export function CircularCountdown({
  secondsLeft,
  totalSeconds,
  size = 168,
}: CircularCountdownProps) {
  const reduceMotion = useReduceMotion();
  const strokeWidth = 8;
  const progress = useSharedValue(totalSeconds > 0 ? secondsLeft / totalSeconds : 0);
  const fraction = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;

  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      container: {
        alignItems: "center",
        justifyContent: "center",
      },
      track: {
        position: "absolute",
        borderColor: colors.overlayStrong,
      },
      arcClipRight: {
        position: "absolute",
        left: size / 2,
        width: size / 2,
        height: size,
        overflow: "hidden",
      },
      arcClipLeft: {
        position: "absolute",
        left: 0,
        width: size / 2,
        height: size,
        overflow: "hidden",
      },
      arcCircleRight: {
        position: "absolute",
        borderColor: "transparent",
        borderTopColor: colors.pulse,
        borderRightColor: colors.pulse,
      },
      arcCircleLeft: {
        position: "absolute",
        borderColor: "transparent",
        borderTopColor: colors.pulse,
        borderLeftColor: colors.pulse,
      },
      center: {
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xs,
      },
      timer: {
        ...typography.display,
        color: colors.ink,
        fontVariant: ["tabular-nums"],
      },
      unit: {
        ...typography.caption,
        color: colors.inkMuted,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.6,
      },
    }),
  );

  useEffect(() => {
    const target = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;
    progress.value = reduceMotion
      ? target
      : withTiming(target, {
          duration: motion.duration.normal,
          easing: motion.easing.smooth,
        });
  }, [progress, reduceMotion, secondsLeft, totalSeconds]);

  const firstHalfStyle = useAnimatedStyle(() => {
    const angle = Math.min(progress.value * 360, 180);
    return {
      transform: [{ rotate: `${angle - 90}deg` }],
    };
  });

  const secondHalfStyle = useAnimatedStyle(() => {
    const angle = Math.max(progress.value * 360 - 180, 0);
    return {
      transform: [{ rotate: `${angle - 90}deg` }],
    };
  });

  const circleBase = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: strokeWidth,
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.track, circleBase]} />

      <View style={styles.arcClipRight}>
        <Animated.View
          style={[
            styles.arcCircleRight,
            circleBase,
            { left: -size / 2 },
            firstHalfStyle,
          ]}
        />
      </View>

      {fraction > 0.5 ? (
        <View style={styles.arcClipLeft}>
          <Animated.View
            style={[
              styles.arcCircleLeft,
              circleBase,
              { left: 0 },
              secondHalfStyle,
            ]}
          />
        </View>
      ) : null}

      <View style={styles.center}>
        <Text style={styles.timer}>{formatCountdown(secondsLeft)}</Text>
        <Text style={styles.unit}>remaining</Text>
      </View>
    </View>
  );
}
