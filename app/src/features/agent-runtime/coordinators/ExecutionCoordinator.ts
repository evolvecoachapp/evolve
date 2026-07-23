import type { IAgent } from "../../agent-framework/contracts/IAgent";
import type { AgentExecutionPlan } from "../models/AgentExecutionPlan";
import type { AgentExecutionResult } from "../models/AgentExecutionResult";
import type { AgentRuntimeContext } from "../models/AgentRuntimeContext";
import type { AgentRuntimeExecutor } from "../models/AgentRuntimeExecutor";
import type { AgentRuntimeRequest } from "../models/AgentRuntimeRequest";
import { AgentRuntimeStatuses } from "../models/AgentRuntimeStatus";
import { createRuntimeError } from "../models/AgentRuntimeError";
import { EMPTY_AGENT_RUNTIME_METADATA } from "../models/AgentRuntimeMetadata";
import { freezeResult } from "../utils/FreezeRuntime";

/**
 * Coordinates agent executor invocation. No business logic.
 */
export class ExecutionCoordinator {
  readonly id = "runtime:execution-coordinator";

  async execute(options: {
    readonly agent: IAgent;
    readonly request: AgentRuntimeRequest;
    readonly context: AgentRuntimeContext;
    readonly plan: AgentExecutionPlan;
    readonly executor: AgentRuntimeExecutor | null;
    readonly clock: () => string;
    readonly nowMs: () => number;
  }): Promise<AgentExecutionResult> {
    const startedAt = options.clock();
    const startMs = options.nowMs();
    const executor = options.executor ?? defaultShellExecutor;

    try {
      const result = await executor({
        agent: options.agent,
        request: options.request,
        context: options.context,
        plan: options.plan,
        startedAt,
        clock: options.clock,
        nowMs: options.nowMs,
      });
      return freezeResult(result);
    } catch (error) {
      const completedAt = options.clock();
      const message =
        error instanceof Error ? error.message : "Agent execution failed";
      return freezeResult({
        id: `result:${options.plan.id}`,
        planId: options.plan.id,
        requestId: options.request.id,
        agentId: options.agent.id,
        success: false,
        status: AgentRuntimeStatuses.FAILED,
        message,
        attributes: Object.freeze({
          role: options.agent.getRole(),
        }),
        error: createRuntimeError({
          code: "execution_failed",
          message,
          agentId: options.agent.id,
          occurredAt: completedAt,
        }),
        metadata: EMPTY_AGENT_RUNTIME_METADATA,
        startedAt,
        completedAt,
        durationMs: Math.max(0, options.nowMs() - startMs),
        frozenAt: completedAt,
      });
    }
  }
}

/**
 * Default shell executor — returns orchestration metadata only.
 * Domain agents register custom executors for real work.
 */
export const defaultShellExecutor: AgentRuntimeExecutor = (input) => {
  const startMs = input.nowMs();
  const completedAt = input.clock();
  const info = input.agent.getInfo();
  return freezeResult({
    id: `result:${input.plan.id}`,
    planId: input.plan.id,
    requestId: input.request.id,
    agentId: input.agent.id,
    success: true,
    status: AgentRuntimeStatuses.COMPLETED,
    message: `Agent ${info.name} executed via runtime shell`,
    attributes: Object.freeze({
      role: info.role,
      version: info.version,
      intent: input.request.intent || null,
      selectionReason: input.plan.selectionReason,
      executor: "shell",
    }),
    error: null,
    metadata: {
      tags: Object.freeze(["agent-runtime", "shell-executor"]),
      attributes: Object.freeze({
        agentName: info.name,
      }),
    },
    startedAt: input.startedAt,
    completedAt,
    durationMs: Math.max(0, input.nowMs() - startMs),
    frozenAt: completedAt,
  });
};

export function createExecutionCoordinator(): ExecutionCoordinator {
  return new ExecutionCoordinator();
}
