import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { heroEntering } from "../../../animation/entering";
import { useReduceMotion } from "../../../animation/useReduceMotion";
import { AppCard } from "../../../components/AppCard";
import { Chip } from "../../../components/Chip";
import { ProgressBar } from "../../../components/ProgressBar";
import { spacing } from "../../../theme/theme";
import { useTheme } from "../../../theme/ThemeContext";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import type { ExerciseEquipment } from "../models/ExerciseEquipment";
import type { ExerciseMuscleGroup } from "../models/ExerciseMuscleGroup";
import type { WorkoutExercise } from "../models/WorkoutExercise";
import { enrichExercise } from "../utils/exerciseEnrichment";
import { formatMuscleGroupLabel, formatWorkingSetsSummary } from "../utils/presentationFormatters";
import { getExerciseSetProgress } from "../utils/sessionSelectors";
import { toLegacyExerciseSet } from "../utils/workoutAdapters";
import { ExerciseMediaPlaceholder } from "./ExerciseMediaPlaceholder";
import { WorkoutWarmupSetsList } from "./WorkoutWarmupSetsList";

interface WorkoutSessionExerciseCardProps {
  exercise: WorkoutExercise;
  exerciseNumber: number;
  exerciseTotal: number;
  setNumber: number;
  setTotal: number;
}

function formatMovementPattern(value?: string): string {
  const normalized = (value ?? "compound").toLowerCase();
  const labels: Record<string, string> = {
    squat: "Squat",
    hinge: "Hinge",
    push: "Push",
    pull: "Pull",
    carry: "Carry",
    rotation: "Rotation",
    compound: "Compound",
    isolation: "Isolation",
    mobility: "Mobility",
  };
  return labels[normalized] ?? normalized;
}

function formatEquipmentList(equipment?: ExerciseEquipment[]): string {
  if (!equipment || equipment.length === 0) {
    return "Bodyweight";
  }
  return equipment.map((item) => item.charAt(0).toUpperCase() + item.slice(1)).join(" · ");
}

function formatBodyRegion(value?: string): string {
  const normalized = (value ?? "full-body").toLowerCase();
  const labels: Record<string, string> = {
    "full-body": "Full body",
    "lower-body": "Lower body",
    "upper-body": "Upper body",
    "posterior-chain": "Posterior chain",
    shoulders: "Shoulders",
    "upper-back": "Upper back",
    "upper-arm": "Upper arm",
  };
  return labels[normalized] ?? value ?? "Full body";
}

function formatRestLabel(seconds?: number): string {
  if (!seconds) {
    return "—";
  }
  if (seconds >= 60) {
    const minutes = Math.round(seconds / 60);
    return `${minutes} min`;
  }
  return `${seconds}s`;
}

function formatMuscleList(groups?: ExerciseMuscleGroup[]): string {
  if (!groups || groups.length === 0) {
    return "—";
  }
  return groups.map((group) => formatMuscleGroupLabel(group)).join(" · ");
}

