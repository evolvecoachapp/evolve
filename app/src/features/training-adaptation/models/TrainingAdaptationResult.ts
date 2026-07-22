import type { AdaptedProgression } from "./AdaptedProgression";
import type { AdaptationContext } from "./AdaptationContext";
import type { AdaptationExplanation } from "./AdaptationExplanation";
import type { AdaptationRecommendation } from "./AdaptationRecommendation";
import type { AdaptationScore } from "./AdaptationScore";
import type { ReadinessAssessment } from "./ReadinessAssessment";

/**
 * Immutable output of the Training Adaptation Engine.
 *
 * Evaluates whether an existing Progression Plan should be adapted
 * before execution. Recommendations only — no workout generation.
 */
export interface TrainingAdaptationResult {
  readonly requestId: string;
  readonly context: AdaptationContext;
  readonly readiness: ReadinessAssessment;
  readonly recommendations: readonly AdaptationRecommendation[];
  readonly adaptedProgression: AdaptedProgression;
  readonly explanations: readonly AdaptationExplanation[];
  readonly validationIssues: readonly string[];
  readonly score: AdaptationScore;
  /** ISO-8601 — fixed by the engine for determinism. */
  readonly adaptedAt: string;
}
