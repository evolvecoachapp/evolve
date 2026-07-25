import type { DecisionMetadata } from "./DecisionMetadata";

/**
 * Immutable structured reason — not natural language generation.
 */
export interface DecisionReason {
  readonly code: string;
  readonly category: string;
  readonly statement: string;
  readonly evidenceKeys: readonly string[];
  readonly metadata: DecisionMetadata;
}
