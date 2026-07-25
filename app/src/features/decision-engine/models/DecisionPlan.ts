import type { DecisionMetadata } from "./DecisionMetadata";
  import type { DecisionStep } from "./DecisionStep";

/**
 * Immutable decision plan — orchestration sequence only.
 */
export interface DecisionPlan {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly steps: readonly DecisionStep[];
  readonly metadata: DecisionMetadata;
  readonly createdAt: string;
}
