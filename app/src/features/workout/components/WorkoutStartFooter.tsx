import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../../../components/AppButton";
import { FloatingFooterAnchor, FloatingSurface } from "../../../components/FloatingSurface";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

interface WorkoutStartFooterProps {
  exerciseCount: number;
  durationMinutes: number;
  onStartPress?: () => void;
  /** Explicit disabled state — defaults to true when no handler is provided. */
  disabled?: boolean;
}

export function WorkoutStartFooter({
  exerciseCount,
  durationMinutes,
  onStartPress,
  disabled,
}: WorkoutStartFooterProps) {
  const { colors } = useTheme();
  const isDisabled = disabled ?? onStartPress === undefined;
  const styles = useThemedStyles(({ colors, typography, radius }) =>
    StyleSheet.create({
      summaryRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.sm,
      },
      summaryIcon: {
        width: spacing.xl,
        height: spacing.xl,
        borderRadius: radius.full,
        backgroundColor: colors.pulseMuted,
        alignItems: "center",
        justifyContent: "center",
      },
      summary: {
        ...typography.callout,
        color: colors.inkSecondary,
        fontWeight: "600",
      },
      cta: {
        minHeight: spacing["3xl"],
        borderRadius: radius.lg,
      },
    }),
  );

  const summary =
    exerciseCount === 1
      ? `1 movement · ~${durationMinutes} min`
      : `${exerciseCount} movements · ~${durationMinutes} min`;

  return (
    <FloatingFooterAnchor>
      <FloatingSurface variant="footer">
        <View style={styles.summaryRow}>
          <View style={styles.summaryIcon}>
            <Ionicons name="flash-outline" size={spacing.icon.sm} color={colors.pulse} />
          </View>
          <Text style={styles.summary}>{summary}</Text>
        </View>

        <AppButton
          label="Start Workout"
          size="lg"
          onPress={onStartPress ?? (() => {})}
          disabled={isDisabled}
          style={styles.cta}
          interaction="floating"
          haptic="medium"
        />
      </FloatingSurface>
    </FloatingFooterAnchor>
  );
}
