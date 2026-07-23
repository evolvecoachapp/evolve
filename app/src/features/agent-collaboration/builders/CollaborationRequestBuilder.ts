import {
  EMPTY_COLLABORATION_METADATA,
  type CollaborationMetadata,
} from "../models/CollaborationMetadata";
import type { CollaborationRequest } from "../models/CollaborationRequest";
import type { CollaborationRole } from "../models/CollaborationRole";
import { freezeRequest } from "../utils/FreezeCollaborationState";

export interface CollaborationRequestBuilderInput {
  readonly id: string;
  readonly coachAgentId: string;
  readonly intent: string;
  readonly requestedRoles?: readonly CollaborationRole[];
  readonly requestedAgentIds?: readonly string[];
  readonly athleteId?: string | null;
  readonly conversationId?: string | null;
  readonly sessionId?: string | null;
  readonly attributes?: Readonly<
    Record<string, string | number | boolean | null>
  >;
  readonly metadata?: CollaborationMetadata;
  readonly createdAt: string;
}

/**
 * Builds an immutable CollaborationRequest.
 */
export class CollaborationRequestBuilder {
  build(input: CollaborationRequestBuilderInput): CollaborationRequest {
    return freezeRequest({
      id: input.id,
      coachAgentId: input.coachAgentId,
      intent: input.intent,
      requestedRoles: Object.freeze([...(input.requestedRoles ?? [])]),
      requestedAgentIds: Object.freeze([...(input.requestedAgentIds ?? [])]),
      athleteId: input.athleteId ?? null,
      conversationId: input.conversationId ?? null,
      sessionId: input.sessionId ?? null,
      attributes: Object.freeze({ ...(input.attributes ?? {}) }),
      metadata: input.metadata ?? EMPTY_COLLABORATION_METADATA,
      createdAt: input.createdAt,
    });
  }
}

export function buildCollaborationRequest(
  input: CollaborationRequestBuilderInput,
): CollaborationRequest {
  return new CollaborationRequestBuilder().build(input);
}
