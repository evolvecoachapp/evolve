import type { GoalProgress as GoalProgressDomain } from "../../goal-progress/models/GoalProgress";
import {
  GoalProgressInputKinds,
  type GoalProgressInput,
} from "../../goal-progress/models/GoalProgressInput";
import { freezeInput } from "../../goal-progress/utils/FreezeGoalProgress";

export interface BuildRuntimeGoalProgressInputOptions {
  readonly progress: GoalProgressDomain;
  readonly evaluatedAt: string;
  readonly kind?: GoalProgressInput["kind"];
}

/** Builds Goal Progress Engine input from hydrated domain progress. */
export function buildRuntimeGoalProgressInput({
  progress,
  evaluatedAt,
  kind = GoalProgressInputKinds.EVALUATE,
}: BuildRuntimeGoalProgressInputOptions): GoalProgressInput {
  return freezeInput({
    id: `runtime:goal:${progress.id}:${evaluatedAt}`,
    kind,
    athleteId: progress.athleteId,
    sessionId: progress.sessionId,
    conversationId: progress.conversationId,
    contextId: progress.contextId,
    decisions: Object.freeze([]),
    recommendations: Object.freeze([]),
    explanations: Object.freeze([]),
    stateKeys: progress.signalKeys,
    performanceKeys: progress.sourceKeys,
    recoveryKeys: Object.freeze(["recovery:status"]),
    nutritionKeys: Object.freeze(["nutrition:adherence"]),
    goalKeys: progress.signalKeys,
    adherenceKeys: Object.freeze(["adherence:weekly"]),
    historyKeys: Object.freeze(["history:prior"]),
    timelineKeys: Object.freeze(["timeline:recent"]),
    signalFlags: Object.freeze({
      "goal:progress": true,
      "trend:signal": true,
      "regression:flag": false,
    }),
    priorSnapshot: null,
    reason: "runtime_goal_progress",
    metadata: progress.metadata,
    createdAt: evaluatedAt,
  });
}
