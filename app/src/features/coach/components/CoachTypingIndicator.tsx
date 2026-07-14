import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { AppCard } from "../../../components/AppCard";
import { useTheme } from "../../../theme/ThemeContext";
import { coachLayout, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

const avatarSize = coachLayout.assistantAvatarSize;
const DOT_SIZE = spacing.xs + spacing.xs;
const DOT_STAGGER_MS = 160;

function TypingDot({ delayMs, color }: { delayMs: number; color: string }) {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 320 }),
          withTiming(0.35, { duration: 320 }),
        ),
        -1,
        false,
      ),
    );
  }, [delayMs, opacity]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: DOT_SIZE,
          height: DOT_SIZE,
          borderRadius: DOT_SIZE / 2,
          backgroundColor: color,
        },
        dotStyle,
      ]}
    />
  );
}

export function CoachTypingIndicator() {
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors }) =>
    StyleSheet.create({
      row: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: spacing.sm,
        maxWidth: coachLayout.messageMaxWidth,
        alignSelf: "flex-start",
      },
      avatarColumn: {
        paddingBottom: spacing.xs,
      },
      avatarRing: {
        width: avatarSize,
        height: avatarSize,
        borderRadius: avatarSize / 2,
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
      },
      avatarInner: {
        width: avatarSize - spacing.xs,
        height: avatarSize - spacing.xs,
        borderRadius: (avatarSize - spacing.xs) / 2,
        backgroundColor: colors.ink,
        alignItems: "center",
        justifyContent: "center",
      },
      messageColumn: {
        flex: 1,
        minWidth: 0,
      },
      card: {
        marginBottom: 0,
        borderBottomLeftRadius: coachLayout.bubbleTailRadius,
        borderTopLeftRadius: coachLayout.assistantBubbleRadius,
        borderTopRightRadius: coachLayout.assistantBubbleRadius,
        borderBottomRightRadius: coachLayout.assistantBubbleRadius,
      },
      dotsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
        minHeight: spacing.lg,
      },
    }),
  );

  return (
    <View style={styles.row} accessibilityLabel="Coach is typing" accessibilityRole="text">
      <View style={styles.avatarColumn}>
        <LinearGradient
          colors={[colors.pulse, colors.ink]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatarRing}
        >
          <View style={styles.avatarInner}>
            <Ionicons name="sparkles" size={spacing.icon.xs} color={colors.textOnInk} />
          </View>
        </LinearGradient>
      </View>

      <View style={styles.messageColumn}>
        <AppCard variant="glass" glow padding="compact" style={styles.card}>
          <View style={styles.dotsRow}>
            <TypingDot delayMs={0} color={colors.inkMuted} />
            <TypingDot delayMs={DOT_STAGGER_MS} color={colors.inkMuted} />
            <TypingDot delayMs={DOT_STAGGER_MS * 2} color={colors.inkMuted} />
          </View>
        </AppCard>
      </View>
    </View>
  );
}
