import type { RecoveryAgentStatistics } from "../models/RecoveryStatistics";
import type { RecoveryPlan } from "../models/RecoveryPlan";
import type { RecoveryReasoning } from "../models/RecoveryReasoning";
import type { RecoveryRecommendation } from "../models/RecoveryRecommendation";
import type { RecoveryValidation } from "../models/RecoveryValidation";

export function computeAgentStatistics(input: {
  readonly reasoning: readonly RecoveryReasoning[];
  readonly plannerCount: number;
  readonly recommendations: readonly RecoveryRecommendation[];
  readonly validation: RecoveryValidation;
  readonly plan: RecoveryPlan | null;
  readonly durationMs: number;
}): RecoveryAgentStatistics {
  return Object.freeze({
    reasoningCount: input.reasoning.length,
    plannerCount: input.plannerCount,
    recommendationCount: input.recommendations.length,
    issueCount: input.validation.issues.length,
    durationMs: Math.max(0, input.durationMs),
    recoveryScore: input.plan?.assessment.recoveryScore.score ?? 0,
    readinessScore: input.plan?.assessment.readiness.score ?? 0,
    fatigueLevel: input.plan?.assessment.fatigue.level ?? 0,
  });
}
