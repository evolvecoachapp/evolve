import type { CollaborationParticipant } from "../models/CollaborationParticipant";
import { ALL_COLLABORATION_ROLES } from "../models/CollaborationRole";
import type {
  CollaborationValidation,
  CollaborationValidationIssue,
} from "../models/CollaborationValidation";
import { CollaborationValidationCodes } from "../models/CollaborationValidation";
import { freezeValidation } from "../utils/FreezeCollaborationState";

/**
 * Validates collaboration participants (orchestration integrity only).
 */
export function validateParticipants(
  participants: readonly CollaborationParticipant[] | null | undefined,
): CollaborationValidation {
  const issues: CollaborationValidationIssue[] = [];

  if (!participants || participants.length === 0) {
    issues.push(
      Object.freeze({
        code: CollaborationValidationCodes.EMPTY_PLAN,
        message: "At least one participant is required.",
        path: "participants",
      }),
    );
    return freezeValidation({ valid: false, issues: Object.freeze(issues) });
  }

  const seenAgentIds = new Set<string>();
  const seenOrders = new Set<number>();

  for (let i = 0; i < participants.length; i++) {
    const participant = participants[i];
    const path = `participants[${i}]`;

    if (!participant.id) {
      issues.push(
        Object.freeze({
          code: CollaborationValidationCodes.MISSING_FIELD,
          message: "Participant id is required.",
          path: `${path}.id`,
        }),
      );
    }

    if (!participant.agentId) {
      issues.push(
        Object.freeze({
          code: CollaborationValidationCodes.INVALID_PARTICIPANT,
          message: "Participant agentId is required.",
          path: `${path}.agentId`,
        }),
      );
    } else if (seenAgentIds.has(participant.agentId)) {
      issues.push(
        Object.freeze({
          code: CollaborationValidationCodes.DUPLICATE_PARTICIPANT,
          message: `Duplicate participant agentId: ${participant.agentId}.`,
          path: `${path}.agentId`,
        }),
      );
    } else {
      seenAgentIds.add(participant.agentId);
    }

    if (
      !(ALL_COLLABORATION_ROLES as readonly string[]).includes(participant.role)
    ) {
      issues.push(
        Object.freeze({
          code: CollaborationValidationCodes.INVALID_PARTICIPANT,
          message: `Invalid participant role: ${participant.role}.`,
          path: `${path}.role`,
        }),
      );
    }

    if (!Number.isInteger(participant.order) || participant.order < 1) {
      issues.push(
        Object.freeze({
          code: CollaborationValidationCodes.INVALID_ORDER,
          message: "Participant order must be an integer >= 1.",
          path: `${path}.order`,
        }),
      );
    } else if (seenOrders.has(participant.order)) {
      issues.push(
        Object.freeze({
          code: CollaborationValidationCodes.INVALID_ORDER,
          message: `Duplicate participant order: ${participant.order}.`,
          path: `${path}.order`,
        }),
      );
    } else {
      seenOrders.add(participant.order);
    }

    if (!participant.eligible) {
      issues.push(
        Object.freeze({
          code: CollaborationValidationCodes.INELIGIBLE_PARTICIPANT,
          message: `Participant ${participant.agentId} is not eligible.`,
          path: `${path}.eligible`,
        }),
      );
    }
  }

  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
