import type { AdaptationContext } from "../models/AdaptationContext";
import type { ProgressionPlan } from "../../progression/models/ProgressionPlan";

/**
 * Independent readiness assessment.
 * Receives immutable context (+ optional plan) and returns an immutable assessment.
 * Assessments never coordinate with each other.
 */
export interface AssessmentStrategy<TAssessment> {
  readonly id: string;
  assess(
    context: AdaptationContext,
    plan: ProgressionPlan,
  ): TAssessment;
}
