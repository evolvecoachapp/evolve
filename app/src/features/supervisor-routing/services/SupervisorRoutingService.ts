import { buildRoutingResult } from "../builders/RoutingResultBuilder";
import { buildRoutingSnapshotFromInput } from "../builders/RoutingSnapshotBuilder";
import { buildRoutingSummary } from "../builders/RoutingSummaryBuilder";
import type { CapabilityRegistryPort } from "../contracts/CapabilityRegistryPort";
import { MockCapabilityRegistry } from "../contracts/CapabilityRegistryPort";
import { buildRoutingContext } from "../builders/RoutingContextBuilder";
import { createRoutingError } from "../models/RoutingError";
import { EMPTY_ROUTING_METADATA } from "../models/RoutingMetadata";
import { RoutingEventTypes } from "../models/RoutingEvent";
import type { RoutingPlan } from "../models/RoutingPlan";
import type { RoutingRequest } from "../models/RoutingRequest";
import { RoutingOperationKinds } from "../models/RoutingResult";
import type { RoutingResult } from "../models/RoutingResult";
import { RoutingValidationCodes } from "../models/RoutingValidation";
import { sortIdsDeterministic } from "../utils/sortHelpers";
import {
  createRoutingEngine,
  type RoutingEngine,
} from "../routing/RoutingEngine";
import { formatRoutingDescription } from "../utils/FormattingHelpers";
import { freezeEvent } from "../utils/FreezeRoutingState";
import { validateRoutingPlan as validatePlan } from "../validators/validateRoutingPlan";
import { validateRoutingRequest } from "../validators/validateRoutingRequest";

export interface SupervisorRoutingServiceDeps {
  readonly registry?: CapabilityRegistryPort;
  readonly engine?: RoutingEngine;
  readonly clock?: () => string;
}

/**
 * Supervisor Routing Service — deterministic routing facade.
 *
 * No networking. No persistence. No providers. No AI. No prompts.
 * No agent execution. No collaboration execution. No business logic.
 */
export class SupervisorRoutingService {
  private readonly registry: CapabilityRegistryPort;
  private readonly engine: RoutingEngine;
  private readonly clock: () => string;
  private sequence = 0;

