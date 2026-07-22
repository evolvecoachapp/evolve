export type { WorkoutBlueprintRepository } from "./WorkoutBlueprintRepository";
export { InMemoryWorkoutBlueprintRepository } from "./InMemoryWorkoutBlueprintRepository";

import { InMemoryWorkoutBlueprintRepository } from "./InMemoryWorkoutBlueprintRepository";

/** Default in-memory repository singleton for local orchestration. */
export const workoutBlueprintRepository =
  new InMemoryWorkoutBlueprintRepository();
