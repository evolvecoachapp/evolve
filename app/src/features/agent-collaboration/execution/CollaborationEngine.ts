import { buildAggregationContext } from "../builders/AggregationContextBuilder";
import { buildCollaborationResult } from "../builders/CollaborationResultBuilder";
import { buildCollaborationSnapshotFromInput } from "../builders/CollaborationSnapshotBuilder";
import {
  createResultAggregator,
  type ResultAggregator,
} from "../aggregation/ResultAggregator";
import {
  createCollaborationDispatcher,
  type CollaborationDispatcherDeps,
} from "../dispatch/CollaborationDispatcher";
import type { AggregationResult } from "../models/AggregationResult";
import type { CollaborationEvent } from "../models/CollaborationEvent";
import { CollaborationEventTypes } from "../models/CollaborationEvent";
import { EMPTY_COLLABORATION_METADATA } from "../models/CollaborationMetadata";
import type { CollaborationParticipantHandler } from "../models/CollaborationParticipantHandler";
import type { CollaborationPlan } from "../models/CollaborationPlan";
import type { CollaborationRequest } from "../models/CollaborationRequest";
import type { CollaborationResult } from "../models/CollaborationResult";
import { CollaborationOperationKinds } from "../models/CollaborationResult";
import type { CollaborationSnapshot } from "../models/CollaborationSnapshot";
import { CollaborationStatuses } from "../models/CollaborationStatus";
import { CollaborationValidationCodes } from "../models/CollaborationValidation";
import type { ExecutionResult } from "../models/ExecutionResult";
import {
  createCollaborationPlanner,
  type CollaborationPlanner,
  type CollaborationPlannerDeps,
} from "../planning/CollaborationPlanner";
import { freezeEvent, freezeValidation } from "../utils/FreezeCollaborationState";
import { validateAggregationInputs } from "../validators/validateAggregationInputs";
import { validateCollaborationPlan } from "../validators/validateCollaborationPlan";
import { validateCollaborationRequest } from "../validators/validateCollaborationRequest";

export interface CollaborationEngineDeps
  extends CollaborationPlannerDeps,
    CollaborationDispatcherDeps {
  readonly collaborationId?: string;
  readonly clock?: () => string;
  readonly nowMs?: () => number;
  readonly planner?: CollaborationPlanner;
  readonly aggregator?: ResultAggregator;
  readonly stopOnError?: boolean;
}

/**
 * Collaboration execution lifecycle coordinator.
 *
 * start → plan → dispatch → aggregate → snapshot
 * Orchestration only — no business logic / AI / networking / persistence.
 */
export class CollaborationEngine {
  readonly id: string;

  private readonly clock: () => string;
  private readonly nowMs: () => number;
  private readonly planner: CollaborationPlanner;
  private readonly aggregator: ResultAggregator;
  private readonly stopOnError: boolean;
  private readonly defaultHandler: CollaborationParticipantHandler | undefined;
  private readonly handlerRegistry: Map<string, CollaborationParticipantHandler>;

  private request: CollaborationRequest | null = null;
  private plan: CollaborationPlan | null = null;
  private results: readonly ExecutionResult[] = Object.freeze([]);
  private aggregation: AggregationResult | null = null;
  private events: CollaborationEvent[] = [];
  private eventSequence = 0;
  private resultCounter = 0;

  constructor(deps: CollaborationEngineDeps = {}) {
    this.id = deps.collaborationId ?? "collaboration:default";
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.nowMs = deps.nowMs ?? (() => Date.now());
    this.planner = deps.planner ?? createCollaborationPlanner(deps);
    this.aggregator = deps.aggregator ?? createResultAggregator();
    this.stopOnError = deps.stopOnError ?? true;
    this.defaultHandler = deps.defaultHandler;
    this.handlerRegistry = new Map(deps.handlers ?? []);
  }

  registerHandler(
    agentId: string,
    handler: CollaborationParticipantHandler,
  ): void {
    this.handlerRegistry.set(agentId, handler);
  }

