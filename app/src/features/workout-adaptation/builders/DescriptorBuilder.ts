import type { WorkoutDescriptor } from "../models/WorkoutDescriptor";
import { freezeDescriptor } from "../utils/FreezeWorkoutAdaptation";

export function buildWorkoutDescriptor(input: {
  readonly id: string;
  readonly createdAt: string;
}): WorkoutDescriptor {
  return freezeDescriptor({
    id: input.id,
    name: "Workout Adaptation Engine",
    version: "24.1.0",
    capabilities: Object.freeze([
      "adaptWorkout",
      "compareWorkout",
      "describeWorkoutAdaptation",
      "createWorkoutSnapshot",
      "validateWorkoutAdaptation",
    ]),
    boundaries: Object.freeze([
      "adapts_existing_blueprint_only",
      "no_ai",
      "no_networking",
      "no_persistence",
      "no_ui",
      "no_workout_generation_from_scratch",
      "no_athlete_goal_changes",
    ]),
    createdAt: input.createdAt,
  });
}
