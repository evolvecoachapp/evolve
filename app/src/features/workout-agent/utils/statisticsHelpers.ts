import type { WorkoutAgentStatistics } from "../models/WorkoutAgentStatistics";
import type { WorkoutPlanProposal } from "../models/WorkoutPlanProposal";
import type { WorkoutReasoning } from "../models/WorkoutReasoning";
import type { WorkoutRecommendation } from "../models/WorkoutRecommendation";
import type { WorkoutValidation } from "../models/WorkoutValidation";

export function computeAgentStatistics(input: {
  readonly reasoning: readonly WorkoutReasoning[];
  readonly plannerCount: number;
  readonly recommendations: readonly WorkoutRecommendation[];
  readonly validation: WorkoutValidation;
  readonly proposal: WorkoutPlanProposal | null;
  readonly durationMs: number | null;
}): WorkoutAgentStatistics {
  return Object.freeze({
    reasoningCount: input.reasoning.length,
    plannerCount: input.plannerCount,
    recommendationCount: input.recommendations.length,
    policyViolationCount: input.validation.issues.filter(
      (i) => i.code === "policy_violation",
    ).length,
    primaryLiftCount: input.proposal?.primaryLifts.length ?? 0,
    accessoryCount: input.proposal?.accessories.length ?? 0,
    durationMs: input.durationMs,
  });
}