  createPlan(request: CollaborationRequest): CollaborationResult {
    const startedAt = this.clock();
    this.request = request;
    this.appendEvent({
      type: CollaborationEventTypes.REQUEST_RECEIVED,
      message: `Received collaboration request ${request.id}`,
      occurredAt: startedAt,
    });

    const validation = validateCollaborationRequest(request);
    this.appendEvent({
      type: CollaborationEventTypes.VALIDATED,
      message: validation.valid
        ? "Request validated"
        : "Request validation failed",
      occurredAt: this.clock(),
    });

    if (!validation.valid) {
      return this.failResult({
        operation: CollaborationOperationKinds.PLAN,
        validation,
        message: "Collaboration request validation failed.",
        startedAt,
      });
    }

    const plan = this.planner.plan({
      request,
      collaborationId: this.id,
      clock: this.clock,
    });
    const planValidation = validateCollaborationPlan(plan);
    if (!planValidation.valid) {
      return this.failResult({
        operation: CollaborationOperationKinds.PLAN,
        validation: planValidation,
        message: "Collaboration plan validation failed.",
        startedAt,
        plan,
      });
    }

    this.plan = plan;
    this.appendEvent({
      type: CollaborationEventTypes.PLANNED,
      message: `Planned ${plan.participants.length} participant(s)`,
      occurredAt: this.clock(),
    });

    return this.okResult({
      operation: CollaborationOperationKinds.PLAN,
      validation: planValidation,
      message: `Collaboration plan created with ${plan.participants.length} participant(s).`,
      startedAt,
      plan,
      status: CollaborationStatuses.PLANNING,
    });
  }

  async dispatch(input?: {
    readonly plan?: CollaborationPlan;
    readonly request?: CollaborationRequest;
  }): Promise<CollaborationResult> {
    const startedAt = this.clock();
    if (input?.request) {
      this.request = input.request;
    }
    const activePlan = input?.plan ?? this.plan;
    const request = this.request;

    if (!request || !activePlan) {
      return this.failResult({
        operation: CollaborationOperationKinds.DISPATCH,
        validation: freezeValidation({
          valid: false,
          issues: Object.freeze([
            Object.freeze({
              code: CollaborationValidationCodes.PLAN_INTEGRITY,
              message: "Plan and request are required before dispatch.",
              path: "plan",
            }),
          ]),
        }),
        message: "Cannot dispatch without a plan and request.",
        startedAt,
        plan: activePlan,
      });
    }

    const planValidation = validateCollaborationPlan(activePlan);
    if (!planValidation.valid) {
      return this.failResult({
        operation: CollaborationOperationKinds.DISPATCH,
        validation: planValidation,
        message: "Cannot dispatch invalid plan.",
        startedAt,
        plan: activePlan,
      });
    }

    this.plan = activePlan;
    const dispatcher = createCollaborationDispatcher({
      handlers: new Map(this.handlerRegistry),
      defaultHandler: this.defaultHandler,
    });

    const results = await dispatcher.dispatch({
      request,
      plan: activePlan,
      collaborationId: this.id,
      clock: this.clock,
      nowMs: this.nowMs,
      stopOnError: this.stopOnError,
    });

    this.results = results;
    this.appendEvent({
      type: CollaborationEventTypes.DISPATCHED,
      message: `Dispatched ${results.length} task(s)`,
      occurredAt: this.clock(),
    });

    for (const result of results) {
      this.appendEvent({
        type: result.success
          ? CollaborationEventTypes.TASK_COMPLETED
          : CollaborationEventTypes.TASK_FAILED,
        message: result.message,
        participantId: result.participantId,
        taskId: result.taskId,
        occurredAt: result.completedAt,
      });
    }

    const success = results.length > 0 && results.every((r) => r.success);
    return this.okResult({
      operation: CollaborationOperationKinds.DISPATCH,
      validation: planValidation,
      message: success
        ? `Dispatched ${results.length} participant(s).`
        : `Dispatch finished with failures (${results.filter((r) => !r.success).length}).`,
      startedAt,
      plan: activePlan,
      results,
      success,
      status: success
        ? CollaborationStatuses.DISPATCHING
        : CollaborationStatuses.FAILED,
    });
  }

