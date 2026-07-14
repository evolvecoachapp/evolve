import { useEffect, useState } from "react";
import type { Workout } from "../models/Workout";
import { workoutService, type WorkoutService } from "../services";

interface UseWorkoutOptions {
  service?: WorkoutService;
}

export function useWorkout({ service = workoutService }: UseWorkoutOptions = {}) {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void service.getTodayWorkout().then((nextWorkout) => {
      if (cancelled) {
        return;
      }
      setWorkout(nextWorkout);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [service]);

  return {
    workout,
    loading,
  };
}
