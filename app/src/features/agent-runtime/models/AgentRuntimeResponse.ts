import type { AgentExecutionPlan } from "./AgentExecutionPlan";
import type { AgentExecutionResult } from "./AgentExecutionResult";
import type { AgentRuntimeError } from "./AgentRuntimeError";
import type { AgentRuntimeEvent } from "./AgentRuntimeEvent";
import type { AgentRuntimeMetadata } from "./AgentRuntimeMetadata";
import type { AgentRuntimeSnapshot } from "./AgentRuntimeSnapshot";
import type { AgentRuntimeStatus } from "./AgentRuntimeStatus";
import type { AgentRuntimeSummary } from "./AgentRuntimeSummary";

/**
 * Immutable runtime response returned to callers.
 */
export interface AgentRuntimeResponse {
  readonly id: string;
  readonly requestId: string;
  readonly runtimeId: string;
  readonly selectedAgentId: string | null;
  readonly success: boolean;
  readonly status: AgentRuntimeStatus;
  readonly message: string;
  readonly plan: AgentExecutionPlan | null;
  readonly result: AgentExecutionResult | null;
  readonly error: AgentRuntimeError | null;
  readonly events: readonly AgentRuntimeEvent[];
  readonly summary: AgentRuntimeSummary;
  readonly snapshot: AgentRuntimeSnapshot;
  readonly metadata: AgentRuntimeMetadata;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly frozenAt: string;
}
