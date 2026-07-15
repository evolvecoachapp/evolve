import type { WorkoutSummary } from "../models/WorkoutSummary";

type RouteParamValue = string | string[] | undefined;

function readParam(params: Record<string, RouteParamValue>, key: string): string | null {
  const value = params[key];
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  return null;
}

function readNumberParam(params: Record<string, RouteParamValue>, key: string): number {
  const raw = readParam(params, key);
  if (!raw) {
    return 0;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Reconstructs a `WorkoutSummary` from expo-router search params. */
export function parseWorkoutSummaryParams(
  params: Record<string, RouteParamValue>,
): WorkoutSummary | null {
  const sessionId = readParam(params, "sessionId");
  const workoutId = readParam(params, "workoutId");
  const title = readParam(params, "title");
  const completedAt = readParam(params, "completedAt");

  if (!sessionId || !workoutId || !title || !completedAt) {
    return null;
  }

  const notes = readParam(params, "notes");

  return {
    sessionId,
    workoutId,
    title,
    durationMinutes: readNumberParam(params, "durationMinutes"),
    totalVolumeKg: readNumberParam(params, "totalVolumeKg"),
    completedSets: readNumberParam(params, "completedSets"),
    totalSets: readNumberParam(params, "totalSets"),
    completedExercises: readNumberParam(params, "completedExercises"),
    totalExercises: readNumberParam(params, "totalExercises"),
    skippedExercises: readNumberParam(params, "skippedExercises"),
    completedAt,
    ...(notes ? { notes } : {}),
  };
}

/** Serializes a `WorkoutSummary` into expo-router search params. */
export function serializeWorkoutSummaryParams(summary: WorkoutSummary): Record<string, string> {
  return {
    sessionId: summary.sessionId,
    workoutId: summary.workoutId,
    title: summary.title,
    durationMinutes: String(summary.durationMinutes),
    totalVolumeKg: String(summary.totalVolumeKg),
    completedSets: String(summary.completedSets),
    totalSets: String(summary.totalSets),
    completedExercises: String(summary.completedExercises),
    totalExercises: String(summary.totalExercises),
    skippedExercises: String(summary.skippedExercises),
    completedAt: summary.completedAt,
    ...(summary.notes ? { notes: summary.notes } : {}),
  };
}
