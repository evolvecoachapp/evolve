import type { SessionStatus } from "./common";
import type { WorkoutExercise } from "./workout-exercise";

/**
 * A single execution instance of a program day.
 * Exercises are deep-copied from the day template so set completion can
 * mutate locally without affecting the program prescription.
 */

export interface WorkoutSession {
  id: string;
  programId: string;
  weekNumber: number;
  dayNumber: number;
  dayLabel: string;
  status: SessionStatus;
  startedAt: string | null;
  completedAt: string | null;
  exercises: WorkoutExercise[];
}
