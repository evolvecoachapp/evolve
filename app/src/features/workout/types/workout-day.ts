import type { WorkoutExercise } from "./workout-exercise";

/** A single training day within a program week. */

export interface WorkoutDay {
  id: string;
  dayNumber: number;
  label: string;
  focus: string;
  estimatedDurationMinutes: number;
  isRestDay: boolean;
  exercises: WorkoutExercise[];
}
