import type { AgentRuntimeStatus } from "./AgentRuntimeStatus";
import type { AgentRuntimeMetadata } from "./AgentRuntimeMetadata";

/**
 * Immutable runtime orchestration event (no domain payloads).
 */
export type AgentRuntimeEventType =
  | "runtime_started"
  | "request_validated"
  | "agent_selected"
  | "plan_built"
  | "execution_started"
  | "execution_completed"
  | "execution_failed"
  | "response_built"
  | "runtime_completed"
  | "runtime_failed";

export const AgentRuntimeEventTypes = Object.freeze({
  RUNTIME_STARTED: "runtime_started",
  REQUEST_VALIDATED: "request_validated",
  AGENT_SELECTED: "agent_selected",
  PLAN_BUILT: "plan_built",
  EXECUTION_STARTED: "execution_started",
  EXECUTION_COMPLETED: "execution_completed",
  EXECUTION_FAILED: "execution_failed",
  RESPONSE_BUILT: "response_built",
  RUNTIME_COMPLETED: "runtime_completed",
  RUNTIME_FAILED: "runtime_failed",
} as const satisfies Record<string, AgentRuntimeEventType>);

export interface AgentRuntimeEvent {
  readonly id: string;
  readonly type: AgentRuntimeEventType;
  readonly runtimeId: string;
  readonly requestId: string;
  readonly agentId: string | null;
  readonly status: AgentRuntimeStatus;
  readonly message: string;
  readonly metadata: AgentRuntimeMetadata;
  readonly occurredAt: string;
}
