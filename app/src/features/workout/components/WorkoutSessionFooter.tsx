import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../../../components/AppButton";
import { FloatingFooterAnchor, FloatingSurface } from "../../../components/FloatingSurface";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

interface WorkoutSessionFooterProps {
  label: string;
  summary: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  /** Reserve tab-bar space (default). Disable on stack screens without a tab bar. */
  aboveTabBar?: boolean;
}

/** Floating primary CTA for the active session — mirrors `WorkoutStartFooter`'s chrome for visual continuity with the preview screen. */
export function WorkoutSessionFooter({
  label,
  summary,
  onPress,
  loading = false,
  disabled = false,
  aboveTabBar = true,
}: WorkoutSessionFooterProps) {
  const { colors } = useTheme();
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

  return (
    <FloatingFooterAnchor aboveTabBar={aboveTabBar}>
      <FloatingSurface variant="footer">
        <View style={styles.summaryRow}>
          <View style={styles.summaryIcon}>
            <Ionicons name="barbell-outline" size={spacing.icon.sm} color={colors.pulse} />
          </View>
          <Text style={styles.summary}>{summary}</Text>
        </View>

        <AppButton
          label={label}
          size="lg"
          onPress={onPress}
          loading={loading}
          disabled={disabled}
          style={styles.cta}
          interaction="floating"
          haptic="medium"
        />
      </FloatingSurface>
    </FloatingFooterAnchor>
  );
}
