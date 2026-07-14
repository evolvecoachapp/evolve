import type { WorkoutDay } from "./workout-day";

/** One microcycle within a program block. */

export interface WorkoutWeek {
  id: string;
  weekNumber: number;
  label: string;
  theme: string;
  days: WorkoutDay[];
}
