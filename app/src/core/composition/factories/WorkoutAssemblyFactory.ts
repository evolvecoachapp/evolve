import { WorkoutAssemblyEngine } from "../../../features/workout-assembly/engine/WorkoutAssemblyEngine";
import type { WorkoutAssemblyRepository } from "../../../features/workout-assembly/repository";
import { WorkoutAssemblyService } from "../../../features/workout-assembly/services/WorkoutAssemblyService";

export interface WorkoutAssemblyFactoryDeps {
  readonly repository: WorkoutAssemblyRepository;
}

/**
 * Factory — object creation only for WorkoutAssemblyService.
 */
export const WorkoutAssemblyFactory = {
  create(deps: WorkoutAssemblyFactoryDeps): WorkoutAssemblyService {
    const engine = new WorkoutAssemblyEngine();
    return new WorkoutAssemblyService(engine, deps.repository);
  },
} as const;
