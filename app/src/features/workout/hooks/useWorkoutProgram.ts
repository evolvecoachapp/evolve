import { useMemo } from "react";
import { workoutService } from "../services";
import type { WorkoutDay, WorkoutProgram, WorkoutWeek } from "../types";

/** Read-only hook for the active mock program. */
export function useWorkoutProgram(): WorkoutProgram {
  return useMemo(() => workoutService.getActiveProgram(), []);
}

/** Read-only hook for a specific program week. */
export function useWorkoutWeek(weekNumber: number): WorkoutWeek | undefined {
  const program = useWorkoutProgram();
  return useMemo(
    () => workoutService.getWeek(program.id, weekNumber),
    [program.id, weekNumber],
  );
}

/** Read-only hook for a specific training day. */
export function useWorkoutDay(weekNumber: number, dayNumber: number): WorkoutDay | undefined {
  const program = useWorkoutProgram();
  return useMemo(
    () => workoutService.getDay(program.id, weekNumber, dayNumber),
    [program.id, weekNumber, dayNumber],
  );
}
