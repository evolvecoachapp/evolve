import { useEffect, useState } from "react";
import type { Workout } from "../models/Workout";
import { workoutService, type WorkoutService } from "../services";
import { WorkoutServiceError } from "../types/workoutService";

interface UseWorkoutOptions {
  service?: WorkoutService;
}

export function useWorkout({ service = workoutService }: UseWorkoutOptions = {}) {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    service
      .getTodayWorkout()
      .then((nextWorkout) => {
        if (cancelled) {
          return;
        }
        setWorkout(nextWorkout);
        setLoading(false);
      })
      .catch((caughtError: unknown) => {
        if (cancelled) {
          return;
        }
        setWorkout(null);
        setError(
          caughtError instanceof WorkoutServiceError
            ? caughtError.message
            : "Failed to load today's workout.",
        );
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [service]);

  return {
    workout,
    loading,
    error,
  };
}
