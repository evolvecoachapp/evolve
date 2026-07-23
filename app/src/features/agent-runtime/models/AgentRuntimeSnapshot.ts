import type { AgentExecutionPlan } from "./AgentExecutionPlan";
import type { AgentExecutionResult } from "./AgentExecutionResult";
import type { AgentRuntimeContext } from "./AgentRuntimeContext";
import type { AgentRuntimeEvent } from "./AgentRuntimeEvent";
import type { AgentRuntimeMetadata } from "./AgentRuntimeMetadata";
import type { AgentRuntimeRequest } from "./AgentRuntimeRequest";
import type { AgentRuntimeState } from "./AgentRuntimeState";
import type { AgentRuntimeSummary } from "./AgentRuntimeSummary";

/**
 * Immutable full runtime invocation snapshot.
 */
export interface AgentRuntimeSnapshot {
  readonly id: string;
  readonly runtimeId: string;
  readonly request: AgentRuntimeRequest;
  readonly context: AgentRuntimeContext;
  readonly state: AgentRuntimeState;
  readonly plan: AgentExecutionPlan | null;
  readonly result: AgentExecutionResult | null;
  readonly events: readonly AgentRuntimeEvent[];
  readonly summary: AgentRuntimeSummary;
  readonly metadata: AgentRuntimeMetadata;
  readonly capturedAt: string;
}
