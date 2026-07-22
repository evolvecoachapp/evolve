import { WorkoutBlueprintBuilder } from "../builder/WorkoutBlueprintBuilder";
import {
  InMemoryWorkoutBlueprintRepository,
  type WorkoutBlueprintRepository,
} from "../repository";
import { WorkoutBlueprintService } from "./WorkoutBlueprintService";

/**
 * Compose WorkoutBlueprintService with in-memory repository defaults.
 */
export function createWorkoutBlueprintService(
  repository: WorkoutBlueprintRepository = new InMemoryWorkoutBlueprintRepository(),
  builder: WorkoutBlueprintBuilder = new WorkoutBlueprintBuilder(),
): WorkoutBlueprintService {
  return new WorkoutBlueprintService(repository, builder);
}
