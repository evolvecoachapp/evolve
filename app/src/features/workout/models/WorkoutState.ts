import type { WorkoutExercise } from "./WorkoutExercise";
import type { WorkoutStatus } from "./WorkoutStatus";

/** Runtime state of an active workout session. */
export interface WorkoutState {
  sessionId: string;
  workoutId: string;
  status: WorkoutStatus;
  currentExerciseIndex: number;
  exercises: WorkoutExercise[];
  startedAt: string | null;
  completedAt: string | null;
}
