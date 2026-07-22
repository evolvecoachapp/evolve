import type { ProgressionPlan } from "../../progression/models/ProgressionPlan";
import type { AdaptationContext } from "../models/AdaptationContext";
import type { AdaptationReason } from "../models/AdaptationReason";
import type { ConstraintAssessment } from "../models/ConstraintAssessment";
import type { AssessmentStrategy } from "./AssessmentStrategy";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/**
 * Summarize training constraints affecting adaptation freedom.
 */
export class ConstraintAssessmentStrategy
  implements AssessmentStrategy<ConstraintAssessment>
{
  readonly id = "constraint";

  assess(
    context: AdaptationContext,
    _plan: ProgressionPlan,
  ): ConstraintAssessment {
    const hard = context.constraints.filter(
      (constraint) => constraint.severity === "hard",
    );
    const soft = context.constraints.filter(
      (constraint) => constraint.severity === "soft",
    );
    const blockingCodes = Object.freeze(
      hard.map((constraint) => constraint.code).sort(),
    );
    const penalty = hard.length * 18 + soft.length * 6;
    const score = round3(clamp(100 - penalty, 0, 100));

    const reasons: readonly AdaptationReason[] = Object.freeze([
      Object.freeze({
        code: "constraint_hard_count",
        weight: hard.length,
        detail: `hard_${hard.length}`,
      }),
      Object.freeze({
        code: "constraint_soft_count",
        weight: soft.length,
        detail: `soft_${soft.length}`,
      }),
    ]);

    return Object.freeze({
      hardCount: hard.length,
      softCount: soft.length,
      blockingCodes,
      score,
      reasons,
    });
  }
}
