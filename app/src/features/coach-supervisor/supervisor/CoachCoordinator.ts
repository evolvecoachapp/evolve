import {
  buildAggregationContext,
  buildAggregationResult,
} from "../builders/AggregationBuilder";
import { buildSupervisorContext } from "../builders/SupervisorContextBuilder";
import { buildSupervisorResult } from "../builders/SupervisorResultBuilder";
import { buildSupervisorSnapshot } from "../builders/SupervisorSnapshotBuilder";
import { buildSupervisorSummary } from "../builders/SupervisorSummaryBuilder";
import { buildUnifiedCoachResponse } from "../builders/UnifiedResponseBuilder";
import type { CollaborationPort } from "../contracts/CollaborationPort";
import type { RoutingPort } from "../contracts/RoutingPort";
import {
  createCoordinationEngine,
  type CoordinationEngine,
} from "../coordination/CoordinationEngine";
import { createConflictResolver } from "../aggregation/ConflictResolver";
import { createExplanationAggregator } from "../aggregation/ExplanationAggregator";
import { createResultAggregator } from "../aggregation/ResultAggregator";
import { createResponseAggregator } from "../aggregation/ResponseAggregator";
import { createSupervisorError } from "../models/CoachSupervisorError";
import {
  CoachSupervisorEventTypes,
  type CoachSupervisorEvent,
} from "../models/CoachSupervisorEvent";
import {
  CoachSupervisorExecutionStatuses,
  type CoachSupervisorExecution,
} from "../models/CoachSupervisorExecution";
import { EMPTY_SUPERVISOR_METADATA } from "../models/CoachSupervisorMetadata";
import type { CoachSupervisorPlan } from "../models/CoachSupervisorPlan";
import type { CoachSupervisorRequest } from "../models/CoachSupervisorRequest";
import {
  CoachSupervisorOperationKinds,
  type CoachSupervisorResult,
} from "../models/CoachSupervisorResult";
import type { AgentExecutionSummary } from "../models/AgentExecutionSummary";
import {
  freezeEvent,
  freezeExecution,
  freezeRequest,
} from "../utils/FreezeSupervisorState";
import { validateAggregationIntegrity } from "../validators/validateAggregationIntegrity";
import { validateResponseConsistency } from "../validators/validateResponseConsistency";
import { validateSupervisorPlan } from "../validators/validateSupervisorPlan";
import { validateSupervisorRequest } from "../validators/validateSupervisorRequest";
import { createCoachSupervisorSession } from "./CoachSupervisorSession";

export interface CoachCoordinatorDeps {
  readonly routingPort: RoutingPort;
  readonly collaborationPort: CollaborationPort;
  readonly clock?: () => string;
}

/**
 * Coordinates routing → planning → collaboration → aggregation.
 * No business logic.
 */
export class CoachCoordinator {
  private readonly clock: () => string;
  private readonly engine: CoordinationEngine;
  private readonly session: ReturnType<typeof createCoachSupervisorSession>;
  private readonly resultAggregator = createResultAggregator();
  private readonly responseAggregator = createResponseAggregator();
  private readonly conflictResolver = createConflictResolver();
  private readonly explanationAggregator = createExplanationAggregator();
  private sequence = 0;

