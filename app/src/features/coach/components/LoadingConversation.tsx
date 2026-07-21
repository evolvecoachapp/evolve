import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { AppCard } from "../../../components/AppCard";
import { coachLayout, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import { CoachAvatar } from "./CoachAvatar";

function SkeletonBar({
  width,
  height = spacing.md,
}: {
  width: number | `${number}%`;
  height?: number;
}) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 700 }),
        withTiming(0.4, { duration: 700 }),
      ),
      -1,
      false,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const styles = useThemedStyles(({ colors, radius }) =>
    StyleSheet.create({
      bar: {
        width,
        height,
        borderRadius: radius.sm,
        backgroundColor: colors.overlayStrong,
      },
    }),
  );

  return <Animated.View style={[styles.bar, animatedStyle]} />;
}

/** Animated conversation loading skeletons — no streaming. */
export function LoadingConversation() {
  const styles = useThemedStyles(() =>
    StyleSheet.create({
      container: {
        gap: coachLayout.messageSectionGap,
        paddingVertical: spacing.md,
      },
      row: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: spacing.sm,
        maxWidth: coachLayout.messageMaxWidth,
        alignSelf: "flex-start",
      },
      userRow: {
        alignSelf: "flex-end",
        maxWidth: coachLayout.messageMaxWidth,
      },
      card: {
        marginBottom: 0,
        gap: spacing.sm,
        flex: 1,
      },
      userCard: {
        marginBottom: 0,
        gap: spacing.sm,
        minWidth: "55%",
      },
    }),
  );

  return (
    <View
      style={styles.container}
      accessibilityLabel="Loading conversation"
      accessibilityRole="progressbar"
    >
      <View style={styles.row}>
        <CoachAvatar size="sm" />
        <AppCard variant="glass" padding="compact" style={styles.card}>
          <SkeletonBar width="88%" />
          <SkeletonBar width="64%" height={spacing.sm + spacing.xs} />
        </AppCard>
      </View>

      <View style={styles.userRow}>
        <AppCard variant="surface" padding="compact" style={styles.userCard}>
          <SkeletonBar width="72%" />
        </AppCard>
      </View>

      <View style={styles.row}>
        <CoachAvatar size="sm" />
        <AppCard variant="glass" padding="compact" style={styles.card}>
          <SkeletonBar width="92%" />
          <SkeletonBar width="48%" height={spacing.sm + spacing.xs} />
        </AppCard>
      </View>
    </View>
  );
}
