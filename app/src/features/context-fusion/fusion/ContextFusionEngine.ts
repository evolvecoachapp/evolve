import { buildContextDescriptor } from "../builders/UnifiedContextBuilder";
import type { ContextDescriptor } from "../models/ContextDescriptor";
import type { ContextRequest } from "../models/ContextRequest";
import type { ContextResult } from "../models/ContextResult";
import {
  createContextFusionCoordinator,
  type ContextFusionCoordinator,
  type ContextFusionCoordinatorDeps,
} from "./ContextFusionCoordinator";

export type ContextFusionEngineDeps = ContextFusionCoordinatorDeps;

/**
 * Context Fusion Engine — immutable context fusion only.
 */
export class ContextFusionEngine {
  private readonly coordinator: ContextFusionCoordinator;
  private readonly clock: () => string;
  private readonly runtimeId: string;

  constructor(deps: ContextFusionEngineDeps = {}) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.runtimeId = deps.runtimeId ?? "runtime:context-fusion";
    this.coordinator = createContextFusionCoordinator({
      ...deps,
      clock: this.clock,
      runtimeId: this.runtimeId,
    });
  }

  describe(): ContextDescriptor {
    return buildContextDescriptor({
      id: this.runtimeId,
      createdAt: this.clock(),
    });
  }

  buildUnifiedContext(request: ContextRequest): ContextResult {
    return this.coordinator.build(request);
  }

  mergeContexts(request: ContextRequest): ContextResult {
    return this.coordinator.merge(request);
  }

  validateUnifiedContext(request: ContextRequest): ContextResult {
    return this.coordinator.validate(request);
  }

  describeContext(): ContextResult {
    return this.coordinator.describe();
  }

  createContextSnapshot(request: ContextRequest): ContextResult {
    return this.coordinator.snapshot(request);
  }

  getCoordinator(): ContextFusionCoordinator {
    return this.coordinator;
  }
}

export function createContextFusionEngine(
  deps: ContextFusionEngineDeps = {},
): ContextFusionEngine {
  return new ContextFusionEngine(deps);
}
