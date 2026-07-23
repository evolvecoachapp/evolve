import type { CollaborationError } from "./CollaborationError";
import type { CollaborationMetadata } from "./CollaborationMetadata";
import type { CollaborationStatus } from "./CollaborationStatus";

/**
 * Immutable single-participant execution result.
 *
 * Attributes are opaque orchestration provenance — no domain logic / AI.
 */
export interface ExecutionResult {
  readonly id: string;
  readonly collaborationId: string;
  readonly planId: string;
  readonly batchId: string;
  readonly taskId: string;
  readonly participantId: string;
  readonly agentId: string;
  readonly order: number;
  readonly success: boolean;
  readonly status: CollaborationStatus;
  readonly message: string;
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
  readonly error: CollaborationError | null;
  readonly metadata: CollaborationMetadata;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly durationMs: number | null;
  readonly frozenAt: string;
}
