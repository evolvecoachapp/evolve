import { powerbuildingProgram } from "../mocks/powerbuildingProgram";
import type { WorkoutDay, WorkoutProgram, WorkoutWeek } from "../types";
import { findProgramDay, findWeek } from "../utils";

/** Read-only hook for the active mock program. */
export function useWorkoutProgram(): WorkoutProgram {
  return powerbuildingProgram;
}

/** Read-only hook for a specific program week. */
export function useWorkoutWeek(weekNumber: number): WorkoutWeek | undefined {
  const program = useWorkoutProgram();
  return findWeek(program, weekNumber);
}

/** Read-only hook for a specific training day. */
export function useWorkoutDay(weekNumber: number, dayNumber: number): WorkoutDay | undefined {
  const program = useWorkoutProgram();
  return findProgramDay(program, weekNumber, dayNumber);
}
