import { buildRoutingContext } from "../builders/RoutingContextBuilder";
import type { CapabilityRegistryPort } from "../contracts/CapabilityRegistryPort";
import type { RoutingContext } from "../models/RoutingContext";
import type { RoutingPlan } from "../models/RoutingPlan";
import type { RoutingRequest } from "../models/RoutingRequest";
import { RoutingStates } from "../models/RoutingState";
import {
  RoutingValidationCodes,
  type RoutingValidation,
} from "../models/RoutingValidation";
import {
  createRoutingPlanner,
  type RoutingPlanner,
} from "../planner/RoutingPlanner";
import {
  createRoutingResolver,
  type RoutingResolver,
} from "../resolver/RoutingResolver";
import { createCapabilitySelector } from "../selectors/CapabilitySelector";
import { createDependencySelector } from "../selectors/DependencySelector";
import { validateRoutingRequest } from "../validators/validateRoutingRequest";
import {
  createRoutingSession,
  updateRoutingSession,
  type RoutingSession,
} from "./RoutingSession";

export interface RoutingCoordinatorDeps {
  readonly registry: CapabilityRegistryPort;
  readonly resolver?: RoutingResolver;
  readonly planner?: RoutingPlanner;
  readonly clock?: () => string;
}

export interface CoordinatedRouting {
  readonly session: RoutingSession;
  readonly context: RoutingContext | null;
  readonly plan: RoutingPlan | null;
  readonly validation: RoutingValidation;
  readonly success: boolean;
}

/**
 * Coordinates resolve → plan flow. Never executes agents.
 */
export class RoutingCoordinator {
  private readonly registry: CapabilityRegistryPort;
  private readonly resolver: RoutingResolver;
  private readonly planner: RoutingPlanner;
  private readonly clock: () => string;
  private readonly capabilitySelector = createCapabilitySelector();
  private readonly dependencySelector = createDependencySelector();
  private sessionSequence = 0;

  constructor(deps: RoutingCoordinatorDeps) {
    this.registry = deps.registry;
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.resolver =
      deps.resolver ??
      createRoutingResolver({ registry: this.registry, clock: this.clock });
    this.planner = deps.planner ?? createRoutingPlanner();
  }

  coordinate(request: RoutingRequest): CoordinatedRouting {
    const now = this.clock();
    this.sessionSequence += 1;
    let session = createRoutingSession({
      id: `session:routing:${this.sessionSequence}`,
      createdAt: now,
    });

    session = updateRoutingSession(session, {
      request,
      state: RoutingStates.RECEIVING,
      updatedAt: now,
    });

    const requestValidation = validateRoutingRequest(request);
    if (!requestValidation.valid) {
      session = updateRoutingSession(session, {
        state: RoutingStates.FAILED,
        updatedAt: this.clock(),
      });
      return Object.freeze({
        session,
        context: null,
        plan: null,
        validation: requestValidation,
        success: false,
      });
    }

    session = updateRoutingSession(session, {
      state: RoutingStates.RESOLVING,
      updatedAt: this.clock(),
    });

    const capabilities = this.capabilitySelector.select(request);
    const dependencies = this.dependencySelector.select({
      request,
      capabilities,
    });
    const resolution = this.resolver.resolve({ capabilities, dependencies });

    const context = buildRoutingContext({
      id: `context:${session.id}`,
      request,
      registryId: resolution.registryId,
      capabilityIds: capabilities.map((c) => c.capabilityId),
      candidateAgentIds: resolution.candidateAgentIds,
      metadata: request.metadata,
      createdAt: resolution.resolvedAt,
    });

    session = updateRoutingSession(session, {
      context,
      state: RoutingStates.PLANNING,
      updatedAt: this.clock(),
    });

    const requiredUnresolved = resolution.resolved.filter(
      (item) => item.capability.required && !item.resolved,
    );
    if (requiredUnresolved.length > 0) {
      session = updateRoutingSession(session, {
        state: RoutingStates.FAILED,
        updatedAt: this.clock(),
      });
      return Object.freeze({
        session,
        context,
        plan: null,
        validation: Object.freeze({
          valid: false,
          issues: Object.freeze(
            requiredUnresolved.map((item) =>
              Object.freeze({
                code: RoutingValidationCodes.UNRESOLVED_CAPABILITY,
                message: `Required capability unresolved: ${item.capability.capabilityId}`,
                path: "capabilities",
              }),
            ),
          ),
        }),
        success: false,
      });
    }

    const plan = this.planner.plan({
      request,
      resolution,
      sessionId: session.id,
      clock: this.clock,
    });

    session = updateRoutingSession(session, {
      plan,
      state: RoutingStates.COMPLETED,
      updatedAt: this.clock(),
    });

    return Object.freeze({
      session,
      context,
      plan,
      validation: Object.freeze({ valid: true, issues: Object.freeze([]) }),
      success: true,
    });
  }
}

export function createRoutingCoordinator(
  deps: RoutingCoordinatorDeps,
): RoutingCoordinator {
  return new RoutingCoordinator(deps);
}
