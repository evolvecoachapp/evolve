import { useMemo } from "react";
import { workoutService } from "../services";
import type { WorkoutSession } from "../types";
import { cloneExercises } from "../utils";
import { useWorkoutProgram } from "./useWorkoutProgram";

/**
 * Returns a scheduled session preview cloned from the day template.
 * Call workoutService.createSession() when the user taps Start Workout.
 */
export function useWorkoutSession(weekNumber: number, dayNumber: number): WorkoutSession | undefined {
  const program = useWorkoutProgram();

  return useMemo(() => {
    const day = workoutService.getDay(program.id, weekNumber, dayNumber);
    if (!day || day.isRestDay) {
      return undefined;
    }

    return {
      id: `preview-${program.id}-w${weekNumber}-d${dayNumber}`,
      programId: program.id,
      weekNumber,
      dayNumber,
      dayLabel: day.label,
      status: "scheduled",
      startedAt: null,
      completedAt: null,
      exercises: cloneExercises(day.exercises),
    };
  }, [program.id, weekNumber, dayNumber]);
}
