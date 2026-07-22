import type { WorkflowRequest } from "../models/WorkflowRequest";

/** Structured validation issue codes — never prose. */
export type WorkflowRequestValidationCode =
  | "missing_id"
  | "missing_workflow_name"
  | "invalid_arguments"
  | "missing_requested_at";

/**
 * Validate a WorkflowRequest structural integrity.
 */
export function validateWorkflowRequest(
  request: WorkflowRequest,
): readonly WorkflowRequestValidationCode[] {
  const issues: WorkflowRequestValidationCode[] = [];

  if (typeof request.id !== "string" || request.id.trim().length === 0) {
    issues.push("missing_id");
  }

  if (
    typeof request.workflowName !== "string" ||
    request.workflowName.trim().length === 0
  ) {
    issues.push("missing_workflow_name");
  }

  if (!Array.isArray(request.arguments)) {
    issues.push("invalid_arguments");
  } else {
    for (const arg of request.arguments) {
      if (
        !arg ||
        typeof arg.name !== "string" ||
        arg.name.trim().length === 0
      ) {
        issues.push("invalid_arguments");
        break;
      }
    }
  }

  if (
    typeof request.requestedAt !== "string" ||
    request.requestedAt.trim().length === 0
  ) {
    issues.push("missing_requested_at");
  }

  return Object.freeze([...new Set(issues)]);
}
