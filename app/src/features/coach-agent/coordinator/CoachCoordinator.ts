import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import { CoachExecutionContextBuilder } from "../builders/CoachExecutionContextBuilder";
import { CoachExecutionPlanBuilder } from "../builders/CoachExecutionPlanBuilder";
import { CoachResultBuilder } from "../builders/CoachResultBuilder";
import { CoachResultMerger } from "../mergers/CoachResultMerger";
import type { CoachAgentResult } from "../models/CoachAgentResult";
import type { CoachExecutionEvent } from "../models/CoachExecutionEvent";
import { CoachExecutionEventTypes } from "../models/CoachExecutionEvent";
import type { CoachExecutionPlan } from "../models/CoachExecutionPlan";
import {
  CoachExecutionStatuses,
  type CoachExecutionState,
} from "../models/CoachExecutionState";
import { EMPTY_COACH_METADATA } from "../models/CoachMetadata";
import type { CoachRequest } from "../models/CoachRequest";
import type {
  SpecialistAgentInvocation,
  SpecialistAgentOutputs,
} from "../models/SpecialistAgentInvocation";
import { SpecialistInvocationStatuses } from "../models/SpecialistAgentInvocation";
import { SpecialistAgentKinds } from "../models/SpecialistAgentKind";
import { AgentCapabilityResolver } from "../selectors/AgentCapabilityResolver";
import {
  freezeDecision,
  freezeExecutionEvent,
  freezeExecutionState,
  freezeOutputs,
  freezeRequest,
} from "../utils/FreezeCoachState";
import { validateAgentCompatibility } from "../validators/validateAgentCompatibility";
import { validateCoachRequest } from "../validators/validateCoachRequest";
import { validateExecutionPlan } from "../validators/validateExecutionPlan";
import { validateMergedResult } from "../validators/validateMergedResult";
import {
  createDefaultSpecialistPorts,
  deriveNutritionRequest,
  deriveRecoveryRequest,
  deriveWorkoutRequest,
  type SpecialistAgentPorts,
  type SpecialistSharedContext,
} from "./SpecialistAgentPorts";

export interface CoachCoordinatorDeps {
  readonly clock?: () => string;
  readonly nowMs?: () => number;
  readonly resolver?: AgentCapabilityResolver;
  readonly merger?: CoachResultMerger;
  readonly ports?: SpecialistAgentPorts;
}

/**
 * Coordinates specialist agent selection → plan → invoke → merge → result.
 * No AI. No providers. No business logic — orchestration only.
 */
export class CoachCoordinator {
  private readonly clock: () => string;
  private readonly resolver: AgentCapabilityResolver;
  private readonly merger: CoachResultMerger;
  private readonly ports: SpecialistAgentPorts;
  private readonly contextBuilder = new CoachExecutionContextBuilder();
  private readonly planBuilder = new CoachExecutionPlanBuilder();
  private readonly resultBuilder = new CoachResultBuilder();
  private state: CoachExecutionState;

