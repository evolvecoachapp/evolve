import type { DecisionCategory } from "./DecisionCategory";
  import type { DecisionConfidence } from "./DecisionConfidence";
  import type { DecisionIntent } from "./DecisionIntent";
  import type { DecisionMetadata } from "./DecisionMetadata";
  import type { DecisionPriority } from "./DecisionPriority";
  import type { DecisionReason } from "./DecisionReason";

/**
 * Immutable candidate before resolution into CoachingDecision.
 */
export interface DecisionCandidate {
  readonly id: string;
  readonly category: DecisionCategory;
  readonly intent: DecisionIntent;
  readonly title: string;
  readonly priority: DecisionPriority;
  readonly confidence: DecisionConfidence;
  readonly reasons: readonly DecisionReason[];
  readonly sourceKeys: readonly string[];
  readonly metadata: DecisionMetadata;
}
