import {
  createGoalProgressEngine,
  type GoalProgressEngine,
  type GoalProgressEngineDeps,
} from "../progress/GoalProgressEngine";
import type { GoalDescriptor } from "../models/GoalDescriptor";
import type { GoalProgressInput } from "../models/GoalProgressInput";
import type { GoalResult } from "../models/GoalResult";

export type GoalProgressEngineServiceDeps = GoalProgressEngineDeps;

/**
 * Goal Progress Engine Service — orchestration facade.
 *
 * Athlete State + Workout/Nutrition/Recovery Adaptation + Decision/Recommendation History
 *   → Goal Progress Engine
 *   → GoalProgressState / GoalPackage
 *   → ContinuousAdaptationInput
 */
export class GoalProgressEngineService {
  private readonly engine: GoalProgressEngine;

  constructor(deps: GoalProgressEngineServiceDeps = {}) {
    this.engine = createGoalProgressEngine(deps);
  }

  evaluateGoalProgress(input: GoalProgressInput): GoalResult {
    return this.engine.evaluateGoalProgress(input);
  }

  trackGoalProgress(input: GoalProgressInput): GoalResult {
    return this.engine.trackGoalProgress(input);
  }

  describeGoalProgress(): GoalDescriptor {
    return this.engine.describeGoalProgress();
  }

  createGoalSnapshot(input: GoalProgressInput): GoalResult {
    return this.engine.createGoalSnapshot(input);
  }

  validateGoalProgress(input: GoalProgressInput): GoalResult {
    return this.engine.validateGoalProgress(input);
  }
}

export function createGoalProgressEngineService(
  deps: GoalProgressEngineServiceDeps = {},
): GoalProgressEngineService {
  return new GoalProgressEngineService(deps);
}
