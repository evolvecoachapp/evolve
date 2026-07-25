import type { GoalCheckpoint } from "../models/GoalCheckpoint";
import type { GoalEvaluation } from "../models/GoalEvaluation";
import { EMPTY_GOAL_METADATA } from "../models/GoalMetadata";
import type { GoalMilestone } from "../models/GoalMilestone";
import type { GoalAchievement } from "../models/GoalAchievement";
import { priorityForOrdinal } from "../models/GoalPriority";
import { riskForSignalCount } from "../models/GoalRisk";
import { freezeEvaluation } from "../utils/FreezeGoalProgress";
import { uniqueSorted } from "../utils/GoalHelpers";
import { evaluateConsistencyOrdinal } from "./ConsistencyEvaluator";
import { evaluatePerformanceGoalCount } from "./PerformanceGoalEvaluator";
import { evaluateRecoveryGoalOrdinal } from "./RecoveryGoalEvaluator";

export function evaluateGoalSignals(input: {
  readonly subjectId: string;
  readonly triggers: readonly GoalAchievement[];
  readonly candidates: readonly GoalCheckpoint[];
  readonly opportunities: readonly GoalMilestone[];
  readonly dependencyFromIds: readonly string[];
}): GoalEvaluation {
  const presentTriggers = input.triggers.filter((t) => t.present);
  const signalKeys = uniqueSorted([
    ...presentTriggers.map((t) => t.signalKey),
    ...input.candidates.flatMap((c) => c.signalKeys),
    ...input.opportunities.flatMap((o) => o.signalKeys),
  ]);
  const priority = priorityForOrdinal(Math.min(3, presentTriggers.length === 0 ? 3 : presentTriggers.length - 1));
  const severity = riskForSignalCount(signalKeys.length);
  return freezeEvaluation({
    id: `eval:${input.subjectId}`,
    subjectId: input.subjectId,
    priority,
    severity,
    riskOrdinal: evaluateRecoveryGoalOrdinal(severity.ordinal, presentTriggers.length),
    consistencyOrdinal: evaluateConsistencyOrdinal(presentTriggers.length, input.candidates.length),
    dependencyCount: evaluatePerformanceGoalCount(input.dependencyFromIds),
    signalKeys,
    metadata: EMPTY_GOAL_METADATA,
  });
}
