import type { DecisionConfidence } from "./DecisionConfidence";
  import type { DecisionMetadata } from "./DecisionMetadata";
  import type { DecisionScore } from "./DecisionScore";

/**
 * Immutable evaluation of a candidate / decision.
 */
export interface DecisionEvaluation {
  readonly id: string;
  readonly subjectId: string;
  readonly score: DecisionScore;
  readonly confidence: DecisionConfidence;
  readonly passed: boolean;
  readonly violations: readonly string[];
  readonly notes: readonly string[];
  readonly metadata: DecisionMetadata;
  readonly evaluatedAt: string;
}
