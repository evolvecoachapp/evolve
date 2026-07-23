import type { CollaborationMetadata } from "./CollaborationMetadata";
import type { CollaborationRole } from "./CollaborationRole";

/**
 * Immutable Coach collaboration request (orchestration input only).
 */
export interface CollaborationRequest {
  readonly id: string;
  readonly coachAgentId: string;
  readonly intent: string;
  readonly requestedRoles: readonly CollaborationRole[];
  readonly requestedAgentIds: readonly string[];
  readonly athleteId: string | null;
  readonly conversationId: string | null;
  readonly sessionId: string | null;
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
  readonly metadata: CollaborationMetadata;
  readonly createdAt: string;
}
