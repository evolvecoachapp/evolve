import type { IAgent } from "../../agent-framework/contracts/IAgent";
import type { AgentExecutionPlan } from "./AgentExecutionPlan";
import type { AgentExecutionResult } from "./AgentExecutionResult";
import type { AgentRuntimeContext } from "./AgentRuntimeContext";
import type { AgentRuntimeRequest } from "./AgentRuntimeRequest";

/**
 * Injectable agent executor — domain agents supply handlers;
 * the runtime never embeds business logic.
 */
export type AgentRuntimeExecutor = (input: {
  readonly agent: IAgent;
  readonly request: AgentRuntimeRequest;
  readonly context: AgentRuntimeContext;
  readonly plan: AgentExecutionPlan;
  readonly startedAt: string;
  readonly clock: () => string;
  readonly nowMs: () => number;
}) => AgentExecutionResult | Promise<AgentExecutionResult>;
