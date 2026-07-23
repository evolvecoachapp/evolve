import type { CapabilityRegistryPort } from "../contracts/CapabilityRegistryPort";
import type { RoutingPlan } from "../models/RoutingPlan";
import type { RoutingRequest } from "../models/RoutingRequest";
import type { RoutingResolution } from "../resolver/RoutingResolver";
import {
  createRoutingCoordinator,
  type CoordinatedRouting,
  type RoutingCoordinator,
} from "./RoutingCoordinator";
import {
  createRoutingResolver,
  type RoutingResolver,
} from "../resolver/RoutingResolver";
import { createCapabilitySelector } from "../selectors/CapabilitySelector";
import { createDependencySelector } from "../selectors/DependencySelector";

export interface RoutingEngineDeps {
  readonly registry: CapabilityRegistryPort;
  readonly coordinator?: RoutingCoordinator;
  readonly resolver?: RoutingResolver;
  readonly clock?: () => string;
}

/**
 * Supervisor Routing Engine — transforms a request into an immutable routing plan.
 *
 * Never executes agents.
 * Never calls AI providers.
 * Never performs business logic or collaboration.
 */
export class RoutingEngine {
  private readonly registry: CapabilityRegistryPort;
  private readonly coordinator: RoutingCoordinator;
  private readonly resolver: RoutingResolver;
  private readonly clock: () => string;
  private readonly capabilitySelector = createCapabilitySelector();
  private readonly dependencySelector = createDependencySelector();

  constructor(deps: RoutingEngineDeps) {
    this.registry = deps.registry;
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.resolver =
      deps.resolver ??
      createRoutingResolver({ registry: this.registry, clock: this.clock });
    this.coordinator =
      deps.coordinator ??
      createRoutingCoordinator({
        registry: this.registry,
        resolver: this.resolver,
        clock: this.clock,
      });
  }

  buildPlan(request: RoutingRequest): CoordinatedRouting {
    return this.coordinator.coordinate(request);
  }

  resolve(request: RoutingRequest): RoutingResolution {
    const capabilities = this.capabilitySelector.select(request);
    const dependencies = this.dependencySelector.select({
      request,
      capabilities,
    });
    return this.resolver.resolve({ capabilities, dependencies });
  }

  getLastPlan(coordinated: CoordinatedRouting): RoutingPlan | null {
    return coordinated.plan;
  }
}

export function createRoutingEngine(deps: RoutingEngineDeps): RoutingEngine {
  return new RoutingEngine(deps);
}
