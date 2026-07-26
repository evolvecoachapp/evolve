import type { WorkoutSession } from "../../workout-assembly/models/WorkoutSession";
import type { WorkoutBlock } from "../../workout-assembly/models/WorkoutBlock";
import type {
  WorkoutExercise,
  WorkoutSet,
} from "../../workout-assembly/models/WorkoutExercise";

/**
 * Re-export assembly structural types — canonical exercise graph for plans.
 */
export type { WorkoutSession, WorkoutBlock, WorkoutExercise, WorkoutSet };
