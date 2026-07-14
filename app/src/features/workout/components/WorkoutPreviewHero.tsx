import { StyleSheet, Text, View } from "react-native";
import { HeroEntrance } from "../../../animation/HeroEntrance";
import { Chip } from "../../../components/Chip";
import { FloatingStatChip } from "../../../components/FloatingStatChip";
import { HeroAmbientLayer } from "../../../components/HeroAmbientLayer";
import { heroLayout, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { MuscleGroup } from "../types";
import { formatMuscleGroupLabel } from "../utils/presentationFormatters";

interface WorkoutPreviewHeroProps {
  programName: string;
  weekLabel: string;
  dayLabel: string;
  focus: string;
  durationMinutes: number;
  workingSetCount: number;
  sessionDifficulty: string;
  muscleGroups: MuscleGroup[];
}

export function WorkoutPreviewHero({
  programName,
  weekLabel,
  dayLabel,
  focus,
  durationMinutes,
  workingSetCount,
  sessionDifficulty,
  muscleGroups,
}: WorkoutPreviewHeroProps) {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      hero: {
        marginHorizontal: -spacing.screenPadding,
        marginBottom: spacing.md,
        borderBottomLeftRadius: heroLayout.heroRadius,
        borderBottomRightRadius: heroLayout.heroRadius,
      },
      content: {
        paddingHorizontal: spacing.screenPadding,
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
      programTitle: {
        ...typography.metric,
      },
      focusTitle: {
        ...typography.display,
        color: colors.inkSecondary,
        marginTop: spacing.xs,
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
      muscleRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: heroLayout.chipRowGap,
        marginTop: spacing.xs,
      },
    }),
  );

  const workingSetsLabel = workingSetCount === 1 ? "1 set" : `${workingSetCount} sets`;

  return (
    <HeroAmbientLayer style={styles.hero}>
      <View style={styles.content}>
        <HeroEntrance delay={0}>
          <View style={styles.chipRow}>
            <Chip label={weekLabel} variant="accent" size="lg" icon="calendar-outline" />
            <Chip label={dayLabel} variant="neutral" size="lg" icon="fitness-outline" />
          </View>

          <View style={styles.headlineBlock}>
            <Text style={styles.missionLabel}>{"Today's mission"}</Text>
            <Text style={styles.programTitle} numberOfLines={2}>
              {programName}
            </Text>
            <Text style={styles.focusTitle} numberOfLines={3}>
              {focus}
            </Text>
          </View>
        </HeroEntrance>

        <View style={styles.statGrid}>
          <View style={styles.statRow}>
            <FloatingStatChip
              label="Duration"
              value={`${durationMinutes} min`}
              icon="time-outline"
              tone="accent"
              style={styles.statChip}
              enterIndex={0}
            />
            <FloatingStatChip
              label="Working sets"
              value={workingSetsLabel}
              icon="barbell-outline"
              tone="neutral"
              style={styles.statChip}
              enterIndex={1}
            />
          </View>
          <View style={styles.statRow}>
            <FloatingStatChip
              label="Difficulty"
              value={sessionDifficulty}
              icon="flame-outline"
              tone="warm"
              style={styles.statChip}
              enterIndex={2}
            />
            <FloatingStatChip
              label="Muscle focus"
              value={
                muscleGroups.length > 0
                  ? muscleGroups.map(formatMuscleGroupLabel).join(" · ")
                  : "—"
              }
              icon="body-outline"
              tone="accent"
              style={styles.statChip}
              enterIndex={3}
            />
          </View>
        </View>

        {muscleGroups.length > 0 ? (
          <View style={styles.muscleRow}>
            {muscleGroups.map((group) => (
              <Chip
                key={group}
                label={formatMuscleGroupLabel(group)}
                variant="outline"
                size="sm"
              />
            ))}
          </View>
        ) : null}
      </View>
    </HeroAmbientLayer>
  );
}
