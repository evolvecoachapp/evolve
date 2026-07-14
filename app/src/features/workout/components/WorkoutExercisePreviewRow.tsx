import { StyleSheet, Text, View } from "react-native";
import { Chip } from "../../../components/Chip";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

interface WorkoutExercisePreviewRowProps {
  orderNumber: number;
  name: string;
  workingSetsSummary: string;
  intensity: string;
  muscleGroupLabel?: string;
  isPrimary?: boolean;
  showDivider?: boolean;
}

const ORDER_BADGE_SIZE = spacing["3xl"];

export function WorkoutExercisePreviewRow({
  orderNumber,
  name,
  workingSetsSummary,
  intensity,
  muscleGroupLabel,
  isPrimary = false,
  showDivider = true,
}: WorkoutExercisePreviewRowProps) {
  const styles = useThemedStyles(({ colors, typography, radius, shadows }) =>
    StyleSheet.create({
      wrapper: {
        paddingHorizontal: spacing.lg,
      },
      row: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: spacing.md,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.lg,
        position: "relative",
        overflow: "hidden",
      },
      rowPrimary: {
        backgroundColor: colors.pulseMuted,
        borderWidth: 1,
        borderColor: colors.borderPulse,
        ...shadows.glow,
      },
      primaryAccent: {
        position: "absolute",
        left: 0,
        top: spacing.sm,
        bottom: spacing.sm,
        width: spacing.xs,
        borderRadius: radius.full,
        backgroundColor: colors.pulse,
      },
      orderBadge: {
        width: ORDER_BADGE_SIZE,
        height: ORDER_BADGE_SIZE,
        borderRadius: radius.lg,
        backgroundColor: colors.surfaceElevated,
        borderWidth: 1,
        borderColor: colors.borderStrong,
        alignItems: "center",
        justifyContent: "center",
        ...shadows.card,
      },
      orderBadgePrimary: {
        backgroundColor: colors.ink,
        borderColor: colors.ink,
        ...shadows.elevated,
      },
      orderText: {
        ...typography.orderBadge,
      },
      orderTextPrimary: {
        color: colors.textOnInk,
      },
      content: {
        flex: 1,
        minWidth: 0,
        gap: spacing.md,
        paddingTop: spacing.xs,
      },
      titleRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: spacing.sm,
      },
      name: {
        ...typography.bodyMedium,
        flex: 1,
        lineHeight: 24,
      },
      namePrimary: {
        ...typography.title2,
        lineHeight: 30,
      },
      metaRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
      },
      dividerTrack: {
        paddingLeft: ORDER_BADGE_SIZE + spacing.md + spacing.lg,
        paddingRight: spacing.lg,
      },
      divider: {
        height: 1,
        backgroundColor: colors.border,
        opacity: 0.9,
      },
    }),
  );

  return (
    <View style={styles.wrapper}>
      <View style={[styles.row, isPrimary && styles.rowPrimary]}>
        {isPrimary ? <View style={styles.primaryAccent} /> : null}

        <View style={[styles.orderBadge, isPrimary && styles.orderBadgePrimary]}>
          <Text style={[styles.orderText, isPrimary && styles.orderTextPrimary]}>
            {orderNumber}
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={[styles.name, isPrimary && styles.namePrimary]} numberOfLines={2}>
              {name}
            </Text>
            {isPrimary ? (
              <Chip label="Primary" variant="accent" size="sm" />
            ) : null}
          </View>

          <View style={styles.metaRow}>
            <Chip
              label={workingSetsSummary}
              variant={isPrimary ? "accent" : "neutral"}
              size="sm"
              icon="layers-outline"
            />
            <Chip label={intensity} variant="outline" size="sm" icon="speedometer-outline" />
            {muscleGroupLabel ? (
              <Chip label={muscleGroupLabel} variant="warm" size="sm" icon="body-outline" />
            ) : null}
          </View>
        </View>
      </View>

      {showDivider ? (
        <View style={styles.dividerTrack}>
          <View style={styles.divider} />
        </View>
      ) : null}
    </View>
  );
}
