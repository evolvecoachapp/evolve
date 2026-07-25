import type { GoalDescriptor } from "../models/GoalDescriptor";
import type { GoalProgressInput } from "../models/GoalProgressInput";
import type { GoalResult } from "../models/GoalResult";
import { buildGoalDescriptor } from "../builders/DescriptorBuilder";
import {
  createGoalProgressCoordinator,
  type GoalProgressCoordinator,
  type GoalProgressCoordinatorDeps,
} from "./GoalProgressCoordinator";

export type GoalProgressEngineDeps = GoalProgressCoordinatorDeps;

/**
 * Goal Progress Engine — adaptation evaluation only.
 * Does NOT modify workout/nutrition/recovery plans.
 */
export class GoalProgressEngine {
  private readonly coordinator: GoalProgressCoordinator;
  private readonly runtimeId: string;
  private readonly clock: () => string;

  constructor(deps: GoalProgressEngineDeps = {}) {
    this.coordinator = createGoalProgressCoordinator(deps);
    this.runtimeId = deps.runtimeId ?? "runtime:goal-progress";
    this.clock = deps.clock ?? (() => new Date().toISOString());
  }

  evaluateGoalProgress(input: GoalProgressInput): GoalResult {
    return this.coordinator.evaluate(input);
  }

  trackGoalProgress(input: GoalProgressInput): GoalResult {
    return this.coordinator.track(input);
  }

  describeGoalProgress(): GoalDescriptor {
    const result = this.coordinator.describe();
    return (
      result.descriptor ??
      buildGoalDescriptor({ id: this.runtimeId, createdAt: this.clock() })
    );
  }

  createGoalSnapshot(input: GoalProgressInput): GoalResult {
    return this.coordinator.snapshot(input);
  }

  validateGoalProgress(input: GoalProgressInput): GoalResult {
    return this.coordinator.validate(input);
  }
}

export function createGoalProgressEngine(
  deps: GoalProgressEngineDeps = {},
): GoalProgressEngine {
  return new GoalProgressEngine(deps);
}
