import type { RecoveryAgentMetadata } from "./RecoveryMetadata";

/**
 * Immutable Recovery Agent descriptor.
 */
export interface RecoveryAgent {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly capabilities: readonly string[];
  readonly strategyIds: readonly string[];
  readonly policyIds: readonly string[];
  readonly reasonerIds: readonly string[];
  readonly plannerIds: readonly string[];
  readonly metadata: RecoveryAgentMetadata;
  readonly createdAt: string;
}