export function WorkoutSessionExerciseCard({
  exercise,
  exerciseNumber,
  exerciseTotal,
  setNumber,
  setTotal,
}: WorkoutSessionExerciseCardProps) {
  const reduceMotion = useReduceMotion();
  const { colors } = useTheme();
  const enriched = enrichExercise(exercise.exercise);
  const exerciseProgress = getExerciseSetProgress(exercise);
  const metadata = enriched.metadata;
  const primaryMuscles = enriched.primaryMuscles ?? metadata?.primaryMuscles ?? [enriched.muscleGroup];
  const secondaryMuscles = enriched.secondaryMuscles ?? metadata?.secondaryMuscles ?? [];
  const executionSteps = metadata?.executionSteps ?? [];
  const safetyNotes = metadata?.safetyNotes ?? [];
  const commonMistakes = enriched.commonMistakes ?? metadata?.commonMistakes ?? [];
  const coachTip = metadata?.coachTip;
  const breathingInstructions = metadata?.breathingInstructions;

  const styles = useThemedStyles(({ colors, typography, radius }) =>
    StyleSheet.create({
      card: {
        gap: spacing.lg,
      },
      eyebrow: {
        ...typography.caption,
        color: colors.inkSecondary,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.6,
      },
      header: {
        gap: spacing.sm,
      },
      titleRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        gap: spacing.sm,
      },
      title: {
        ...typography.title2,
        flexShrink: 1,
      },
      summary: {
        ...typography.callout,
        color: colors.inkSecondary,
      },
      chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
      },
      detailsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
      },
      detailCard: {
        minWidth: "47%",
        flexGrow: 1,
        padding: spacing.md,
        borderRadius: radius.lg,
        backgroundColor: colors.overlayStrong,
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing.xs,
      },
      detailLabel: {
        ...typography.caption,
        color: colors.inkMuted,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.6,
      },
      detailValue: {
        ...typography.callout,
        color: colors.inkSecondary,
      },
      sectionCard: {
        padding: spacing.md,
        borderRadius: radius.xl,
        backgroundColor: colors.surfaceElevated,
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing.md,
      },
      section: {
        gap: spacing.xs,
      },
      sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
      },
      sectionLabel: {
        ...typography.callout,
        color: colors.ink,
        fontWeight: "700",
      },
      sectionBody: {
        ...typography.callout,
        color: colors.inkSecondary,
        lineHeight: 22,
      },
      bullet: {
        ...typography.callout,
        color: colors.inkSecondary,
        lineHeight: 22,
      },
      loggingPanel: {
        padding: spacing.md,
        borderRadius: radius.xl,
        backgroundColor: colors.overlayStrong,
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing.md,
      },
      loggingHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.sm,
      },
      loggingTitle: {
        ...typography.callout,
        color: colors.ink,
        fontWeight: "700",
      },
      setBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.full,
        backgroundColor: colors.pulseMuted,
      },
      setBadgeText: {
        ...typography.caption,
        color: colors.pulse,
        fontWeight: "700",
      },
      progressSection: {
        gap: spacing.xs,
      },
      progressLabel: {
        ...typography.caption,
        color: colors.inkMuted,
        fontWeight: "600",
      },
    }),
  );

  return (
    <Animated.View entering={heroEntering(0, reduceMotion)}>
      <AppCard variant="elevated" style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            Exercise {exerciseNumber} of {exerciseTotal}
          </Text>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{enriched.name}</Text>
            <Chip label={metadata?.difficulty ?? "Beginner"} variant="accent" size="sm" />
          </View>
          <Text style={styles.summary}>
            {formatWorkingSetsSummary(exercise.workingSets.map(toLegacyExerciseSet))}
          </Text>
        </View>

        <ExerciseMediaPlaceholder
          imageUrl={enriched.imageUrl}
          videoUrl={enriched.videoUrl}
          exerciseName={enriched.name}
        />

        <View style={styles.chipRow}>
          <Chip label={formatMovementPattern(metadata?.movementPattern)} variant="outline" size="sm" />
          <Chip label={formatEquipmentList(metadata?.equipment)} variant="neutral" size="sm" />
          <Chip label={formatMuscleGroupLabel(enriched.muscleGroup)} variant="warm" size="sm" />
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Body region</Text>
            <Text style={styles.detailValue}>{formatBodyRegion(metadata?.bodyRegion)}</Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Tempo</Text>
            <Text style={styles.detailValue}>{metadata?.tempo ?? "—"}</Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Recommended rest</Text>
            <Text style={styles.detailValue}>{formatRestLabel(metadata?.recommendedRestSeconds)}</Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Primary muscles</Text>
            <Text style={styles.detailValue}>{formatMuscleList(primaryMuscles)}</Text>
          </View>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Secondary muscles</Text>
            <Text style={styles.detailValue}>{formatMuscleList(secondaryMuscles)}</Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Equipment</Text>
            <Text style={styles.detailValue}>{formatEquipmentList(metadata?.equipment)}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          {coachTip ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="sparkles-outline" size={spacing.icon.sm} color={colors.pulse} />
                <Text style={styles.sectionLabel}>Coach tip</Text>
              </View>
              <Text style={styles.sectionBody}>{coachTip}</Text>
            </View>
          ) : null}

          {executionSteps.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="list-outline" size={spacing.icon.sm} color={colors.inkSecondary} />
                <Text style={styles.sectionLabel}>Execution steps</Text>
              </View>
              {executionSteps.map((step, index) => (
                <Text key={`${step}-${index}`} style={styles.bullet}>
                  {index + 1}. {step}
                </Text>
              ))}
            </View>
          ) : null}

          {breathingInstructions ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="heart-outline" size={spacing.icon.sm} color={colors.inkSecondary} />
                <Text style={styles.sectionLabel}>Breathing</Text>
              </View>
              <Text style={styles.sectionBody}>{breathingInstructions}</Text>
            </View>
          ) : null}

          {safetyNotes.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="shield-checkmark-outline" size={spacing.icon.sm} color={colors.inkSecondary} />
                <Text style={styles.sectionLabel}>Safety notes</Text>
              </View>
              {safetyNotes.map((note, index) => (
                <Text key={`${note}-${index}`} style={styles.bullet}>
                  • {note}
                </Text>
              ))}
            </View>
          ) : null}

          {commonMistakes.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="warning-outline" size={spacing.icon.sm} color={colors.warm} />
                <Text style={styles.sectionLabel}>Common mistakes</Text>
              </View>
              {commonMistakes.map((mistake, index) => (
                <Text key={`${mistake}-${index}`} style={styles.bullet}>
                  • {mistake}
                </Text>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.loggingPanel}>
          <View style={styles.loggingHeader}>
            <Text style={styles.loggingTitle}>Logging focus</Text>
            <View style={styles.setBadge}>
              <Text style={styles.setBadgeText}>Set {setNumber} of {setTotal}</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>
              Exercise progress · {exerciseProgress.completed} / {exerciseProgress.total} sets
            </Text>
            <ProgressBar progress={exerciseProgress.percent} height={4} />
          </View>

          <WorkoutWarmupSetsList warmupSets={exercise.warmupSets} />
        </View>
      </AppCard>
    </Animated.View>
  );
}
