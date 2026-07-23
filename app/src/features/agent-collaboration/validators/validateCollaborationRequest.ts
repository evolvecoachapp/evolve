import { ALL_COLLABORATION_ROLES } from "../models/CollaborationRole";
import type { CollaborationRequest } from "../models/CollaborationRequest";
import type {
  CollaborationValidation,
  CollaborationValidationIssue,
} from "../models/CollaborationValidation";
import { CollaborationValidationCodes } from "../models/CollaborationValidation";
import { freezeValidation } from "../utils/FreezeCollaborationState";

/**
 * Validates collaboration request shape (orchestration integrity only).
 */
export function validateCollaborationRequest(
  request: CollaborationRequest | null | undefined,
): CollaborationValidation {
  const issues: CollaborationValidationIssue[] = [];

  if (!request) {
    issues.push(
      Object.freeze({
        code: CollaborationValidationCodes.REQUEST_INVALID,
        message: "Collaboration request is required.",
        path: "request",
      }),
    );
    return freezeValidation({ valid: false, issues: Object.freeze(issues) });
  }

  if (!request.id) {
    issues.push(
      Object.freeze({
        code: CollaborationValidationCodes.MISSING_FIELD,
        message: "Request id is required.",
        path: "request.id",
      }),
    );
  }

  if (!request.coachAgentId) {
    issues.push(
      Object.freeze({
        code: CollaborationValidationCodes.MISSING_FIELD,
        message: "Coach agent id is required.",
        path: "request.coachAgentId",
      }),
    );
  }

  if (!request.intent || request.intent.trim().length === 0) {
    issues.push(
      Object.freeze({
        code: CollaborationValidationCodes.MISSING_FIELD,
        message: "Request intent is required.",
        path: "request.intent",
      }),
    );
  }

  if (!request.createdAt) {
    issues.push(
      Object.freeze({
        code: CollaborationValidationCodes.MISSING_FIELD,
        message: "Request createdAt is required.",
        path: "request.createdAt",
      }),
    );
  }

  const hasRoles = request.requestedRoles.length > 0;
  const hasAgentIds = request.requestedAgentIds.length > 0;
  if (!hasRoles && !hasAgentIds) {
    issues.push(
      Object.freeze({
        code: CollaborationValidationCodes.EMPTY_PLAN,
        message:
          "Request must specify requestedRoles and/or requestedAgentIds.",
        path: "request.requestedRoles",
      }),
    );
  }

  for (let i = 0; i < request.requestedRoles.length; i++) {
    const role = request.requestedRoles[i];
    if (!(ALL_COLLABORATION_ROLES as readonly string[]).includes(role)) {
      issues.push(
        Object.freeze({
          code: CollaborationValidationCodes.INVALID_VALUE,
          message: `Invalid collaboration role: ${role}.`,
          path: `request.requestedRoles[${i}]`,
        }),
      );
    }
  }

  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
