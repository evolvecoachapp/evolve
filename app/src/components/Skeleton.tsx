import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { useReduceMotion } from "../animation/useReduceMotion";
import { motion } from "../theme/motion";
import { radius } from "../theme/theme";
import { useThemedStyles } from "../theme/useThemedStyles";

interface SkeletonBlockProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Shimmer skeleton placeholder — disabled when reduce motion is on.
 */
export function SkeletonBlock({
  width = "100%",
  height = 16,
  borderRadius = radius.sm,
  style,
}: SkeletonBlockProps) {
  const reduceMotion = useReduceMotion();
  const shimmer = useSharedValue(0);

  const styles = useThemedStyles(({ colors }) => ({
    track: {
      backgroundColor: colors.overlayStrong,
      overflow: "hidden",
    },
    shimmer: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.overlay,
    },
  }));

  useEffect(() => {
    if (reduceMotion) {
      shimmer.value = 0;
      return;
    }

    shimmer.value = withRepeat(
      withTiming(1, {
        duration: motion.duration.shimmer,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [reduceMotion, shimmer]);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: reduceMotion ? 0 : 0.35 + shimmer.value * 0.45,
  }));

  return (
    <View
      style={[
        styles.track,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmer, shimmerStyle]} />
    </View>
  );
}

/** Bootstrap layout skeleton — auth session check. */
export function BootstrapSkeleton() {
  const styles = useThemedStyles(() => ({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 48,
      gap: 16,
    },
    logo: {
      marginBottom: 24,
    },
  }));

  return (
    <View style={styles.container}>
      <SkeletonBlock width={64} height={64} borderRadius={radius.full} style={styles.logo} />
      <SkeletonBlock width="70%" height={20} borderRadius={radius.md} />
      <SkeletonBlock width="50%" height={14} borderRadius={radius.sm} />
    </View>
  );
}
