import type { AgentId } from "../../agent-framework/models/AgentId";
import type { AgentRuntimeError } from "./AgentRuntimeError";
import type { AgentRuntimeMetadata } from "./AgentRuntimeMetadata";
import type { AgentRuntimeStatus } from "./AgentRuntimeStatus";

/**
 * Immutable agent execution result collected by the runtime.
 *
 * Payload is opaque orchestration attributes only — no domain logic.
 */
export interface AgentExecutionResult {
  readonly id: string;
  readonly planId: string;
  readonly requestId: string;
  readonly agentId: AgentId;
  readonly success: boolean;
  readonly status: AgentRuntimeStatus;
  readonly message: string;
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
  readonly error: AgentRuntimeError | null;
  readonly metadata: AgentRuntimeMetadata;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly durationMs: number | null;
  readonly frozenAt: string;
}