  async execute(request: CollaborationRequest): Promise<CollaborationResult> {
    const startedAt = this.clock();
    const planResult = this.createPlan(request);
    if (!planResult.success || !planResult.plan) {
      return planResult;
    }

    const dispatchResult = await this.dispatch({ plan: planResult.plan });
    if (!dispatchResult.success) {
      return this.okResult({
        operation: CollaborationOperationKinds.EXECUTE,
        validation: dispatchResult.validation,
        message: dispatchResult.message,
        startedAt,
        plan: dispatchResult.plan,
        results: dispatchResult.results,
        success: false,
        status: CollaborationStatuses.FAILED,
      });
    }

    const aggregation = this.aggregator.aggregate({
      collaborationId: this.id,
      plan: planResult.plan,
      results: dispatchResult.results,
      clock: this.clock,
    });
    this.aggregation = aggregation;
    this.appendEvent({
      type: CollaborationEventTypes.AGGREGATED,
      message: aggregation.message,
      occurredAt: this.clock(),
    });

    const snapshot = this.buildSnapshotInternal();
    this.appendEvent({
      type: CollaborationEventTypes.COMPLETED,
      message: "Collaboration execution completed",
      occurredAt: this.clock(),
    });

    return this.okResult({
      operation: CollaborationOperationKinds.EXECUTE,
      validation: planResult.validation,
      message: aggregation.message,
      startedAt,
      plan: planResult.plan,
      results: dispatchResult.results,
      aggregation,
      snapshot,
      success: aggregation.success,
      status: aggregation.success
        ? CollaborationStatuses.COMPLETED
        : CollaborationStatuses.FAILED,
    });
  }

  aggregateResults(input?: {
    readonly plan?: CollaborationPlan;
    readonly results?: readonly ExecutionResult[];
  }): CollaborationResult {
    const startedAt = this.clock();
    const plan = input?.plan ?? this.plan;
    const results = input?.results ?? this.results;

    if (!plan) {
      return this.failResult({
        operation: CollaborationOperationKinds.AGGREGATE,
        validation: freezeValidation({
          valid: false,
          issues: Object.freeze([
            Object.freeze({
              code: CollaborationValidationCodes.AGGREGATION_INVALID,
              message: "Plan is required for aggregation.",
              path: "plan",
            }),
          ]),
        }),
        message: "Cannot aggregate without a plan.",
        startedAt,
        results,
      });
    }

    const context = buildAggregationContext({
      id: `agg-context:${this.id}`,
      collaborationId: this.id,
      plan,
      results,
      createdAt: this.clock(),
    });

    const validation = validateAggregationInputs({ context });
    if (!validation.valid) {
      return this.failResult({
        operation: CollaborationOperationKinds.AGGREGATE,
        validation,
        message: "Aggregation input validation failed.",
        startedAt,
        plan,
        results,
      });
    }

    const aggregation = this.aggregator.aggregateFromContext({
      context,
      clock: this.clock,
    });
    this.aggregation = aggregation;
    this.appendEvent({
      type: CollaborationEventTypes.AGGREGATED,
      message: aggregation.message,
      occurredAt: this.clock(),
    });

    return this.okResult({
      operation: CollaborationOperationKinds.AGGREGATE,
      validation,
      message: aggregation.message,
      startedAt,
      plan,
      results,
      aggregation,
      success: aggregation.success,
      status: CollaborationStatuses.AGGREGATING,
    });
  }

  buildSnapshot(options: { readonly snapshotId?: string } = {}): CollaborationResult {
    const startedAt = this.clock();
    if (!this.request) {
      return this.failResult({
        operation: CollaborationOperationKinds.SNAPSHOT,
        validation: freezeValidation({
          valid: false,
          issues: Object.freeze([
            Object.freeze({
              code: CollaborationValidationCodes.MISSING_FIELD,
              message: "Request is required to build a snapshot.",
              path: "request",
            }),
          ]),
        }),
        message: "Cannot build snapshot without a request.",
        startedAt,
      });
    }

    const snapshot = this.buildSnapshotInternal(options.snapshotId);
    this.appendEvent({
      type: CollaborationEventTypes.SNAPSHOT_BUILT,
      message: `Snapshot ${snapshot.id} built`,
      occurredAt: this.clock(),
    });

    return this.okResult({
      operation: CollaborationOperationKinds.SNAPSHOT,
      validation: freezeValidation({ valid: true, issues: Object.freeze([]) }),
      message: `Collaboration snapshot ${snapshot.id} built.`,
      startedAt,
      plan: this.plan,
      results: this.results,
      aggregation: this.aggregation,
      snapshot,
      status: CollaborationStatuses.COMPLETED,
    });
  }

