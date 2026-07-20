import { StyleSheet, Text, View } from "react-native";
import { Chip } from "../../../components/Chip";
import { FloatingStatChip } from "../../../components/FloatingStatChip";
import { ProgressBar } from "../../../components/ProgressBar";
import { heroLayout, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { SessionInteractionStatus } from "../types/sessionExecutionState";

interface SessionHeroProps {
  title: string;
  subtitle: string;
  goalLabel: string;
  exerciseCount: number;
  setCount: number;
  durationMinutes: number;
  primaryFocus: readonly string[];
  interactionStatus: SessionInteractionStatus;
  completedSets: number;
  accountedSets: number;
  sessionProgressPercent: number;
}

function statusChip(status: SessionInteractionStatus): {
  label: string;
  variant: "outline" | "accent" | "warm";
  icon: "flash-outline" | "play-outline" | "checkmark-circle-outline";
} {
  switch (status) {
    case "in_progress":
      return { label: "In progress", variant: "accent", icon: "play-outline" };
    case "completed":
      return { label: "Complete", variant: "warm", icon: "checkmark-circle-outline" };
    default:
      return { label: "Ready", variant: "outline", icon: "flash-outline" };
  }
}

/** Session briefing header with local execution progress. */
export function SessionHero({
  title,
  subtitle,
  goalLabel,
  exerciseCount,
  setCount,
  durationMinutes,
  primaryFocus,
  interactionStatus,
  completedSets,
  accountedSets,
  sessionProgressPercent,
}: SessionHeroProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      content: {
        gap: heroLayout.contentGap,
      },
      chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: heroLayout.chipRowGap,
      },
      headlineBlock: {
        gap: heroLayout.headlineGap,
        paddingTop: spacing.sm,
      },
      missionLabel: {
        ...typography.eyebrow,
        color: colors.pulse,
      },
      title: {
        ...typography.metric,
      },
      subtitle: {
        ...typography.callout,
        color: colors.inkSecondary,
        marginTop: spacing.xs,
      },
      focusRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
      },
      progressBlock: {
        gap: spacing.xs,
        marginTop: spacing.xs,
      },
      progressRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      },
      progressLabel: {
        ...typography.caption,
        color: colors.inkSecondary,
        fontWeight: "600",
      },
      progressMeta: {
        ...typography.caption,
        color: colors.inkMuted,
      },
      statGrid: {
        gap: spacing.md,
        marginTop: spacing.sm,
      },
      statRow: {
        flexDirection: "row",
        gap: spacing.md,
      },
      statChip: {
        flex: 1,
        minWidth: 0,
      },
    }),
  );

  const exerciseLabel = exerciseCount === 1 ? "1 movement" : `${exerciseCount} movements`;
  const setLabel = setCount === 1 ? "1 set" : `${setCount} sets`;
  const status = statusChip(interactionStatus);
  const progressValue =
    setCount === 0 ? "0 sets" : `${accountedSets} / ${setCount} sets`;

  return (
    <View style={styles.content}>
      <View style={styles.chipRow}>
        <Chip label={goalLabel} variant="accent" size="sm" icon="flag-outline" />
        <Chip label={status.label} variant={status.variant} size="sm" icon={status.icon} />
      </View>

      <View style={styles.headlineBlock}>
        <Text style={styles.missionLabel}>{"Today's session"}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {primaryFocus.length > 0 ? (
        <View style={styles.focusRow}>
          {primaryFocus.map((focus) => (
            <Chip key={focus} label={focus} variant="warm" size="sm" icon="body-outline" />
          ))}
        </View>
      ) : null}

      <View style={styles.progressBlock}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Session progress</Text>
          <Text style={styles.progressMeta}>
            {progressValue}
            {completedSets > 0 ? ` · ${completedSets} logged` : ""}
          </Text>
        </View>
        <ProgressBar progress={sessionProgressPercent} height={6} />
      </View>

      <View style={styles.statGrid}>
        <View style={styles.statRow}>
          <FloatingStatChip
            style={styles.statChip}
            label="Movements"
            value={exerciseLabel}
            icon="barbell-outline"
          />
          <FloatingStatChip
            style={styles.statChip}
            label="Sets"
            value={setLabel}
            icon="layers-outline"
          />
        </View>
        <View style={styles.statRow}>
          <FloatingStatChip
            style={styles.statChip}
            label="Est. duration"
            value={`~${durationMinutes} min`}
            icon="time-outline"
          />
        </View>
      </View>
    </View>
  );
}
