import type { IAgent } from "../../agent-framework/contracts/IAgent";
import { buildAgentRuntimeContext } from "../builders/AgentRuntimeContextBuilder";
import {
  createEventCoordinator,
  EventCoordinator,
} from "../coordinators/EventCoordinator";
import {
  createExecutionCoordinator,
  ExecutionCoordinator,
} from "../coordinators/ExecutionCoordinator";
import {
  createLifecycleCoordinator,
  LifecycleCoordinator,
} from "../coordinators/LifecycleCoordinator";
import {
  createResponseCoordinator,
  ResponseCoordinator,
} from "../coordinators/ResponseCoordinator";
import type { AgentExecutionPlan } from "../models/AgentExecutionPlan";
import type { AgentRuntimeDescriptor } from "../models/AgentRuntimeDescriptor";
import type { AgentRuntimeExecutor } from "../models/AgentRuntimeExecutor";
import {
  AgentRuntimeException,
  createRuntimeError,
} from "../models/AgentRuntimeError";
import { AgentRuntimeEventTypes } from "../models/AgentRuntimeEvent";
import { EMPTY_AGENT_RUNTIME_METADATA } from "../models/AgentRuntimeMetadata";
import type { AgentRuntimeRequest } from "../models/AgentRuntimeRequest";
import type { AgentRuntimeResponse } from "../models/AgentRuntimeResponse";
import { AgentRuntimeStatuses } from "../models/AgentRuntimeStatus";
import {
  AgentRegistry,
  createAgentRegistry,
  type AgentRegistryEntry,
} from "../registry/AgentRegistry";
import {
  AgentSelector,
  createAgentSelector,
} from "../selectors/AgentSelector";
import {
  capabilityKeysOf,
  freezeDescriptor,
  freezePlan,
} from "../utils";
import {
  validateExecutionLifecycle,
  validateExecutionPlan,
  validateRegistryIntegrity,
  validateRuntimeRequest,
  validateRuntimeResponse,
  validateSelectedAgent,
} from "../validators";

export interface AgentRuntimeDeps {
  readonly registry?: AgentRegistry;
  readonly selector?: AgentSelector;
  readonly executionCoordinator?: ExecutionCoordinator;
  readonly lifecycleCoordinator?: LifecycleCoordinator;
  readonly responseCoordinator?: ResponseCoordinator;
  readonly eventCoordinator?: EventCoordinator;
  readonly clock?: () => string;
  readonly nowMs?: () => number;
  readonly runtimeId?: string;
}

/**
 * Agent Runtime — single execution entry point for agent workflows.
 *
 * Receive request → resolve agent → coordinate execution → immutable response.
 * No business logic. No providers. No networking. No persistence.
 */
export class AgentRuntime {
  readonly id: string;

  private registry: AgentRegistry;
  private readonly selector: AgentSelector;
  private readonly executionCoordinator: ExecutionCoordinator;
  private readonly lifecycleCoordinator: LifecycleCoordinator;
  private readonly responseCoordinator: ResponseCoordinator;
  private readonly eventCoordinator: EventCoordinator;
  private readonly clock: () => string;
  private readonly nowMs: () => number;

  constructor(deps: AgentRuntimeDeps = {}) {
    this.id = deps.runtimeId ?? "runtime:agent:default";
    this.registry = deps.registry ?? createAgentRegistry();
    this.selector = deps.selector ?? createAgentSelector();
    this.executionCoordinator =
      deps.executionCoordinator ?? createExecutionCoordinator();
    this.lifecycleCoordinator =
      deps.lifecycleCoordinator ?? createLifecycleCoordinator();
    this.responseCoordinator =
      deps.responseCoordinator ?? createResponseCoordinator();
    this.eventCoordinator =
      deps.eventCoordinator ?? createEventCoordinator();
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.nowMs = deps.nowMs ?? (() => Date.now());
  }

  getRegistry(): AgentRegistry {
    return this.registry;
  }

  registerAgent(
    agent: IAgent,
    options: { readonly executor?: AgentRuntimeExecutor | null } = {},
  ): void {
    this.registry = this.registry.register(agent, {
      executor: options.executor ?? null,
      registeredAt: this.clock(),
    });
  }

  unregisterAgent(agentId: string): boolean {
    if (!this.registry.has(agentId)) {
      return false;
    }
    this.registry = this.registry.unregister(agentId);
    return true;
  }

  listAgents(): readonly IAgent[] {
    return this.registry.list();
  }

  describeAgent(agentId: string): AgentRuntimeDescriptor | null {
    const entry = this.registry.lookupEntry(agentId);
    if (!entry) return null;
    return this.toDescriptor(entry);
  }

