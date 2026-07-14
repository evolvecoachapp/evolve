import type { WorkoutExercise } from "./WorkoutExercise";
import type { WorkoutStatus } from "./WorkoutStatus";

/** A runtime workout session created when the user starts a prescribed workout. */
export interface WorkoutSession {
  id: string;
  workoutId: string;
  title: string;
  subtitle: string;
  status: WorkoutStatus;
  startedAt: string | null;
  completedAt: string | null;
  exercises: WorkoutExercise[];
}
