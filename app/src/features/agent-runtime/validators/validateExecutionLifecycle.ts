import type { AgentRuntimeState } from "../models/AgentRuntimeState";
import {
  ALL_AGENT_RUNTIME_STATUSES,
  isTerminalRuntimeStatus,
} from "../models/AgentRuntimeStatus";

export function validateExecutionLifecycle(
  state: AgentRuntimeState | null | undefined,
  options: { readonly expectTerminal?: boolean } = {},
): readonly string[] {
  const issues: string[] = [];
  if (!state) {
    return Object.freeze(["lifecycle_state_missing"]);
  }
  if (!state.id?.trim()) issues.push("lifecycle_state_id_missing");
  if (!state.runtimeId?.trim()) issues.push("lifecycle_runtime_id_missing");
  if (!state.requestId?.trim()) issues.push("lifecycle_request_id_missing");
  if (!ALL_AGENT_RUNTIME_STATUSES.includes(state.status)) {
    issues.push(`lifecycle_status_invalid:${state.status}`);
  }
  if (!state.updatedAt?.trim()) issues.push("lifecycle_updated_at_missing");
  if (options.expectTerminal && !isTerminalRuntimeStatus(state.status)) {
    issues.push(`lifecycle_not_terminal:${state.status}`);
  }
  return Object.freeze(issues);
}
