import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { LayoutChangeEvent, View, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useReduceMotion } from "../animation/useReduceMotion";
import { useTheme } from "../theme/ThemeContext";
import { motion } from "../theme/motion";
import { radius } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

interface ProgressBarProps {
  progress: number;
  style?: ViewStyle;
  height?: number;
}

/**
 * Premium progress track with soft gradient fill.
 * Animates from 0 → current value on mount and when progress changes.
 */
export function ProgressBar({ progress, style, height = 4 }: ProgressBarProps) {
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const [trackWidth, setTrackWidth] = useState(0);
  const fillWidth = useSharedValue(0);

  const styles = useThemedStyles(({ colors }) => ({
    track: {
      backgroundColor: colors.overlayStrong,
      borderRadius: radius.full,
      overflow: "hidden",
    },
    fill: {
      height: "100%",
      borderRadius: radius.full,
    },
  }));

  const clamped = Math.min(Math.max(progress, 0), 100);

  useEffect(() => {
    if (trackWidth <= 0) {
      return;
    }

    const target = (trackWidth * clamped) / 100;
    fillWidth.value = reduceMotion
      ? target
      : withTiming(target, {
          duration: motion.duration.progress,
          easing: motion.easing.smooth,
        });
  }, [clamped, fillWidth, reduceMotion, trackWidth]);

  const animatedFillStyle = useAnimatedStyle(() => ({
    width: fillWidth.value,
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width > 0) {
      setTrackWidth(width);
    }
  };

  return (
    <View style={[styles.track, { height }, style]} onLayout={handleLayout}>
      <Animated.View style={animatedFillStyle}>
        <LinearGradient
          colors={[colors.pulse, colors.pulseGradientEnd]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.fill}
        />
      </Animated.View>
    </View>
  );
}
