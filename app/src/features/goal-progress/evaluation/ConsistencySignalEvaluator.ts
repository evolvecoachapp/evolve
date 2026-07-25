import { GoalCategories } from "../models/GoalCategory";
import type { GoalCheckpoint } from "../models/GoalCheckpoint";
import { EMPTY_GOAL_METADATA } from "../models/GoalMetadata";
import type { GoalMilestone } from "../models/GoalMilestone";
import { GoalAchievementKinds, type GoalAchievement } from "../models/GoalAchievement";
import type { GoalProgressInput } from "../models/GoalProgressInput";
import { priorityForOrdinal } from "../models/GoalPriority";
import { riskForSignalCount } from "../models/GoalRisk";
import { freezeCandidate, freezeOpportunity, freezeTrigger } from "../utils/FreezeGoalProgress";
import { uniqueSorted } from "../utils/GoalHelpers";

const PREFIXES = Object.freeze(["consistency","stable"] as string[]);

function matchingKeys(input: GoalProgressInput): readonly string[] {
  const all = uniqueSorted([
    ...input.stateKeys,
    ...input.performanceKeys,
    ...input.recoveryKeys,
    ...input.nutritionKeys,
    ...input.goalKeys,
    ...input.adherenceKeys,
    ...input.historyKeys,
    ...input.timelineKeys,
    ...Object.entries(input.signalFlags).filter(([, v]) => v).map(([k]) => k),
  ]);
  return uniqueSorted(all.filter((k) => PREFIXES.some((p) => k.includes(p))));
}

/** Detect signal key/flag presence only — no prediction. */
export function evaluateConsistencySignal(input: GoalProgressInput): {
  readonly triggers: readonly GoalAchievement[];
  readonly candidates: readonly GoalCheckpoint[];
  readonly opportunities: readonly GoalMilestone[];
} {
  const keys = matchingKeys(input);
  const triggers = Object.freeze(
    keys.map((signalKey, i) =>
      freezeTrigger({
        id: `trigger:consistency:${i}:${input.id}`,
        kind: GoalAchievementKinds.CONSISTENCY,
        signalKey,
        subjectId: input.athleteId,
        present: true,
        metadata: EMPTY_GOAL_METADATA,
      }),
    ),
  );
  const candidates = Object.freeze(
    keys.length === 0
      ? []
      : [
          freezeCandidate({
            id: `candidate:consistency:${input.id}`,
            category: GoalCategories.GENERAL,
            subjectId: input.athleteId,
            triggerIds: Object.freeze(triggers.map((t) => t.id)),
            signalKeys: keys,
            priority: priorityForOrdinal(Math.min(3, Math.max(0, keys.length - 1))),
            metadata: EMPTY_GOAL_METADATA,
          }),
        ],
  );
  const opportunities = Object.freeze(
    keys.length === 0
      ? []
      : [
          freezeOpportunity({
            id: `opportunity:consistency:${input.id}`,
            category: GoalCategories.GENERAL,
            subjectId: input.athleteId,
            candidateIds: Object.freeze(candidates.map((c) => c.id)),
            signalKeys: keys,
            severity: riskForSignalCount(keys.length),
            metadata: EMPTY_GOAL_METADATA,
          }),
        ],
  );
  return Object.freeze({ triggers, candidates, opportunities });
}

export const ConsistencySignalEvaluator = { detect: evaluateConsistencySignal };
