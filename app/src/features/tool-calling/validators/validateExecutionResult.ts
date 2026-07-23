import type { ToolExecutionResult } from "../models/ToolExecutionResult";

export type ExecutionResultValidationCode =
  | "invalid_status"
  | "error_status_mismatch"
  | "missing_output_on_success"
  | "output_on_failure";

/**
 * Validate a ToolExecutionResult structural integrity.
 */
export function validateExecutionResult(
  result: ToolExecutionResult,
): readonly ExecutionResultValidationCode[] {
  const issues: ExecutionResultValidationCode[] = [];

  if (
    result.status !== "succeeded" &&
    result.status !== "failed" &&
    result.status !== "cancelled"
  ) {
    issues.push("invalid_status");
  }

  if (result.status === "failed" && result.error === null) {
    issues.push("error_status_mismatch");
  }

  if (result.status === "succeeded" && result.error !== null) {
    issues.push("error_status_mismatch");
  }

  if (result.status === "succeeded" && result.output === null) {
    issues.push("missing_output_on_success");
  }

  if (result.status === "failed" && result.output !== null) {
    issues.push("output_on_failure");
  }

  return Object.freeze([...new Set(issues)]);
}
