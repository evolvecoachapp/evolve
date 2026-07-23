import type { CollaborationPlan } from "../models/CollaborationPlan";
import type {
  CollaborationValidation,
  CollaborationValidationIssue,
} from "../models/CollaborationValidation";
import { CollaborationValidationCodes } from "../models/CollaborationValidation";
import { freezeValidation } from "../utils/FreezeCollaborationState";
import { validateParticipants } from "./validateParticipants";

/**
 * Validates collaboration plan integrity (orchestration only).
 */
export function validateCollaborationPlan(
  plan: CollaborationPlan | null | undefined,
): CollaborationValidation {
  const issues: CollaborationValidationIssue[] = [];

  if (!plan) {
    issues.push(
      Object.freeze({
        code: CollaborationValidationCodes.PLAN_INTEGRITY,
        message: "Collaboration plan is required.",
        path: "plan",
      }),
    );
    return freezeValidation({ valid: false, issues: Object.freeze(issues) });
  }

  if (!plan.id) {
    issues.push(
      Object.freeze({
        code: CollaborationValidationCodes.MISSING_FIELD,
        message: "Plan id is required.",
        path: "plan.id",
      }),
    );
  }

  if (!plan.requestId) {
    issues.push(
      Object.freeze({
        code: CollaborationValidationCodes.MISSING_FIELD,
        message: "Plan requestId is required.",
        path: "plan.requestId",
      }),
    );
  }

  if (!plan.collaborationId) {
    issues.push(
      Object.freeze({
        code: CollaborationValidationCodes.MISSING_FIELD,
        message: "Plan collaborationId is required.",
        path: "plan.collaborationId",
      }),
    );
  }

  const participantValidation = validateParticipants(plan.participants);
  issues.push(...participantValidation.issues);

  if (plan.tasks.length === 0) {
    issues.push(
      Object.freeze({
        code: CollaborationValidationCodes.EMPTY_PLAN,
        message: "Plan must contain at least one task.",
        path: "plan.tasks",
      }),
    );
  }

  if (plan.batches.length === 0) {
    issues.push(
      Object.freeze({
        code: CollaborationValidationCodes.EMPTY_PLAN,
        message: "Plan must contain at least one execution batch.",
        path: "plan.batches",
      }),
    );
  }

  const participantIds = new Set(plan.participants.map((p) => p.id));
  for (let i = 0; i < plan.tasks.length; i++) {
    const task = plan.tasks[i];
    if (!participantIds.has(task.participantId)) {
      issues.push(
        Object.freeze({
          code: CollaborationValidationCodes.PLAN_INTEGRITY,
          message: `Task references unknown participant: ${task.participantId}.`,
          path: `plan.tasks[${i}].participantId`,
        }),
      );
    }
  }

  const taskIds = new Set(plan.tasks.map((t) => t.id));
  for (let i = 0; i < plan.batches.length; i++) {
    const batch = plan.batches[i];
    for (let j = 0; j < batch.taskIds.length; j++) {
      const taskId = batch.taskIds[j];
      if (!taskIds.has(taskId)) {
        issues.push(
          Object.freeze({
            code: CollaborationValidationCodes.PLAN_INTEGRITY,
            message: `Batch references unknown task: ${taskId}.`,
            path: `plan.batches[${i}].taskIds[${j}]`,
          }),
        );
      }
    }
  }

  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
