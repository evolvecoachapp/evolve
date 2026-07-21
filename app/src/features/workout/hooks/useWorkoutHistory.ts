import { useEffect, useState } from "react";
import { listCompletedSessions } from "../application";
import type { CompletedWorkout } from "../models/CompletedWorkout";
import {
  workoutHistoryRepository,
  type WorkoutHistoryRepository,
} from "../repository";

interface UseWorkoutHistoryOptions {
  repository?: WorkoutHistoryRepository;
}

/**
 * Loads completed workouts for the history timeline via the application layer.
 * Presentation hooks must not talk to AsyncStorage directly.
 */
export function useWorkoutHistory({
  repository = workoutHistoryRepository,
}: UseWorkoutHistoryOptions = {}) {
  const [sessions, setSessions] = useState<readonly CompletedWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    listCompletedSessions(repository)
      .then((nextSessions) => {
        if (cancelled) {
          return;
        }
        setSessions(nextSessions);
        setLoading(false);
      })
      .catch((caughtError: unknown) => {
        if (cancelled) {
          return;
        }
        setSessions([]);
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to load workout history.",
        );
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [repository]);

  return {
    sessions,
    loading,
    error,
  };
}
