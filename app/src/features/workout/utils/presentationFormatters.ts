import type { MuscleGroup } from "../types/common";
import type { ExerciseSet, WorkoutDay, WorkoutExercise } from "../types";

const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  quads: "Quads",
  hamstrings: "Hamstrings",
  glutes: "Glutes",
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  core: "Core",
  calves: "Calves",
};

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
}

function formatNumericRange(values: number[], suffix = ""): string {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) {
    return `${formatNumber(min)}${suffix}`;
  }
  return `${formatNumber(min)}–${formatNumber(max)}${suffix}`;
}

/** Human-readable working-set prescription, e.g. "3 × 5" or "3 sets". */
export function formatWorkingSetsSummary(workingSets: ExerciseSet[]): string {
  const count = workingSets.length;
  if (count === 0) {
    return "0 sets";
  }

  const reps = workingSets
    .map((set) => set.targetReps)
    .filter((value): value is number => value !== null);

  if (reps.length === 0) {
    return count === 1 ? "1 set" : `${count} sets`;
  }

  return `${count} × ${formatNumericRange(reps)}`;
}

/** Intensity label from percentage and/or RPE targets on working sets. */
export function formatExerciseIntensity(workingSets: ExerciseSet[]): string {
  if (workingSets.length === 0) {
    return "—";
  }

  const percentages = workingSets
    .map((set) => set.percentage)
    .filter((value): value is number => value !== null);
  const rpes = workingSets.map((set) => set.rpe).filter((value): value is number => value !== null);

  const parts: string[] = [];

  if (percentages.length > 0) {
    parts.push(`@ ${formatNumericRange(percentages, "%")}`);
  }

  if (rpes.length > 0) {
    parts.push(`RPE ${formatNumericRange(rpes)}`);
  }

  if (parts.length > 0) {
    return parts.join(" · ");
  }

  const reps = workingSets
    .map((set) => set.targetReps)
    .filter((value): value is number => value !== null);

  return reps.length > 0 ? `${formatNumericRange(reps)} reps` : "—";
}

/** Compact duration label for stat chips. */
export function formatDurationMinutes(minutes: number): string {
  return `${minutes} min`;
}

/** Title-case label for a single muscle group token. */
export function formatMuscleGroupLabel(group: MuscleGroup): string {
  return MUSCLE_GROUP_LABELS[group];
}

/** Unique muscle groups targeted in a session, in exercise order. */
export function formatMuscleGroups(exercises: WorkoutExercise[]): MuscleGroup[] {
  const seen = new Set<MuscleGroup>();
  const groups: MuscleGroup[] = [];

  for (const exercise of exercises) {
    if (!seen.has(exercise.muscleGroup)) {
      seen.add(exercise.muscleGroup);
      groups.push(exercise.muscleGroup);
    }
  }

  return groups;
}

/** Comma-separated muscle group summary for compact stat chips. */
export function formatMuscleGroupsSummary(exercises: WorkoutExercise[]): string {
  const groups = formatMuscleGroups(exercises);
  if (groups.length === 0) {
    return "—";
  }
  return groups.map(formatMuscleGroupLabel).join(", ");
}

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function collectWorkingSetValues(
  day: WorkoutDay,
  pick: (set: ExerciseSet) => number | null,
): number[] {
  return day.exercises.flatMap((exercise) =>
    exercise.workingSets
      .map(pick)
      .filter((value): value is number => value !== null),
  );
}

function difficultyFromAverageRpe(avgRpe: number): string {
  if (avgRpe >= 9) {
    return "Maximal";
  }
  if (avgRpe >= 8.5) {
    return "Intense";
  }
  if (avgRpe >= 7.5) {
    return "Hard";
  }
  if (avgRpe >= 6.5) {
    return "Moderate";
  }
  return "Controlled";
}

function difficultyFromAveragePercentage(avgPercentage: number): string {
  if (avgPercentage >= 85) {
    return "Intense";
  }
  if (avgPercentage >= 77.5) {
    return "Hard";
  }
  if (avgPercentage >= 70) {
    return "Moderate";
  }
  return "Controlled";
}

function difficultyFromSessionVolume(day: WorkoutDay): string {
  const workingSets = day.exercises.reduce(
    (total, exercise) => total + exercise.workingSets.length,
    0,
  );
  if (day.estimatedDurationMinutes >= 90 || workingSets >= 24) {
    return "Hard";
  }
  if (day.estimatedDurationMinutes >= 60 || workingSets >= 16) {
    return "Moderate";
  }
  return "Controlled";
}

/** Human-readable session difficulty derived from prescription intensity. */
export function formatSessionDifficulty(day: WorkoutDay): string {
  const rpes = collectWorkingSetValues(day, (set) => set.rpe);
  const avgRpe = average(rpes);
  if (avgRpe !== null) {
    return difficultyFromAverageRpe(avgRpe);
  }

  const percentages = collectWorkingSetValues(day, (set) => set.percentage);
  const avgPercentage = average(percentages);
  if (avgPercentage !== null) {
    return difficultyFromAveragePercentage(avgPercentage);
  }

  return difficultyFromSessionVolume(day);
}