  constructor(deps: CoachCoordinatorDeps = {}) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.resolver = deps.resolver ?? new AgentCapabilityResolver();
    this.merger = deps.merger ?? new CoachResultMerger();
    this.ports = deps.ports ?? createDefaultSpecialistPorts();
    this.state = freezeExecutionState({
      id: "cstate:default",
      requestId: null,
      planId: null,
      status: CoachExecutionStatuses.IDLE,
      currentAgent: null,
      errorMessage: null,
      metadata: EMPTY_COACH_METADATA,
      updatedAt: this.clock(),
    });
  }

  getState(): CoachExecutionState {
    return this.state;
  }

  private updateState(
    patch: Partial<CoachExecutionState>,
  ): CoachExecutionState {
    this.state = freezeExecutionState({
      ...this.state,
      ...patch,
      metadata: patch.metadata ?? this.state.metadata,
      updatedAt: this.clock(),
    });
    return this.state;
  }

  private pushEvent(
    events: CoachExecutionEvent[],
    partial: Omit<CoachExecutionEvent, "id" | "metadata" | "occurredAt"> & {
      readonly id?: string;
    },
  ): void {
    events.push(
      freezeExecutionEvent({
        id: partial.id ?? `cevent:${events.length + 1}`,
        type: partial.type,
        requestId: partial.requestId,
        planId: partial.planId,
        status: partial.status,
        agent: partial.agent,
        message: partial.message,
        metadata: EMPTY_COACH_METADATA,
        occurredAt: this.clock(),
      }),
    );
  }

  buildPlan(request: CoachRequest): CoachExecutionPlan {
    const frozen = freezeRequest(request);
    const intent = this.resolver.inferIntent(
      frozen.message,
      frozen.intentHint,
    );
    const agents = this.resolver.resolve({
      intent,
      agentHints: frozen.agentHints,
    });
    return this.planBuilder.build({
      id: `cplan:${frozen.id}`,
      requestId: frozen.id,
      intent,
      agents,
      createdAt: this.clock(),
    });
  }

  process(input: {
    readonly request: CoachRequest;
    readonly conversationContext?: ConversationContext | null;
    readonly coachResponse?: CoachResponse | null;
    readonly actionPlan?: ActionPlan | null;
    readonly toolExecutionResult?: ToolExecutionResult | null;
    readonly memoryTurnCount?: number;
  }): CoachAgentResult {
    const startedAt = this.clock();
    const events: CoachExecutionEvent[] = [];
    const request = freezeRequest(input.request);

    this.updateState({
      status: CoachExecutionStatuses.PREPARING,
      requestId: request.id,
      planId: null,
      currentAgent: null,
      errorMessage: null,
    });

    const requestValidation = validateCoachRequest(request);
    if (!requestValidation.valid) {
      return this.failEarly({
        request,
        startedAt,
        events,
        validation: requestValidation,
        message: requestValidation.issues[0]?.message ?? "Invalid coach request.",
      });
    }

    this.updateState({ status: CoachExecutionStatuses.RESOLVING });
    const intent = this.resolver.inferIntent(
      request.message,
      request.intentHint,
    );
    const selectedAgents = this.resolver.resolve({
      intent,
      agentHints: request.agentHints,
    });

    this.pushEvent(events, {
      type: CoachExecutionEventTypes.AGENT_SELECTED,
      requestId: request.id,
      planId: null,
      status: CoachExecutionStatuses.RESOLVING,
      agent: selectedAgents[0] ?? null,
      message: `Selected agents: ${selectedAgents.join(", ") || "none"}`,
    });

    const compatibility = validateAgentCompatibility({
      intent,
      agents: selectedAgents,
      resolver: this.resolver,
    });

    this.updateState({ status: CoachExecutionStatuses.PLANNING });
    const plan = this.planBuilder.build({
      id: `cplan:${request.id}`,
      requestId: request.id,
      intent,
      agents: selectedAgents,
      createdAt: this.clock(),
    });
    this.updateState({ planId: plan.id });

    this.pushEvent(events, {
      type: CoachExecutionEventTypes.PLAN_BUILT,
      requestId: request.id,
      planId: plan.id,
      status: CoachExecutionStatuses.PLANNING,
      agent: null,
      message: `Plan built with ${plan.steps.length} step(s).`,
    });

    const planValidation = validateExecutionPlan(plan);
    const context = this.contextBuilder.build({
      id: `cctx:${request.id}`,
      request,
      intent,
      selectedAgents,
      createdAt: this.clock(),
      conversationContext: input.conversationContext,
      coachResponse: input.coachResponse,
      actionPlan: input.actionPlan,
      toolExecutionResult: input.toolExecutionResult,
      memoryTurnCount: input.memoryTurnCount,
    });

    const shared: SpecialistSharedContext = {
      conversationContext: input.conversationContext,
      coachResponse: input.coachResponse,
      actionPlan: input.actionPlan,
      toolExecutionResult: input.toolExecutionResult,
      memoryTurnCount: input.memoryTurnCount,
    };

    this.updateState({ status: CoachExecutionStatuses.INVOKING });
    const invocations: SpecialistAgentInvocation[] = [];
    let workout = null as SpecialistAgentOutputs["workout"];
    let recovery = null as SpecialistAgentOutputs["recovery"];
    let nutrition = null as SpecialistAgentOutputs["nutrition"];

    for (const agent of selectedAgents) {
      this.updateState({ currentAgent: agent });
      try {
        if (agent === SpecialistAgentKinds.WORKOUT) {
          this.pushEvent(events, {
            type: CoachExecutionEventTypes.AGENT_INVOKED,
            requestId: request.id,
            planId: plan.id,
            status: CoachExecutionStatuses.INVOKING,
            agent,
            message: "Invoking Workout Agent",
          });
          const port = this.ports.processWorkout;
          if (!port) {
            invocations.push(
              this.skippedInvocation(agent, "Workout port not configured"),
            );
            continue;
          }
          workout = port({
            request: deriveWorkoutRequest(request),
            ...shared,
          });
          invocations.push(
            this.completedInvocation(agent, workout.id, workout.success, workout.message),
          );
          this.pushEvent(events, {
            type: CoachExecutionEventTypes.AGENT_COMPLETED,
            requestId: request.id,
            planId: plan.id,
            status: CoachExecutionStatuses.INVOKING,
            agent,
            message: workout.message,
          });
        } else if (agent === SpecialistAgentKinds.RECOVERY) {
          this.pushEvent(events, {
            type: CoachExecutionEventTypes.AGENT_INVOKED,
            requestId: request.id,
            planId: plan.id,
            status: CoachExecutionStatuses.INVOKING,
            agent,
            message: "Invoking Recovery Agent",
          });
          const port = this.ports.processRecovery;
          if (!port) {
            invocations.push(
              this.skippedInvocation(agent, "Recovery port not configured"),
            );
            continue;
          }
          recovery = port({
            request: deriveRecoveryRequest(request),
            ...shared,
          });
          invocations.push(
            this.completedInvocation(
              agent,
              recovery.id,
              recovery.success,
              recovery.message,
            ),
          );
          this.pushEvent(events, {
            type: CoachExecutionEventTypes.AGENT_COMPLETED,
            requestId: request.id,
            planId: plan.id,
            status: CoachExecutionStatuses.INVOKING,
            agent,
            message: recovery.message,
          });
        } else if (agent === SpecialistAgentKinds.NUTRITION) {
          this.pushEvent(events, {
            type: CoachExecutionEventTypes.AGENT_INVOKED,
            requestId: request.id,
            planId: plan.id,
            status: CoachExecutionStatuses.INVOKING,
            agent,
            message: "Invoking Nutrition Agent",
          });
          const port = this.ports.processNutrition;
          if (!port) {
            invocations.push(
              this.skippedInvocation(agent, "Nutrition port not configured"),
            );
            continue;
          }
          nutrition = port({
            request: deriveNutritionRequest(request),
            ...shared,
          });
          invocations.push(
            this.completedInvocation(
              agent,
              nutrition.id,
              nutrition.success,
              nutrition.message,
            ),
          );
          this.pushEvent(events, {
            type: CoachExecutionEventTypes.AGENT_COMPLETED,
            requestId: request.id,
            planId: plan.id,
            status: CoachExecutionStatuses.INVOKING,
            agent,
            message: nutrition.message,
          });
        } else {
          invocations.push(
            this.skippedInvocation(agent, "Future agent not yet invocable"),
          );
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Specialist agent failed";
        invocations.push({
          id: `cinv:${agent}:failed`,
          agent,
          status: SpecialistInvocationStatuses.FAILED,
          summary: message,
          success: false,
          resultId: null,
          attributes: Object.freeze({}),
          invokedAt: this.clock(),
        });
        this.pushEvent(events, {
          type: CoachExecutionEventTypes.AGENT_FAILED,
          requestId: request.id,
          planId: plan.id,
          status: CoachExecutionStatuses.INVOKING,
          agent,
          message,
        });
      }
    }

    this.updateState({ status: CoachExecutionStatuses.MERGING, currentAgent: null });
    this.pushEvent(events, {
      type: CoachExecutionEventTypes.MERGE_STARTED,
      requestId: request.id,
      planId: plan.id,
      status: CoachExecutionStatuses.MERGING,
      agent: null,
      message: "Merging specialist outputs",
    });

    const outputs = freezeOutputs({
      workout,
      recovery,
      nutrition,
      invocations: Object.freeze(invocations),
      metadata: EMPTY_COACH_METADATA,
    });

    const decision = this.merger.merge({
      id: `cdecision:${request.id}`,
      outputs,
      decidedAt: this.clock(),
    });

    this.pushEvent(events, {
      type: CoachExecutionEventTypes.MERGE_COMPLETED,
      requestId: request.id,
      planId: plan.id,
      status: CoachExecutionStatuses.MERGING,
      agent: null,
      message: `Merged decision accepted=${decision.accepted}`,
    });

    this.updateState({ status: CoachExecutionStatuses.EVALUATING });
    const mergeValidation = validateMergedResult(decision);
    const validation = Object.freeze({
      valid:
        requestValidation.valid &&
        compatibility.valid &&
        planValidation.valid &&
        mergeValidation.valid,
      issues: Object.freeze([
        ...requestValidation.issues,
        ...compatibility.issues,
        ...planValidation.issues,
        ...mergeValidation.issues,
      ]),
    });

    const success =
      validation.valid &&
      decision.accepted &&
      invocations.every((item) => item.status !== SpecialistInvocationStatuses.FAILED);

    const message = success
      ? `Coach orchestrated ${selectedAgents.length} agent(s) successfully.`
      : `Coach orchestration incomplete (${invocations.filter((i) => i.status === "failed").length} failure(s)).`;

    const summary = this.resultBuilder.buildSummary({
      requestId: request.id,
      intent,
      agentsInvoked: selectedAgents,
      decision,
      success,
      message,
      createdAt: this.clock(),
    });

    const completedAt = this.clock();
    this.updateState({
      status: success
        ? CoachExecutionStatuses.COMPLETED
        : CoachExecutionStatuses.FAILED,
      errorMessage: success ? null : message,
    });

    this.pushEvent(events, {
      type: CoachExecutionEventTypes.STATE_CHANGED,
      requestId: request.id,
      planId: plan.id,
      status: this.state.status,
      agent: null,
      message,
    });

    return this.resultBuilder.buildResult({
      id: `cresult:${request.id}`,
      request,
      context,
      plan,
      outputs,
      decision,
      validation,
      summary,
      events: Object.freeze(events),
      success,
      message,
      startedAt,
      completedAt,
    });
  }

  private completedInvocation(
    agent: SpecialistAgentInvocation["agent"],
    resultId: string,
    success: boolean,
    summary: string | null,
  ): SpecialistAgentInvocation {
    return Object.freeze({
      id: `cinv:${agent}:${resultId}`,
      agent,
      status: success
        ? SpecialistInvocationStatuses.INVOKED
        : SpecialistInvocationStatuses.FAILED,
      summary: summary ?? `${agent} completed`,
      success,
      resultId,
      attributes: Object.freeze({}),
      invokedAt: this.clock(),
    });
  }

  private skippedInvocation(
    agent: SpecialistAgentInvocation["agent"],
    reason: string,
  ): SpecialistAgentInvocation {
    return Object.freeze({
      id: `cinv:${agent}:skipped`,
      agent,
      status: SpecialistInvocationStatuses.SKIPPED,
      summary: reason,
      success: null,
      resultId: null,
      attributes: Object.freeze({}),
      invokedAt: this.clock(),
    });
  }

  private failEarly(input: {
    readonly request: CoachRequest;
    readonly startedAt: string;
    readonly events: CoachExecutionEvent[];
    readonly validation: ReturnType<typeof validateCoachRequest>;
    readonly message: string;
  }): CoachAgentResult {
    const intent = this.resolver.inferIntent(
      input.request.message,
      input.request.intentHint,
    );
    const plan = this.planBuilder.build({
      id: `cplan:${input.request.id}:invalid`,
      requestId: input.request.id,
      intent,
      agents: Object.freeze([]),
      createdAt: this.clock(),
    });
    const context = this.contextBuilder.build({
      id: `cctx:${input.request.id}`,
      request: input.request,
      intent,
      selectedAgents: Object.freeze([]),
      createdAt: this.clock(),
    });
    const outputs = freezeOutputs({
      workout: null,
      recovery: null,
      nutrition: null,
      invocations: Object.freeze([]),
      metadata: EMPTY_COACH_METADATA,
    });
    const decision = this.merger.merge({
      id: `cdecision:${input.request.id}:invalid`,
      outputs,
      decidedAt: this.clock(),
    });
    const completedAt = this.clock();
    this.updateState({
      status: CoachExecutionStatuses.FAILED,
      requestId: input.request.id,
      errorMessage: input.message,
    });
    const summary = this.resultBuilder.buildSummary({
      requestId: input.request.id,
      intent,
      agentsInvoked: Object.freeze([]),
      decision,
      success: false,
      message: input.message,
      createdAt: completedAt,
    });
    return this.resultBuilder.buildResult({
      id: `cresult:${input.request.id}`,
      request: input.request,
      context,
      plan,
      outputs,
      decision: freezeDecision({ ...decision, accepted: false }),
      validation: input.validation,
      summary,
      events: Object.freeze(input.events),
      success: false,
      message: input.message,
      startedAt: input.startedAt,
      completedAt,
    });
  }
}

export function createCoachCoordinator(
  deps: CoachCoordinatorDeps = {},
): CoachCoordinator {
  return new CoachCoordinator(deps);
}