  async execute(request: AgentRuntimeRequest): Promise<AgentRuntimeResponse> {
    const startedAt = this.clock();
    const startMs = this.nowMs();
    this.eventCoordinator.clear();

    let state = this.lifecycleCoordinator.createInitial({
      runtimeId: this.id,
      requestId: request.id,
      updatedAt: startedAt,
    });

    const context = buildAgentRuntimeContext({
      id: `ctx:${request.id}`,
      runtimeId: this.id,
      request,
      createdAt: startedAt,
      metadata: {
        tags: Object.freeze(["agent-runtime"]),
        attributes: Object.freeze({ runtimeId: this.id }),
      },
    });

    this.eventCoordinator.emit({
      type: AgentRuntimeEventTypes.RUNTIME_STARTED,
      runtimeId: this.id,
      requestId: request.id,
      status: AgentRuntimeStatuses.IDLE,
      message: "Runtime started",
      occurredAt: startedAt,
    });

    try {
      state = this.lifecycleCoordinator.transition(state, {
        status: AgentRuntimeStatuses.VALIDATING,
        phase: "validating",
        updatedAt: this.clock(),
      });

      const requestIssues = validateRuntimeRequest(request);
      if (requestIssues.length > 0) {
        throw new AgentRuntimeException(
          "invalid_runtime_request",
          `Invalid runtime request: ${requestIssues.join(", ")}`,
          request.agentId,
        );
      }

      const registryIssues = validateRegistryIntegrity(this.registry);
      if (registryIssues.length > 0) {
        throw new AgentRuntimeException(
          "invalid_registry",
          `Registry integrity failed: ${registryIssues.join(", ")}`,
        );
      }

      this.eventCoordinator.emit({
        type: AgentRuntimeEventTypes.REQUEST_VALIDATED,
        runtimeId: this.id,
        requestId: request.id,
        status: AgentRuntimeStatuses.VALIDATING,
        message: "Request validated",
        occurredAt: this.clock(),
      });

      state = this.lifecycleCoordinator.transition(state, {
        status: AgentRuntimeStatuses.SELECTING,
        phase: "selecting",
        updatedAt: this.clock(),
      });

      const selection = this.selector.select(this.registry.list(), request);
      const agentIssues = validateSelectedAgent(selection.agent);
      if (agentIssues.length > 0) {
        throw new AgentRuntimeException(
          "invalid_selected_agent",
          `Selected agent invalid: ${agentIssues.join(", ")}`,
          selection.agentId,
        );
      }

      state = this.lifecycleCoordinator.transition(state, {
        status: AgentRuntimeStatuses.PLANNING,
        phase: "planning",
        selectedAgentId: selection.agentId,
        message: selection.reason,
        updatedAt: this.clock(),
      });

      this.eventCoordinator.emit({
        type: AgentRuntimeEventTypes.AGENT_SELECTED,
        runtimeId: this.id,
        requestId: request.id,
        agentId: selection.agentId,
        status: AgentRuntimeStatuses.SELECTING,
        message: selection.reason,
        occurredAt: this.clock(),
      });

      const plan = this.buildPlan(request, selection);
      const planIssues = validateExecutionPlan(plan);
      if (planIssues.length > 0) {
        throw new AgentRuntimeException(
          "invalid_execution_plan",
          `Execution plan invalid: ${planIssues.join(", ")}`,
          selection.agentId,
        );
      }

      this.eventCoordinator.emit({
        type: AgentRuntimeEventTypes.PLAN_BUILT,
        runtimeId: this.id,
        requestId: request.id,
        agentId: selection.agentId,
        status: AgentRuntimeStatuses.PLANNING,
        message: `Plan ${plan.id}`,
        occurredAt: this.clock(),
      });

      state = this.lifecycleCoordinator.transition(state, {
        status: AgentRuntimeStatuses.EXECUTING,
        phase: "executing",
        selectedAgentId: selection.agentId,
        updatedAt: this.clock(),
      });

      this.eventCoordinator.emit({
        type: AgentRuntimeEventTypes.EXECUTION_STARTED,
        runtimeId: this.id,
        requestId: request.id,
        agentId: selection.agentId,
        status: AgentRuntimeStatuses.EXECUTING,
        message: "Execution started",
        occurredAt: this.clock(),
      });

      const entry = this.registry.lookupEntry(selection.agentId);
      const result = await this.executionCoordinator.execute({
        agent: selection.agent,
        request,
        context,
        plan,
        executor: entry?.executor ?? null,
        clock: this.clock,
        nowMs: this.nowMs,
      });

      state = this.lifecycleCoordinator.transition(state, {
        status: AgentRuntimeStatuses.COLLECTING,
        phase: "collecting",
        selectedAgentId: selection.agentId,
        updatedAt: this.clock(),
      });

      this.eventCoordinator.emit({
        type: result.success
          ? AgentRuntimeEventTypes.EXECUTION_COMPLETED
          : AgentRuntimeEventTypes.EXECUTION_FAILED,
        runtimeId: this.id,
        requestId: request.id,
        agentId: selection.agentId,
        status: result.success
          ? AgentRuntimeStatuses.COMPLETED
          : AgentRuntimeStatuses.FAILED,
        message: result.message,
        occurredAt: this.clock(),
      });

      const completedAt = this.clock();
      state = this.lifecycleCoordinator.transition(state, {
        status: result.success
          ? AgentRuntimeStatuses.COMPLETED
          : AgentRuntimeStatuses.FAILED,
        phase: result.success ? "completed" : "failed",
        selectedAgentId: selection.agentId,
        message: result.message,
        updatedAt: completedAt,
      });

      const lifecycleIssues = validateExecutionLifecycle(state, {
        expectTerminal: true,
      });
      if (lifecycleIssues.length > 0) {
        throw new AgentRuntimeException(
          "invalid_lifecycle",
          `Lifecycle invalid: ${lifecycleIssues.join(", ")}`,
          selection.agentId,
        );
      }

      const events = this.eventCoordinator.list();
      const response = this.responseCoordinator.build({
        runtimeId: this.id,
        request,
        context,
        state,
        plan,
        result,
        error: result.error,
        events,
        startedAt,
        completedAt,
        durationMs: Math.max(0, this.nowMs() - startMs),
        metadata: EMPTY_AGENT_RUNTIME_METADATA,
      });

      this.eventCoordinator.emit({
        type: AgentRuntimeEventTypes.RESPONSE_BUILT,
        runtimeId: this.id,
        requestId: request.id,
        agentId: selection.agentId,
        status: response.status,
        message: "Response built",
        occurredAt: completedAt,
      });

      const finalEvents = this.eventCoordinator.list();
      const finalResponse = this.responseCoordinator.build({
        runtimeId: this.id,
        request,
        context,
        state,
        plan,
        result,
        error: result.error,
        events: finalEvents,
        startedAt,
        completedAt,
        durationMs: Math.max(0, this.nowMs() - startMs),
        metadata: EMPTY_AGENT_RUNTIME_METADATA,
      });

      const responseIssues = validateRuntimeResponse(finalResponse);
      if (responseIssues.length > 0) {
        throw new AgentRuntimeException(
          "invalid_runtime_response",
          `Response invalid: ${responseIssues.join(", ")}`,
          selection.agentId,
        );
      }

      return finalResponse;
    } catch (error) {
      const completedAt = this.clock();
      const runtimeError =
        error instanceof AgentRuntimeException
          ? createRuntimeError({
              code: error.code,
              message: error.message,
              agentId: error.agentId,
              details: error.details,
              occurredAt: completedAt,
            })
          : createRuntimeError({
              code: "runtime_failed",
              message:
                error instanceof Error
                  ? error.message
                  : "Unknown runtime failure",
              agentId: request.agentId,
              occurredAt: completedAt,
            });

      state = this.lifecycleCoordinator.transition(state, {
        status: AgentRuntimeStatuses.FAILED,
        phase: "failed",
        message: runtimeError.message,
        updatedAt: completedAt,
      });

      this.eventCoordinator.emit({
        type: AgentRuntimeEventTypes.RUNTIME_FAILED,
        runtimeId: this.id,
        requestId: request.id,
        agentId: runtimeError.agentId,
        status: AgentRuntimeStatuses.FAILED,
        message: runtimeError.message,
        occurredAt: completedAt,
      });

      return this.responseCoordinator.build({
        runtimeId: this.id,
        request,
        context,
        state,
        plan: null,
        result: null,
        error: runtimeError,
        events: this.eventCoordinator.list(),
        startedAt,
        completedAt,
        durationMs: Math.max(0, this.nowMs() - startMs),
        metadata: EMPTY_AGENT_RUNTIME_METADATA,
      });
    }
  }

