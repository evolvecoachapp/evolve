import {
  createGoalProgressEngine,
  type GoalProgressEngine,
  type GoalProgressEngineDeps,
} from "../progress/GoalProgressEngine";
import type { GoalDescriptor } from "../models/GoalDescriptor";
import type { GoalProgressInput } from "../models/GoalProgressInput";
import type { GoalResult } from "../models/GoalResult";
import { appendGoalProgress } from "../../coach-timeline/builders/timelineIntegration";
import type { CoachTimelineService } from "../../coach-timeline/services/CoachTimelineService";

export interface GoalProgressEngineServiceDeps extends GoalProgressEngineDeps {
  readonly coachTimeline?: CoachTimelineService | null;
}

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
  private readonly coachTimeline: CoachTimelineService | null;

  constructor(deps: GoalProgressEngineServiceDeps = {}) {
    this.engine = createGoalProgressEngine(deps);
    this.coachTimeline = deps.coachTimeline ?? null;
  }

  evaluateGoalProgress(input: GoalProgressInput): GoalResult {
    const result = this.engine.evaluateGoalProgress(input);
    this.journalGoals(result, false);
    return result;
  }

  trackGoalProgress(input: GoalProgressInput): GoalResult {
    const result = this.engine.trackGoalProgress(input);
    this.journalGoals(result, true);
    return result;
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

  private journalGoals(result: GoalResult, changed: boolean): void {
    if (!result.success || !this.coachTimeline) return;
    for (const progress of result.decisions) {
      appendGoalProgress({
        timeline: this.coachTimeline,
        athleteId: progress.athleteId || "athlete:unknown",
        goalId: progress.id,
        changed,
        summary: changed
          ? `Goal changed (${progress.category})`
          : `Goal progress updated (${progress.category})`,
        explanation:
          progress.reasons[0]?.statementKey ??
          `Goal ${progress.category} progress evaluated`,
        at: result.createdAt,
      });
    }
  }
}

export function createGoalProgressEngineService(
  deps: GoalProgressEngineServiceDeps = {},
): GoalProgressEngineService {
  return new GoalProgressEngineService(deps);
}
