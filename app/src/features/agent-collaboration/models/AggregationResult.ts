import type { CollaborationMetadata } from "./CollaborationMetadata";
import type { ExecutionResult } from "./ExecutionResult";

/**
 * Immutable deterministic aggregation output.
 *
 * Preserves ordering, provenance, and metadata — no AI / scoring / ranking.
 */
export interface AggregationResult {
  readonly id: string;
  readonly collaborationId: string;
  readonly planId: string;
  readonly contextId: string;
  readonly success: boolean;
  readonly message: string;
  readonly results: readonly ExecutionResult[];
  readonly resultCount: number;
  readonly successCount: number;
  readonly failureCount: number;
  readonly orderedAgentIds: readonly string[];
  readonly provenance: readonly string[];
  readonly metadata: CollaborationMetadata;
  readonly createdAt: string;
  readonly frozenAt: string;
}