  constructor(deps: CoachCoordinatorDeps) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.engine = createCoordinationEngine({
      routingPort: deps.routingPort,
      collaborationPort: deps.collaborationPort,
    });
    this.session = createCoachSupervisorSession({ clock: this.clock });
  }

  getSession() {
    return this.session;
  }

  buildCoordinationPlan(request: CoachSupervisorRequest): CoachSupervisorResult {
    const startedAt = this.clock();
    const frozen = freezeRequest(request);
    const requestValidation = validateSupervisorRequest(frozen);
    if (!requestValidation.valid) {
      return this.failResult({
        operation: CoachSupervisorOperationKinds.BUILD_PLAN,
        request: frozen,
        validation: requestValidation,
        startedAt,
        message: "Invalid supervisor request.",
      });
    }

    const coordinated = this.engine.buildPlan({
      request: frozen,
      planId: `splan:${++this.sequence}`,
      createdAt: this.clock(),
    });
    const completedAt = this.clock();
    if (!coordinated.plan) {
      return this.failResult({
        operation: CoachSupervisorOperationKinds.BUILD_PLAN,
        request: frozen,
        startedAt,
        completedAt,
        message: coordinated.message ?? "Plan build failed.",
      });
    }

    const planValidation = validateSupervisorPlan(coordinated.plan);
    return buildSupervisorResult({
      id: `result:plan:${this.sequence}`,
      operation: CoachSupervisorOperationKinds.BUILD_PLAN,
      success: coordinated.success && planValidation.valid,
      message: coordinated.message,
      request: frozen,
      plan: coordinated.plan,
      validation: planValidation,
      error: planValidation.valid
        ? null
        : createSupervisorError({
            code: planValidation.issues[0]!.code,
            message: planValidation.issues[0]!.message,
            path: planValidation.issues[0]!.path,
          }),
      events: Object.freeze([
        this.event(
          CoachSupervisorEventTypes.PLAN_BUILT,
          frozen.id,
          coordinated.plan.id,
          "plan_built",
          completedAt,
        ),
      ]),
      startedAt,
      completedAt,
    });
  }

  aggregateResults(input: {
    readonly plan: CoachSupervisorPlan;
    readonly summaries: readonly AgentExecutionSummary[];
  }): CoachSupervisorResult {
    const startedAt = this.clock();
    const context = buildAggregationContext({
      id: `actx:${++this.sequence}`,
      plan: input.plan.coordination,
      summaries: input.summaries,
      createdAt: startedAt,
    });
    const explanations = this.explanationAggregator.aggregate(input.summaries);
    const conflicts = this.conflictResolver.resolve(input.summaries);
    const aggregation = this.resultAggregator.aggregate({
      id: `agg:${this.sequence}`,
      context,
      explanations,
      conflicts,
      createdAt: this.clock(),
    });
    const validation = validateAggregationIntegrity(aggregation);
    const completedAt = this.clock();
    return buildSupervisorResult({
      id: `result:agg:${this.sequence}`,
      operation: CoachSupervisorOperationKinds.AGGREGATE,
      success: validation.valid && aggregation.success,
      message: aggregation.message,
      plan: input.plan,
      aggregation,
      validation,
      error: validation.valid
        ? null
        : createSupervisorError({
            code: validation.issues[0]!.code,
            message: validation.issues[0]!.message,
            path: validation.issues[0]!.path,
          }),
      events: Object.freeze([
        this.event(
          CoachSupervisorEventTypes.AGGREGATED,
          input.plan.requestId,
          input.plan.id,
          "aggregated",
          completedAt,
        ),
      ]),
      startedAt,
      completedAt,
    });
  }

  processCoachRequest(request: CoachSupervisorRequest): CoachSupervisorResult {
    const startedAt = this.clock();
    const events: CoachSupervisorEvent[] = [];
    const frozen = freezeRequest(request);
    events.push(
      this.event(
        CoachSupervisorEventTypes.REQUEST_RECEIVED,
        frozen.id,
        null,
        "received",
        startedAt,
      ),
    );

    const requestValidation = validateSupervisorRequest(frozen);
    if (!requestValidation.valid) {
      this.session.updateState(
        {
          requestId: frozen.id,
          status: CoachSupervisorExecutionStatuses.FAILED,
          errorMessage: requestValidation.issues[0]?.message ?? null,
        },
        this.clock,
      );
      return this.failResult({
        operation: CoachSupervisorOperationKinds.PROCESS,
        request: frozen,
        validation: requestValidation,
        startedAt,
        message: "Invalid supervisor request.",
        events,
      });
    }

    this.session.updateState(
      {
        requestId: frozen.id,
        status: CoachSupervisorExecutionStatuses.ROUTING,
      },
      this.clock,
    );

    const coordinated = this.engine.buildPlan({
      request: frozen,
      planId: `splan:${++this.sequence}`,
      createdAt: this.clock(),
    });
    if (!coordinated.success || !coordinated.plan) {
      this.session.updateState(
        {
          status: CoachSupervisorExecutionStatuses.FAILED,
          errorMessage: coordinated.message,
        },
        this.clock,
      );
      events.push(
        this.event(
          CoachSupervisorEventTypes.FAILED,
          frozen.id,
          null,
          coordinated.message,
          this.clock(),
        ),
      );
      return this.failResult({
        operation: CoachSupervisorOperationKinds.PROCESS,
        request: frozen,
        startedAt,
        message: coordinated.message ?? "Coordination failed.",
        events,
      });
    }

    const plan = coordinated.plan;
    events.push(
      this.event(
        CoachSupervisorEventTypes.ROUTING_BUILT,
        frozen.id,
        plan.id,
        "routing_built",
        this.clock(),
      ),
      this.event(
        CoachSupervisorEventTypes.PLAN_BUILT,
        frozen.id,
        plan.id,
        "plan_built",
        this.clock(),
      ),
    );

    this.session.updateState(
      {
        planId: plan.id,
        status: CoachSupervisorExecutionStatuses.EXECUTING,
      },
      this.clock,
    );
    events.push(
      this.event(
        CoachSupervisorEventTypes.EXECUTION_STARTED,
        frozen.id,
        plan.id,
        "execution_started",
        this.clock(),
      ),
    );

    const executed = this.engine.getExecutionCoordinator().coordinate({
      plan: plan.coordination,
      clock: this.clock,
    });

    const execution: CoachSupervisorExecution = freezeExecution({
      id: `exec:${this.sequence}`,
      requestId: frozen.id,
      planId: plan.id,
      status: executed.success
        ? CoachSupervisorExecutionStatuses.AGGREGATING
        : CoachSupervisorExecutionStatuses.FAILED,
      agentSummaries: Object.freeze([...executed.summaries]),
      metadata: EMPTY_SUPERVISOR_METADATA,
      startedAt,
      completedAt: this.clock(),
      frozenAt: this.clock(),
    });

    for (const summary of executed.summaries) {
      events.push(
        this.event(
          CoachSupervisorEventTypes.AGENT_COMPLETED,
          frozen.id,
          plan.id,
          summary.agentId,
          this.clock(),
        ),
      );
    }

    this.session.updateState(
      { status: CoachSupervisorExecutionStatuses.AGGREGATING },
      this.clock,
    );

    const aggContext = buildAggregationContext({
      id: `actx:${this.sequence}`,
      plan: plan.coordination,
      summaries: executed.summaries,
      createdAt: this.clock(),
    });
    const explanations = this.explanationAggregator.aggregate(executed.summaries);
    const conflicts = this.conflictResolver.resolve(executed.summaries);
    const aggregation = buildAggregationResult({
      id: `agg:${this.sequence}`,
      context: aggContext,
      explanations,
      conflicts,
      createdAt: this.clock(),
    });
    events.push(
      this.event(
        CoachSupervisorEventTypes.AGGREGATED,
        frozen.id,
        plan.id,
        "aggregated",
        this.clock(),
      ),
    );

    const response = this.responseAggregator.aggregate({
      id: `uresp:${this.sequence}`,
      request: frozen,
      aggregation,
      createdAt: this.clock(),
    });
    events.push(
      this.event(
        CoachSupervisorEventTypes.RESPONSE_BUILT,
        frozen.id,
        plan.id,
        "response_built",
        this.clock(),
      ),
    );

    const context = buildSupervisorContext({
      id: `sctx:${this.sequence}`,
      request: frozen,
      routingRequestId: plan.coordination.context.routingPlanId
        ? `rreq:${frozen.id}`
        : null,
      collaborationRequestId: executed.collaborationRequestId,
      selectedAgentIds: plan.coordination.orderedAgentIds,
      selectedCapabilityIds: plan.coordination.orderedCapabilityIds,
      createdAt: startedAt,
    });

    const summary = buildSupervisorSummary({
      id: `sum:${this.sequence}`,
      requestId: frozen.id,
      plan,
      summaries: executed.summaries,
      createdAt: this.clock(),
    });

    const snapshot = buildSupervisorSnapshot({
      id: `snap:${this.sequence}`,
      request: frozen,
      context,
      plan,
      execution,
      aggregation,
      response,
      summary,
      createdAt: this.clock(),
    });

    const planValidation = validateSupervisorPlan(plan);
    const responseValidation = validateResponseConsistency(response);
    const issues = [
      ...planValidation.issues,
      ...responseValidation.issues,
    ];
    const validation = Object.freeze({
      valid: issues.length === 0,
      issues: Object.freeze(issues),
    });

    const completedAt = this.clock();
    const success =
      executed.success &&
      aggregation.success &&
      validation.valid;

    this.session.updateState(
      {
        status: success
          ? CoachSupervisorExecutionStatuses.COMPLETED
          : CoachSupervisorExecutionStatuses.FAILED,
        errorMessage: success ? null : "Supervisor process completed with issues.",
      },
      this.clock,
    );
    events.push(
      this.event(
        success
          ? CoachSupervisorEventTypes.COMPLETED
          : CoachSupervisorEventTypes.FAILED,
        frozen.id,
        plan.id,
        success ? "completed" : "failed",
        completedAt,
      ),
    );

    return buildSupervisorResult({
      id: `result:process:${this.sequence}`,
      operation: CoachSupervisorOperationKinds.PROCESS,
      success,
      message: success
        ? "Coach supervisor completed."
        : "Coach supervisor completed with issues.",
      request: frozen,
      context,
      plan,
      execution,
      aggregation,
      response,
      summary,
      snapshot,
      validation,
      error: success
        ? null
        : createSupervisorError({
            code: validation.issues[0]?.code ?? "process_failed",
            message:
              validation.issues[0]?.message ??
              "Coach supervisor completed with issues.",
            path: validation.issues[0]?.path ?? null,
          }),
      events: Object.freeze(events),
      startedAt,
      completedAt,
    });
  }

  private event(
    type: CoachSupervisorEvent["type"],
    requestId: string,
    planId: string | null,
    message: string | null,
    occurredAt: string,
  ): CoachSupervisorEvent {
    return freezeEvent({
      id: `event:${++this.sequence}:${type}`,
      type,
      requestId,
      planId,
      message,
      metadata: EMPTY_SUPERVISOR_METADATA,
      occurredAt,
    });
  }

  private failResult(input: {
    readonly operation: CoachSupervisorResult["operation"];
    readonly request: CoachSupervisorRequest;
    readonly validation?: CoachSupervisorResult["validation"];
    readonly startedAt: string;
    readonly completedAt?: string;
    readonly message: string;
    readonly events?: readonly CoachSupervisorEvent[];
  }): CoachSupervisorResult {
    const completedAt = input.completedAt ?? this.clock();
    const validation = input.validation ??
      Object.freeze({
        valid: false,
        issues: Object.freeze([
          {
            code: "failed",
            message: input.message,
            path: null,
          },
        ]),
      });
    return buildSupervisorResult({
      id: `result:fail:${++this.sequence}`,
      operation: input.operation,
      success: false,
      message: input.message,
      request: input.request,
      validation,
      error: createSupervisorError({
        code: validation.issues[0]?.code ?? "failed",
        message: input.message,
        path: validation.issues[0]?.path ?? null,
      }),
      events: Object.freeze([
        ...(input.events ?? []),
        this.event(
          CoachSupervisorEventTypes.FAILED,
          input.request.id,
          null,
          input.message,
          completedAt,
        ),
      ]),
      startedAt: input.startedAt,
      completedAt,
    });
  }
}

export function createCoachCoordinator(
  deps: CoachCoordinatorDeps,
): CoachCoordinator {
  return new CoachCoordinator(deps);
}
