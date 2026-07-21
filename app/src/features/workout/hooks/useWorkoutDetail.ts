import { useEffect, useState } from "react";
import { getCompletedSession } from "../application";
import type { CompletedWorkout } from "../models/CompletedWorkout";
import {
  workoutHistoryRepository,
  type WorkoutHistoryRepository,
} from "../repository";

interface UseWorkoutDetailOptions {
  sessionId?: string;
  repository?: WorkoutHistoryRepository;
}

/**
 * Loads one completed workout for the detail screen via the application layer.
 * Presentation hooks must not talk to AsyncStorage directly.
 */
export function useWorkoutDetail({
  sessionId,
  repository = workoutHistoryRepository,
}: UseWorkoutDetailOptions) {
  const [workout, setWorkout] = useState<CompletedWorkout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!sessionId || sessionId.length === 0) {
      setWorkout(null);
      setLoading(false);
      setError(null);
      setNotFound(true);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    setError(null);
    setNotFound(false);

    getCompletedSession(sessionId, repository)
      .then((nextWorkout) => {
        if (cancelled) {
          return;
        }
        setWorkout(nextWorkout);
        setNotFound(nextWorkout === null);
        setLoading(false);
      })
      .catch((caughtError: unknown) => {
        if (cancelled) {
          return;
        }
        setWorkout(null);
        setNotFound(false);
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to load workout detail.",
        );
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId, repository]);

  return {
    workout,
    loading,
    error,
    notFound,
  };
}
