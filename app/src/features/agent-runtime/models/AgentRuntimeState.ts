import type { AgentRuntimeStatus } from "./AgentRuntimeStatus";
import type { AgentRuntimeMetadata } from "./AgentRuntimeMetadata";

/**
 * Immutable runtime state snapshot for a single invocation.
 */
export interface AgentRuntimeState {
  readonly id: string;
  readonly runtimeId: string;
  readonly requestId: string;
  readonly selectedAgentId: string | null;
  readonly status: AgentRuntimeStatus;
  readonly phase: string;
  readonly message: string | null;
  readonly metadata: AgentRuntimeMetadata;
  readonly updatedAt: string;
}
