import type {
  WorkoutPreviewDay,
  WorkoutSession,
  WorkoutSessionExercise,
  WorkoutSessionSet,
} from "../../training/application";

/** Approximate work time per set, used only for footer duration estimates. */
const SECONDS_PER_SET_WORK = 45;
const DEFAULT_REST_SECONDS = 90;

/** Format rest duration for display, e.g. "2:00 rest" or "—". */
export function formatSessionRest(restSeconds: number | null): string {
  if (restSeconds === null || restSeconds <= 0) {
    return "—";
  }
  const minutes = Math.floor(restSeconds / 60);
  const seconds = restSeconds % 60;
  if (minutes === 0) {
    return `${seconds}s rest`;
  }
  if (seconds === 0) {
    return `${minutes}:00 rest`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")} rest`;
}

/** Compact set line: type · reps · intensity · rest. */
export function formatSessionSetLine(set: WorkoutSessionSet): string {
  const parts = [set.setTypeLabel, `${set.targetReps.label} reps`];
  if (set.intensity) {
    parts.push(set.intensity.label);
  }
  parts.push(formatSessionRest(set.restSeconds));
  return parts.join(" · ");
}

/** Working-set style summary for an exercise, e.g. "3 × 8–12". */
export function formatSessionSetsSummary(sets: readonly WorkoutSessionSet[]): string {
  if (sets.length === 0) {
    return "0 sets";
  }

  const labels = sets.map((set) => set.targetReps.label);
  const unique = [...new Set(labels)];

  if (unique.length === 1) {
    return `${sets.length} × ${unique[0]}`;
  }

  return sets.length === 1 ? "1 set" : `${sets.length} sets`;
}

/** First non-null intensity label across sets, else "—". */
export function formatSessionExerciseIntensity(sets: readonly WorkoutSessionSet[]): string {
  const withIntensity = sets.find((set) => set.intensity !== null);
  return withIntensity?.intensity?.label ?? "—";
}

/** Total sets across session exercises. */
export function countSessionSets(exercises: readonly WorkoutSessionExercise[]): number {
  return exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
}

/**
 * Rough duration estimate from a preview day (for the Start footer).
 * Uses set work time + prescribed rest; not a timer.
 */
export function estimatePreviewDayDurationMinutes(day: WorkoutPreviewDay): number {
  if (day.isRestDay || day.exercises.length === 0) {
    return 0;
  }

  let totalSeconds = 0;
  for (const exercise of day.exercises) {
    for (const set of exercise.sets) {
      totalSeconds += SECONDS_PER_SET_WORK + (set.restSeconds ?? DEFAULT_REST_SECONDS);
    }
  }

  return Math.max(1, Math.round(totalSeconds / 60));
}

/** Rough duration estimate from an executable session. */
export function estimateSessionDurationMinutes(session: WorkoutSession): number {
  let totalSeconds = 0;
  for (const exercise of session.exercises) {
    for (const set of exercise.sets) {
      totalSeconds += SECONDS_PER_SET_WORK + (set.restSeconds ?? DEFAULT_REST_SECONDS);
    }
  }
  return Math.max(1, Math.round(totalSeconds / 60));
}