  constructor(deps: SupervisorRoutingServiceDeps = {}) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.registry = deps.registry ?? new MockCapabilityRegistry();
    this.engine =
      deps.engine ??
      createRoutingEngine({ registry: this.registry, clock: this.clock });
  }

  getRegistry(): CapabilityRegistryPort {
    return this.registry;
  }

  getEngine(): RoutingEngine {
    return this.engine;
  }

  buildRoutingPlan(request: RoutingRequest): RoutingResult {
    const startedAt = this.clock();
    const coordinated = this.engine.buildPlan(request);

    if (!coordinated.success || !coordinated.plan || !coordinated.context) {
      const completedAt = this.clock();
      return buildRoutingResult({
        id: `result:build:${++this.sequence}`,
        operation: RoutingOperationKinds.BUILD_PLAN,
        success: false,
        message: coordinated.validation.issues[0]?.message ?? "Routing failed.",
        context: coordinated.context,
        validation: coordinated.validation,
        error: createRoutingError({
          code: coordinated.validation.issues[0]?.code ?? "invalid_request",
          message:
            coordinated.validation.issues[0]?.message ?? "Routing failed.",
          path: coordinated.validation.issues[0]?.path ?? null,
        }),
        events: [
          freezeEvent({
            id: `event:failed:${this.sequence}`,
            type: RoutingEventTypes.FAILED,
            requestId: request.id,
            planId: null,
            message: "build_failed",
            metadata: EMPTY_ROUTING_METADATA,
            occurredAt: completedAt,
          }),
        ],
        startedAt,
        completedAt,
      });
    }

    const planValidation = validatePlan(coordinated.plan);
    const completedAt = this.clock();
    const summary = buildRoutingSummary({
      id: `summary:${coordinated.plan.id}`,
      plan: coordinated.plan,
    });

    return buildRoutingResult({
      id: `result:build:${++this.sequence}`,
      operation: RoutingOperationKinds.BUILD_PLAN,
      success: planValidation.valid,
      message: planValidation.valid
        ? "Routing plan built."
        : "Routing plan built with validation issues.",
      plan: coordinated.plan,
      context: coordinated.context,
      summary,
      validation: planValidation,
      error: planValidation.valid
        ? null
        : createRoutingError({
            code: planValidation.issues[0]!.code,
            message: planValidation.issues[0]!.message,
            path: planValidation.issues[0]!.path,
          }),
      events: [
        freezeEvent({
          id: `event:plan:${coordinated.plan.id}`,
          type: RoutingEventTypes.PLAN_BUILT,
          requestId: request.id,
          planId: coordinated.plan.id,
          message: "plan_built",
          metadata: EMPTY_ROUTING_METADATA,
          occurredAt: completedAt,
        }),
      ],
      startedAt,
      completedAt,
    });
  }

  resolveRouting(request: RoutingRequest): RoutingResult {
    const startedAt = this.clock();
    const requestValidation = validateRoutingRequest(request);
    if (!requestValidation.valid) {
      const completedAt = this.clock();
      return buildRoutingResult({
        id: `result:resolve:${++this.sequence}`,
        operation: RoutingOperationKinds.RESOLVE,
        success: false,
        message: "Routing resolve failed.",
        validation: requestValidation,
        error: createRoutingError({
          code: requestValidation.issues[0]!.code,
          message: requestValidation.issues[0]!.message,
          path: requestValidation.issues[0]!.path,
        }),
        startedAt,
        completedAt,
      });
    }

    const resolution = this.engine.resolve(request);
    const completedAt = this.clock();
    const success = resolution.unresolvedCapabilityIds.length === 0;

    return buildRoutingResult({
      id: `result:resolve:${resolution.id}`,
      operation: RoutingOperationKinds.RESOLVE,
      success,
      message: success
        ? "Capabilities resolved."
        : `Unresolved capabilities: ${resolution.unresolvedCapabilityIds.join(", ")}`,
      validation: Object.freeze({
        valid: success,
        issues: Object.freeze(
          resolution.unresolvedCapabilityIds.map((capabilityId) =>
            Object.freeze({
              code: RoutingValidationCodes.UNRESOLVED_CAPABILITY,
              message: `Unresolved capability: ${capabilityId}`,
              path: "capabilities",
            }),
          ),
        ),
      }),
      events: [
        freezeEvent({
          id: `event:resolved:${resolution.id}`,
          type: RoutingEventTypes.CAPABILITIES_RESOLVED,
          requestId: request.id,
          planId: null,
          message: success ? "resolved" : "partial",
          metadata: EMPTY_ROUTING_METADATA,
          occurredAt: completedAt,
        }),
      ],
      startedAt,
      completedAt,
    });
  }

  validateRoutingPlan(plan: RoutingPlan): RoutingResult {
    const startedAt = this.clock();
    const validation = validatePlan(plan);
    return buildRoutingResult({
      id: `result:validate:${plan.id}`,
      operation: RoutingOperationKinds.VALIDATE,
      success: validation.valid,
      message: validation.valid
        ? "Routing plan is valid."
        : "Routing plan validation failed.",
      plan,
      validation,
      error: validation.valid
        ? null
        : createRoutingError({
            code: validation.issues[0]!.code,
            message: validation.issues[0]!.message,
            path: validation.issues[0]!.path,
          }),
      events: [
        freezeEvent({
          id: `event:validated:${++this.sequence}`,
          type: RoutingEventTypes.PLAN_VALIDATED,
          requestId: plan.requestId,
          planId: plan.id,
          message: validation.valid ? "valid" : "invalid",
          metadata: EMPTY_ROUTING_METADATA,
          occurredAt: startedAt,
        }),
      ],
      startedAt,
      completedAt: startedAt,
    });
  }

  describeRouting(plan: RoutingPlan): RoutingResult {
    const startedAt = this.clock();
    const summary = buildRoutingSummary({
      id: `summary:describe:${plan.id}`,
      plan,
    });
    const description = formatRoutingDescription(plan);

    return buildRoutingResult({
      id: `result:describe:${plan.id}`,
      operation: RoutingOperationKinds.DESCRIBE,
      success: true,
      message: "Routing plan described.",
      plan,
      summary,
      description,
      events: [
        freezeEvent({
          id: `event:described:${++this.sequence}`,
          type: RoutingEventTypes.DESCRIBED,
          requestId: plan.requestId,
          planId: plan.id,
          message: "described",
          metadata: EMPTY_ROUTING_METADATA,
          occurredAt: startedAt,
        }),
      ],
      startedAt,
      completedAt: startedAt,
    });
  }

  buildRoutingSnapshot(input: {
    readonly plan: RoutingPlan;
    readonly request: RoutingRequest;
    readonly snapshotId?: string;
  }): RoutingResult {
    const startedAt = this.clock();
    this.sequence += 1;

    const context = buildRoutingContext({
      id: `context:snapshot:${this.sequence}`,
      request: input.request,
      registryId: this.registry.registryId,
      capabilityIds: input.plan.capabilities.map((c) => c.capabilityId),
      candidateAgentIds: sortIdsDeterministic(
        input.plan.targets.map((t) => t.agentId),
      ),
      metadata: input.request.metadata,
      createdAt: startedAt,
    });

    const plan = input.plan;
    const snapshot = buildRoutingSnapshotFromInput({
      id: input.snapshotId ?? `snapshot:routing:${this.sequence}`,
      plan,
      context,
      createdAt: startedAt,
    });

    return buildRoutingResult({
      id: `result:snapshot:${snapshot.id}`,
      operation: RoutingOperationKinds.SNAPSHOT,
      success: true,
      message: "Routing snapshot built.",
      plan,
      context,
      summary: snapshot.summary,
      snapshot,
      events: [
        freezeEvent({
          id: `event:snapshot:${snapshot.id}`,
          type: RoutingEventTypes.SNAPSHOT_BUILT,
          requestId: input.request.id,
          planId: plan.id,
          message: "snapshot_built",
          metadata: EMPTY_ROUTING_METADATA,
          occurredAt: startedAt,
        }),
      ],
      startedAt,
      completedAt: startedAt,
    });
  }
}

export function createSupervisorRoutingService(
  deps: SupervisorRoutingServiceDeps = {},
): SupervisorRoutingService {
  return new SupervisorRoutingService(deps);
}
