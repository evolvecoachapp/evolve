import { useEffect, useState } from "react";
import { workoutService } from "../services";
import type { WorkoutSession } from "../models/WorkoutSession";
import { cloneWorkoutExercises } from "../utils/workoutAdapters";

/**
 * Returns a scheduled session preview cloned from today's workout template.
 * Call workoutService.startWorkout() when the user taps Start Workout.
 */
export function useWorkoutSession(): WorkoutSession | undefined {
  const [session, setSession] = useState<WorkoutSession | undefined>();

  useEffect(() => {
    let cancelled = false;

    void workoutService.getTodayWorkout().then((workout) => {
      if (cancelled) {
        return;
      }

      setSession({
        id: `preview-${workout.id}`,
        workoutId: workout.id,
        title: workout.title,
        subtitle: workout.subtitle,
        status: "scheduled",
        startedAt: null,
        completedAt: null,
        exercises: cloneWorkoutExercises(workout.exercises),
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return session;
}
