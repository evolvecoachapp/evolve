import type { AgentRuntimeResponse } from "../models/AgentRuntimeResponse";
import { ALL_AGENT_RUNTIME_STATUSES } from "../models/AgentRuntimeStatus";

export function validateRuntimeResponse(
  response: AgentRuntimeResponse | null | undefined,
): readonly string[] {
  const issues: string[] = [];
  if (!response) {
    return Object.freeze(["response_missing"]);
  }
  if (!response.id?.trim()) issues.push("response_id_missing");
  if (!response.requestId?.trim()) issues.push("response_request_id_missing");
  if (!response.runtimeId?.trim()) issues.push("response_runtime_id_missing");
  if (!ALL_AGENT_RUNTIME_STATUSES.includes(response.status)) {
    issues.push(`response_status_invalid:${response.status}`);
  }
  if (!response.summary) issues.push("response_summary_missing");
  if (!response.snapshot) issues.push("response_snapshot_missing");
  if (!response.startedAt?.trim()) issues.push("response_started_at_missing");
  if (!response.completedAt?.trim()) {
    issues.push("response_completed_at_missing");
  }
  if (!response.frozenAt?.trim()) issues.push("response_frozen_at_missing");
  if (response.success && response.error) {
    issues.push("response_success_with_error");
  }
  if (!response.success && !response.error && !response.result) {
    issues.push("response_failure_without_error_or_result");
  }
  return Object.freeze(issues);
}
