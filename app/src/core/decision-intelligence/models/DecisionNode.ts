import type { DecisionCategory } from "./DecisionCategory";
import type { DecisionConfidence } from "./DecisionConfidence";
import type { DecisionContext } from "./DecisionContext";
import type { DecisionEvidence } from "./DecisionEvidence";
import type { DecisionMetadata } from "./DecisionMetadata";
import type { DecisionReason } from "./DecisionReason";
import type { DecisionSeverity } from "./DecisionSeverity";

/**
 * Immutable node representing one domain decision in the decision graph.
 */
export interface DecisionNode {
  readonly id: string;
  readonly category: DecisionCategory;
  readonly summaryCode: string;
  readonly title: string;
  readonly severity: DecisionSeverity;
  readonly confidence: DecisionConfidence;
  readonly reasons: readonly DecisionReason[];
  readonly evidence: readonly DecisionEvidence[];
  readonly context: DecisionContext;
  readonly metadata: DecisionMetadata;
  /** Parent decision ids (empty for roots). */
  readonly parentIds: readonly string[];
  /** Stable chronological order within the generation. */
  readonly sequence: number;
}
