import type { CollaborationMetadata } from "./CollaborationMetadata";
import type { CollaborationRole } from "./CollaborationRole";

/**
 * Immutable planned collaboration participant (specialist agent slot).
 *
 * Identifies who participates — no domain logic.
 */
export interface CollaborationParticipant {
  readonly id: string;
  readonly agentId: string;
  readonly role: CollaborationRole;
  readonly order: number;
  readonly required: boolean;
  readonly eligible: boolean;
  readonly capability: string | null;
  readonly metadata: CollaborationMetadata;
}
