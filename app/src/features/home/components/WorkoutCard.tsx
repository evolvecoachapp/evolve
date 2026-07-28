import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { Chip } from "../../../components/Chip";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { WorkoutSummaryCard } from "../models/WorkoutSummaryCard";
import { DashboardSection } from "./DashboardSection";

interface WorkoutCardProps {
  readonly workout: WorkoutSummaryCard;
  readonly onPress?: () => void;
  readonly onView?: () => void;
}

/** Today's workout card — presentation only. */
export function WorkoutCard({ workout, onPress, onView }: WorkoutCardProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors, typography, radius }) =>
    StyleSheet.create({
      workoutHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: spacing.md,
        marginBottom: spacing.md,
      },
      workoutIcon: {
        width: spacing.avatar.lg,
        height: spacing.avatar.lg,
        borderRadius: radius.md,
        backgroundColor: colors.pulseMuted,
        alignItems: "center",
        justifyContent: "center",
      },
      workoutMeta: {
        flex: 1,
        gap: spacing.xs,
      },
      cardTitle: {
        ...typography.title3,
      },
      cardSubtitle: {
        ...typography.callout,
        color: colors.inkMuted,
      },
      cardMetaRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
      },
    }),
  );

  if (!workout.present) {
    return null;
  }

  return (
    <DashboardSection title="Today's Workout" actionLabel="View" onAction={onView}>
      <AppCard variant="floating" glow onPress={onPress}>
        <View style={styles.workoutHeader}>
          <View style={styles.workoutIcon}>
            <Ionicons
              name="barbell-outline"
              size={spacing.icon.lg}
              color={colors.pulse}
            />
          </View>
          <View style={styles.workoutMeta}>
            <Text style={styles.cardTitle}>{workout.name}</Text>
            <Text style={styles.cardSubtitle}>{workout.muscleGroups}</Text>
          </View>
        </View>
        <View style={styles.cardMetaRow}>
          <Chip
            label={`${workout.durationMinutes} min`}
            icon="time-outline"
            variant="neutral"
            size="sm"
          />
          <Chip label={workout.statusLabel} variant="accent" size="sm" />
        </View>
      </AppCard>
    </DashboardSection>
  );
}
