import type { CollaborationMetadata } from "./CollaborationMetadata";
import type { CollaborationStatus } from "./CollaborationStatus";

/**
 * Immutable planned collaboration task for one participant.
 *
 * Payload attributes are opaque orchestration bags — no domain logic.
 */
export interface CollaborationTask {
  readonly id: string;
  readonly participantId: string;
  readonly agentId: string;
  readonly order: number;
  readonly batchId: string;
  readonly intent: string;
  readonly status: CollaborationStatus;
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
  readonly metadata: CollaborationMetadata;
}
