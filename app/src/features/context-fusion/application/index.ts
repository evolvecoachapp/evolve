import type { ContextDescriptor } from "../models/ContextDescriptor";
import type { ContextRequest } from "../models/ContextRequest";
import type { ContextResult } from "../models/ContextResult";
import {
  createContextFusionService,
  type ContextFusionService,
  type ContextFusionServiceDeps,
} from "../services/ContextFusionService";

function resolveService(
  service?: ContextFusionService,
  deps?: ContextFusionServiceDeps,
): ContextFusionService {
  return service ?? createContextFusionService(deps);
}

/**
 * Public API — build immutable unified coaching context.
 */
export function buildUnifiedContext(options: {
  readonly request: ContextRequest;
  readonly service?: ContextFusionService;
  readonly deps?: ContextFusionServiceDeps;
}): ContextResult {
  return resolveService(options.service, options.deps).buildUnifiedContext(
    options.request,
  );
}

/**
 * Public API — merge additional contributions into fused context.
 */
export function mergeContexts(options: {
  readonly request: ContextRequest;
  readonly service?: ContextFusionService;
  readonly deps?: ContextFusionServiceDeps;
}): ContextResult {
  return resolveService(options.service, options.deps).mergeContexts(
    options.request,
  );
}

/**
 * Public API — validate unified coaching context.
 */
export function validateUnifiedContext(options: {
  readonly request: ContextRequest;
  readonly service?: ContextFusionService;
  readonly deps?: ContextFusionServiceDeps;
}): ContextResult {
  return resolveService(options.service, options.deps).validateUnifiedContext(
    options.request,
  );
}

/**
 * Public API — describe Context Fusion Engine capabilities.
 */
export function describeContext(options: {
  readonly service?: ContextFusionService;
  readonly deps?: ContextFusionServiceDeps;
} = {}): ContextDescriptor {
  return resolveService(options.service, options.deps).describeContext();
}

/**
 * Public API — create an immutable context snapshot.
 */
export function createContextSnapshot(options: {
  readonly request: ContextRequest;
  readonly service?: ContextFusionService;
  readonly deps?: ContextFusionServiceDeps;
}): ContextResult {
  return resolveService(options.service, options.deps).createContextSnapshot(
    options.request,
  );
}

export type { ContextFusionServiceDeps };
