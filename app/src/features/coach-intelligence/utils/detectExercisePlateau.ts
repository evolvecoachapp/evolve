import type { CompletedWorkout } from "../../workout/models/CompletedWorkout";
import type { ExerciseRecord } from "../../records/models/ExerciseRecord";
import type { CoachInsight } from "../models/CoachInsight";
import { daysBetween } from "./math";

export interface DetectExercisePlateauOptions {
  readonly referenceDate: Date;
  /**
   * An exercise is plateaued when its last record is older than this many days
   * and it has been performed at least `minSessions` times. Default 28.
   */
  readonly plateauDays?: number;
  /** Minimum sessions including the exercise before flagging. Default 3. */
  readonly minSessions?: number;
}

/**
 * Detect exercises whose best load has not improved for `plateauDays`
 * despite continued training.
 */
export function detectExercisePlateau(
  exerciseRecords: readonly ExerciseRecord[],
  sessions: readonly CompletedWorkout[],
  options: DetectExercisePlateauOptions,
): readonly CoachInsight[] {
  const plateauDays = options.plateauDays ?? 28;
  const minSessions = options.minSessions ?? 3;
  const detectedAt = options.referenceDate.toISOString();
  const insights: CoachInsight[] = [];

  for (const record of exerciseRecords) {
    if (record.lastRecordAt == null || record.bestWeightKg == null) {
      continue;
    }

    const ageDays = daysBetween(record.lastRecordAt, options.referenceDate);
    if (ageDays < plateauDays) {
      continue;
    }

    const sessionsPerformed = sessions.filter((session) =>
      session.exercises.some(
        (exercise) =>
          exercise.id === record.exerciseId && exercise.sets.length > 0,
      ),
    ).length;

    if (sessionsPerformed < minSessions) {
      continue;
    }

    const recentPerformances = sessions.filter((session) => {
      const days = daysBetween(session.completedAt, options.referenceDate);
      return (
        days <= plateauDays &&
        session.exercises.some(
          (exercise) =>
            exercise.id === record.exerciseId && exercise.sets.length > 0,
        )
      );
    }).length;

    if (recentPerformances === 0) {
      continue;
    }

    insights.push(
      Object.freeze({
        id: `insight:exercise_plateau:${record.exerciseId}`,
        kind: "exercise_plateau" as const,
        confidence: 0.75,
        detectedAt,
        payload: Object.freeze({
          exerciseId: record.exerciseId,
          exerciseName: record.exerciseName,
          bestWeightKg: record.bestWeightKg,
          lastRecordAt: record.lastRecordAt,
          ageDays,
          plateauDays,
          sessionsPerformed,
          recentPerformances,
        }),
      }),
    );
  }

  return Object.freeze(insights);
}
