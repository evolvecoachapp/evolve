import { buildWorkoutDescriptor } from "../builders/DescriptorBuilder";
import type { WorkoutDescriptor } from "../models/WorkoutDescriptor";
import type { WorkoutAdaptationInput } from "../models/WorkoutAdaptationInput";
import type { WorkoutResult } from "../models/WorkoutResult";
import {
  createWorkoutAdaptationCoordinator,
  type WorkoutAdaptationCoordinator,
  type WorkoutAdaptationCoordinatorDeps,
} from "./WorkoutAdaptationCoordinator";

export type WorkoutAdaptationEngineDeps = WorkoutAdaptationCoordinatorDeps;

/**
 * Workout Adaptation Engine — adapts existing workout blueprints only.
 * Does NOT generate workouts from scratch. No AI. No networking. No persistence.
 */
export class WorkoutAdaptationEngine {
  private readonly coordinator: WorkoutAdaptationCoordinator;
  private readonly runtimeId: string;
  private readonly clock: () => string;

  constructor(deps: WorkoutAdaptationEngineDeps = {}) {
    this.coordinator = createWorkoutAdaptationCoordinator(deps);
    this.runtimeId = deps.runtimeId ?? "runtime:workout-adaptation";
    this.clock = deps.clock ?? (() => new Date().toISOString());
  }

  adaptWorkout(input: WorkoutAdaptationInput): WorkoutResult {
    return this.coordinator.adapt(input);
  }

  compareWorkout(input: WorkoutAdaptationInput): WorkoutResult {
    return this.coordinator.compare(input);
  }

  describeWorkoutAdaptation(): WorkoutDescriptor {
    const result = this.coordinator.describe();
    return (
      result.descriptor ??
      buildWorkoutDescriptor({ id: this.runtimeId, createdAt: this.clock() })
    );
  }

  createWorkoutSnapshot(input: WorkoutAdaptationInput): WorkoutResult {
    return this.coordinator.snapshot(input);
  }

  validateWorkoutAdaptation(input: WorkoutAdaptationInput): WorkoutResult {
    return this.coordinator.validate(input);
  }
}

export function createWorkoutAdaptationEngine(
  deps: WorkoutAdaptationEngineDeps = {},
): WorkoutAdaptationEngine {
  return new WorkoutAdaptationEngine(deps);
}
