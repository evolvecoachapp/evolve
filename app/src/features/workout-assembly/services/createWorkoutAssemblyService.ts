import { WorkoutAssemblyEngine } from "../engine/WorkoutAssemblyEngine";
import {
  InMemoryWorkoutAssemblyRepository,
  type WorkoutAssemblyRepository,
  workoutAssemblyRepository,
} from "../repository";
import { WorkoutAssemblyService } from "./WorkoutAssemblyService";

export interface CreateWorkoutAssemblyServiceOptions {
  readonly repository?: WorkoutAssemblyRepository;
}

/**
 * Compose WorkoutAssemblyService with in-memory defaults.
 */
export function createWorkoutAssemblyService(
  options: CreateWorkoutAssemblyServiceOptions = {},
): WorkoutAssemblyService {
  const repository = options.repository ?? workoutAssemblyRepository;
  const engine = new WorkoutAssemblyEngine();
  return new WorkoutAssemblyService(engine, repository);
}

export function createEmptyWorkoutAssemblyService(): WorkoutAssemblyService {
  return createWorkoutAssemblyService({
    repository: new InMemoryWorkoutAssemblyRepository(),
  });
}
