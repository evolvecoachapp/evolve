import { WorkoutBlueprintBuilder } from "../../../features/workout-blueprint/builder/WorkoutBlueprintBuilder";
import type { WorkoutBlueprintRepository } from "../../../features/workout-blueprint/repository";
import { WorkoutBlueprintService } from "../../../features/workout-blueprint/services/WorkoutBlueprintService";

export interface WorkoutBlueprintFactoryDeps {
  readonly repository: WorkoutBlueprintRepository;
  readonly builder?: WorkoutBlueprintBuilder;
}

/**
 * Factory — object creation only for WorkoutBlueprintService.
 */
export const WorkoutBlueprintFactory = {
  create(deps: WorkoutBlueprintFactoryDeps): WorkoutBlueprintService {
    const builder = deps.builder ?? new WorkoutBlueprintBuilder();
    return new WorkoutBlueprintService(deps.repository, builder);
  },
} as const;
