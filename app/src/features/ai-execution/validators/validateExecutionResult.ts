import { AIExecutionStatuses } from "../models/AIExecutionStatus";
import type { AIExecutionResult } from "../models/AIExecutionResult";

/**
 * Soft validation of an execution result.
 */
export function validateExecutionResult(
  result: AIExecutionResult | null | undefined,
): readonly string[] {
  const issues: string[] = [];

  if (!result) {
    return Object.freeze(["execution_result_missing"]);
  }

  if (!result.id?.trim()) {
    issues.push("execution_result_id_missing");
  }

  if (!result.requestId?.trim()) {
    issues.push("execution_result_request_id_missing");
  }

  if (!result.contextId?.trim()) {
    issues.push("execution_result_context_id_missing");
  }

  if (!result.completedAt?.trim()) {
    issues.push("execution_result_completed_at_missing");
  }

  if (!result.trace) {
    issues.push("execution_result_trace_missing");
  }

  if (!result.summary) {
    issues.push("execution_result_summary_missing");
  }

  if (
    result.status === AIExecutionStatuses.SUCCEEDED &&
    result.response === null
  ) {
    issues.push("execution_result_succeeded_without_response");
  }

  if (
    result.status === AIExecutionStatuses.FAILED &&
    result.error === null
  ) {
    issues.push("execution_result_failed_without_error");
  }

  if (
    result.status === AIExecutionStatuses.SUCCEEDED &&
    result.error !== null
  ) {
    issues.push("execution_result_succeeded_with_error");
  }

  return Object.freeze(issues);
}
