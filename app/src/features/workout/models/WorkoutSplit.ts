import type { WorkoutGoal } from "./WorkoutGoal";

/** A single training day within a program split. */
export interface WorkoutDay {
  id: string;
  dayNumber: number;
  label: string;
  focus: string;
  estimatedDuration: number;
  isRestDay: boolean;
  workoutId: string | null;
}

/** A week within a training split. */
export interface WorkoutWeek {
  id: string;
  weekNumber: number;
  label: string;
  theme: string;
  days: WorkoutDay[];
}

/** A multi-week training split containing scheduled workout days. */
export interface WorkoutSplit {
  id: string;
  name: string;
  description: string;
  goal: WorkoutGoal;
  durationWeeks: number;
  weeks: WorkoutWeek[];
}
