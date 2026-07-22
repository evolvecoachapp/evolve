import type { WorkflowResult } from "../models/WorkflowResult";
import { WORKFLOW_STATUSES } from "../models/WorkflowStatus";

/** Structured validation issue codes — never prose. */
export type WorkflowResultValidationCode =
  | "missing_execution_id"
  | "missing_request_id"
  | "missing_workflow_name"
  | "invalid_status"
  | "missing_completed_at"
  | "error_status_mismatch";

/**
 * Validate a WorkflowResult structural integrity.
 */
export function validateWorkflowResult(
  result: WorkflowResult,
): readonly WorkflowResultValidationCode[] {
  const issues: WorkflowResultValidationCode[] = [];

  if (
    typeof result.executionId !== "string" ||
    result.executionId.trim().length === 0
  ) {
    issues.push("missing_execution_id");
  }

  if (
    typeof result.requestId !== "string" ||
    result.requestId.trim().length === 0
  ) {
    issues.push("missing_request_id");
  }

  if (
    typeof result.workflowName !== "string" ||
    result.workflowName.trim().length === 0
  ) {
    issues.push("missing_workflow_name");
  }

  if (result.status !== "succeeded" && result.status !== "failed") {
    issues.push("invalid_status");
  } else if (
    !(WORKFLOW_STATUSES as readonly string[]).includes(result.status)
  ) {
    issues.push("invalid_status");
  }

  if (
    typeof result.completedAt !== "string" ||
    result.completedAt.trim().length === 0
  ) {
    issues.push("missing_completed_at");
  }

  if (result.status === "failed" && result.error === null) {
    issues.push("error_status_mismatch");
  }

  if (result.status === "succeeded" && result.error !== null) {
    issues.push("error_status_mismatch");
  }

  return Object.freeze([...new Set(issues)]);
}
