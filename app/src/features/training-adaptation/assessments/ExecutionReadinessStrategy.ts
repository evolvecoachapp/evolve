import type { ProgressionPlan } from "../../progression/models/ProgressionPlan";
import type { AdaptationContext } from "../models/AdaptationContext";
import type { AdaptationReason } from "../models/AdaptationReason";
import type { AssessmentStrategy } from "./AssessmentStrategy";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export interface ExecutionConfidenceAssessment {
  readonly executionConfidence: number;
  readonly reasons: readonly AdaptationReason[];
}

/**
 * Estimate execution confidence from structural plan completeness.
 * Independent of other assessments — engine aggregates later.
 */
export class ExecutionReadinessStrategy
  implements AssessmentStrategy<ExecutionConfidenceAssessment>
{
  readonly id = "execution_readiness";

  assess(
    context: AdaptationContext,
    plan: ProgressionPlan,
  ): ExecutionConfidenceAssessment {
    const prescriptionBonus = Math.min(30, context.prescriptionCount * 10);
    const weekBonus = Math.min(20, context.weekCount * 4);
    const validationPenalty = plan.validationIssues.length * 8;
    const restDayPenalty = plan.context.dayId.includes("rest") ? 40 : 0;
    const raw = clamp(
      40 + prescriptionBonus + weekBonus - validationPenalty - restDayPenalty,
      0,
      100,
    );
    const executionConfidence = round3(raw);

    const reasons: readonly AdaptationReason[] = Object.freeze([
      Object.freeze({
        code: "execution_confidence",
        weight: executionConfidence,
        detail: `prescriptions_${context.prescriptionCount}`,
      }),
    ]);

    return Object.freeze({
      executionConfidence,
      reasons,
    });
  }
}