  private buildPlan(
    request: AgentRuntimeRequest,
    selection: {
      readonly agentId: string;
      readonly role: AgentExecutionPlan["role"];
      readonly capability: AgentExecutionPlan["capability"];
      readonly reason: string;
      readonly fallbackUsed: boolean;
    },
  ): AgentExecutionPlan {
    const createdAt = this.clock();
    return freezePlan({
      id: `plan:${request.id}`,
      requestId: request.id,
      agentId: selection.agentId,
      role: selection.role,
      capability: selection.capability,
      selectionReason: selection.reason,
      fallbackUsed: selection.fallbackUsed,
      status: AgentRuntimeStatuses.PLANNING,
      metadata: {
        tags: Object.freeze(["agent-runtime", "execution-plan"]),
        attributes: Object.freeze({
          matchedFallback: selection.fallbackUsed,
        }),
      },
      createdAt,
      frozenAt: createdAt,
    });
  }

  private toDescriptor(entry: AgentRegistryEntry): AgentRuntimeDescriptor {
    const info = entry.agent.getInfo();
    return freezeDescriptor({
      agentId: entry.agent.id,
      role: entry.agent.getRole(),
      name: info.name,
      version: info.version,
      capabilities: capabilityKeysOf(entry.agent),
      hasExecutor: entry.executor != null,
      info,
      descriptor: entry.agent.getDescriptor(),
      metadata: {
        tags: Object.freeze(["agent-runtime"]),
        attributes: Object.freeze({
          registeredAt: entry.registeredAt,
        }),
      },
      registeredAt: entry.registeredAt,
    });
  }
}

export function createAgentRuntime(deps: AgentRuntimeDeps = {}): AgentRuntime {
  return new AgentRuntime(deps);
}