  getPlan(): CollaborationPlan | null {
    return this.plan;
  }

  getResults(): readonly ExecutionResult[] {
    return this.results;
  }

  getAggregation(): AggregationResult | null {
    return this.aggregation;
  }

  private buildSnapshotInternal(snapshotId?: string): CollaborationSnapshot {
    return buildCollaborationSnapshotFromInput({
      id: snapshotId ?? `snapshot:${this.id}:${++this.resultCounter}`,
      collaborationId: this.id,
      request: this.request!,
      plan: this.plan,
      results: this.results,
      aggregation: this.aggregation,
      status:
        this.aggregation?.success === false
          ? CollaborationStatuses.FAILED
          : this.aggregation
            ? CollaborationStatuses.COMPLETED
            : this.results.length > 0
              ? CollaborationStatuses.DISPATCHING
              : this.plan
                ? CollaborationStatuses.PLANNING
                : CollaborationStatuses.IDLE,
      createdAt: this.clock(),
    });
  }

  private appendEvent(input: {
    readonly type: CollaborationEvent["type"];
    readonly message: string;
    readonly participantId?: string | null;
    readonly taskId?: string | null;
    readonly occurredAt: string;
  }): void {
    this.eventSequence += 1;
    this.events.push(
      freezeEvent({
        id: `event:${this.id}:${this.eventSequence}`,
        type: input.type,
        collaborationId: this.id,
        sequence: this.eventSequence,
        message: input.message,
        participantId: input.participantId ?? null,
        taskId: input.taskId ?? null,
        metadata: EMPTY_COLLABORATION_METADATA,
        occurredAt: input.occurredAt,
      }),
    );
  }

  private nextResultId(operation: string): string {
    this.resultCounter += 1;
    return `collab-result:${this.id}:${operation}:${this.resultCounter}`;
  }

  private okResult(input: {
    readonly operation: CollaborationResult["operation"];
    readonly validation: CollaborationResult["validation"];
    readonly message: string | null;
    readonly startedAt: string;
    readonly plan?: CollaborationPlan | null;
    readonly results?: readonly ExecutionResult[];
    readonly aggregation?: AggregationResult | null;
    readonly snapshot?: CollaborationSnapshot | null;
    readonly success?: boolean;
    readonly status?: CollaborationResult["status"];
  }): CollaborationResult {
    return buildCollaborationResult({
      id: this.nextResultId(input.operation),
      collaborationId: this.id,
      operation: input.operation,
      success: input.success ?? true,
      status: input.status,
      message: input.message,
      plan: input.plan ?? this.plan,
      results: input.results ?? this.results,
      aggregation: input.aggregation ?? this.aggregation,
      snapshot: input.snapshot ?? null,
      validation: input.validation,
      events: Object.freeze([...this.events]),
      startedAt: input.startedAt,
      completedAt: this.clock(),
    });
  }

  private failResult(input: {
    readonly operation: CollaborationResult["operation"];
    readonly validation: CollaborationResult["validation"];
    readonly message: string;
    readonly startedAt: string;
    readonly plan?: CollaborationPlan | null;
    readonly results?: readonly ExecutionResult[];
  }): CollaborationResult {
    this.appendEvent({
      type: CollaborationEventTypes.FAILED,
      message: input.message,
      occurredAt: this.clock(),
    });
    return buildCollaborationResult({
      id: this.nextResultId(input.operation),
      collaborationId: this.id,
      operation: input.operation,
      success: false,
      status: CollaborationStatuses.FAILED,
      message: input.message,
      plan: input.plan ?? this.plan,
      results: input.results ?? this.results,
      aggregation: this.aggregation,
      snapshot: null,
      validation: input.validation,
      events: Object.freeze([...this.events]),
      startedAt: input.startedAt,
      completedAt: this.clock(),
    });
  }
}

export function createCollaborationEngine(
  deps: CollaborationEngineDeps = {},
): CollaborationEngine {
  return new CollaborationEngine(deps);
}
