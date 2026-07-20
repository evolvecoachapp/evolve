import type {
  WorkoutPreviewExercise,
  WorkoutPreviewSet,
} from "../../training/application";

const PRESCRIPTION_SET_TYPES = new Set([
  "working",
  "top_set",
  "back_off",
  "drop_set",
  "amrap",
  "failure",
  "myorep",
  "cluster",
  "deload",
]);

function prescriptionSets(sets: readonly WorkoutPreviewSet[]): readonly WorkoutPreviewSet[] {
  const filtered = sets.filter((set) => PRESCRIPTION_SET_TYPES.has(set.setType));
  return filtered.length > 0 ? filtered : sets;
}

/** Working/prescription set summary, e.g. "3 × 8–12" or "4 sets". */
export function formatPreviewSetsSummary(sets: readonly WorkoutPreviewSet[]): string {
  const relevant = prescriptionSets(sets);
  const count = relevant.length;

  if (count === 0) {
    return "0 sets";
  }

  const labels = relevant.map((set) => set.reps.label);
  const unique = [...new Set(labels)];

  if (unique.length === 1) {
    return `${count} × ${unique[0]}`;
  }

  if (unique.length === 0) {
    return count === 1 ? "1 set" : `${count} sets`;
  }

  return `${count} × ${unique[0]}`;
}

/** Intensity label from prescribed sets (first non-null intensity wins, else —). */
export function formatPreviewIntensity(sets: readonly WorkoutPreviewSet[]): string {
  const relevant = prescriptionSets(sets);
  const withIntensity = relevant.find((set) => set.intensity !== null);

  if (withIntensity?.intensity) {
    return withIntensity.intensity.label;
  }

  const anyIntensity = sets.find((set) => set.intensity !== null);
  return anyIntensity?.intensity?.label ?? "—";
}

/** Focus chips for a training day — primary muscle labels already display-ready. */
export function formatPreviewFocus(primaryFocus: readonly string[]): string {
  if (primaryFocus.length === 0) {
    return "Full session";
  }
  return primaryFocus.join(" · ");
}

/** Compact set/reps/intensity line for expanded exercise detail. */
export function formatPreviewSetLine(set: WorkoutPreviewSet): string {
  const intensity = set.intensity?.label;
  const parts = [set.setTypeLabel, `${set.reps.label} reps`];
  if (intensity) {
    parts.push(intensity);
  }
  return parts.join(" · ");
}

/** Count prescription sets across exercises (for hero stats). */
export function countPreviewPrescriptionSets(
  exercises: readonly WorkoutPreviewExercise[],
): number {
  return exercises.reduce((total, exercise) => total + prescriptionSets(exercise.sets).length, 0);
}
