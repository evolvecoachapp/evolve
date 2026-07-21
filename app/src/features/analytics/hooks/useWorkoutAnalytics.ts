import { useEffect, useState } from "react";
import {
  getAnalyticsSnapshot,
  getExerciseFrequency,
  type AnalyticsSnapshot,
} from "../application";
import type { WorkoutTrend } from "../models/WorkoutTrend";
import {
  workoutAnalyticsRepository,
  type WorkoutAnalyticsRepository,
} from "../repository";

interface UseWorkoutAnalyticsOptions {
  repository?: WorkoutAnalyticsRepository;
  /** Trend window length in UTC weeks (default 8). */
  weeks?: number;
  /** Anchor for weekly / trend windows; defaults to now inside the repository. */
  referenceDate?: Date;
}

/**
 * Loads workout analytics via the application layer.
 * Presentation must not talk to history storage or compute aggregates inline.
 */
export function useWorkoutAnalytics({
  repository = workoutAnalyticsRepository,
  weeks = 8,
  referenceDate,
}: UseWorkoutAnalyticsOptions = {}) {
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getAnalyticsSnapshot({ weeks, referenceDate, repository })
      .then((next) => {
        if (cancelled) {
          return;
        }
        setSnapshot(next);
        setLoading(false);
      })
      .catch((caughtError: unknown) => {
        if (cancelled) {
          return;
        }
        setSnapshot(null);
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to load workout analytics.",
        );
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [repository, weeks, referenceDate]);

  function loadExerciseFrequency(
    exerciseId: string,
    frequencyWeeks?: number,
  ): Promise<WorkoutTrend> {
    return getExerciseFrequency(
      exerciseId,
      frequencyWeeks ?? weeks,
      referenceDate,
      repository,
    );
  }

  return {
    workout: snapshot?.workout ?? null,
    exercises: snapshot?.exercises ?? Object.freeze([]),
    weekly: snapshot?.weekly ?? null,
    volumeTrend: snapshot?.volumeTrend ?? null,
    workoutFrequency: snapshot?.workoutFrequency ?? null,
    loading,
    error,
    loadExerciseFrequency,
  };
}
