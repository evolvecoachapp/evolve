import type { ContextDescriptor } from "../models/ContextDescriptor";
import type { ContextRequest } from "../models/ContextRequest";
import type { ContextResult } from "../models/ContextResult";
import {
  createContextFusionEngine,
  type ContextFusionEngine,
  type ContextFusionEngineDeps,
} from "../fusion/ContextFusionEngine";

export type ContextFusionServiceDeps = ContextFusionEngineDeps;

/**
 * Context Fusion Service — fusion orchestration facade.
 *
 * Upstream runtimes/agents → Context Fusion Engine → Decision Engine Context
 *
 * No networking. No persistence. No provider SDKs. No AI. No calculations.
 */
export class ContextFusionService {
  private readonly engine: ContextFusionEngine;

  constructor(deps: ContextFusionServiceDeps = {}) {
    this.engine = createContextFusionEngine(deps);
  }

  buildUnifiedContext(request: ContextRequest): ContextResult {
    return this.engine.buildUnifiedContext(request);
  }

  mergeContexts(request: ContextRequest): ContextResult {
    return this.engine.mergeContexts(request);
  }

  validateUnifiedContext(request: ContextRequest): ContextResult {
    return this.engine.validateUnifiedContext(request);
  }

  describeContext(): ContextDescriptor {
    return this.engine.describe();
  }

  createContextSnapshot(request: ContextRequest): ContextResult {
    return this.engine.createContextSnapshot(request);
  }
}

export function createContextFusionService(
  deps: ContextFusionServiceDeps = {},
): ContextFusionService {
  return new ContextFusionService(deps);
}
