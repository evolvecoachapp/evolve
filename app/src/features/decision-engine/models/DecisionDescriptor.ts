import type { DecisionMetadata } from "./DecisionMetadata";

/**
 * Immutable capability descriptor for Decision Engine.
 */
export interface DecisionDescriptor {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly capabilities: readonly string[];
  readonly categories: readonly string[];
  readonly metadata: DecisionMetadata;
  readonly createdAt: string;
}
