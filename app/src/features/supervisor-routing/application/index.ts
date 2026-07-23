import type { RoutingPlan } from "../models/RoutingPlan";
import type { RoutingRequest } from "../models/RoutingRequest";
import type { RoutingResult } from "../models/RoutingResult";
import {
  createSupervisorRoutingService,
  type SupervisorRoutingService,
  type SupervisorRoutingServiceDeps,
} from "../services/SupervisorRoutingService";

function resolveService(
  service?: SupervisorRoutingService,
  deps?: SupervisorRoutingServiceDeps,
): SupervisorRoutingService {
  return service ?? createSupervisorRoutingService(deps);
}

/**
 * Public API — build an immutable multi-agent routing plan.
 */
export function buildRoutingPlan(options: {
  readonly request: RoutingRequest;
  readonly service?: SupervisorRoutingService;
  readonly registry?: SupervisorRoutingServiceDeps["registry"];
  readonly clock?: SupervisorRoutingServiceDeps["clock"];
}): RoutingResult {
  const { request, service, registry, clock } = options;
  return resolveService(
    service,
    registry || clock ? { registry, clock } : undefined,
  ).buildRoutingPlan(request);
}

/**
 * Public API — resolve required capabilities / candidate agents.
 */
export function resolveRouting(options: {
  readonly request: RoutingRequest;
  readonly service?: SupervisorRoutingService;
  readonly registry?: SupervisorRoutingServiceDeps["registry"];
  readonly clock?: SupervisorRoutingServiceDeps["clock"];
}): RoutingResult {
  const { request, service, registry, clock } = options;
  return resolveService(
    service,
    registry || clock ? { registry, clock } : undefined,
  ).resolveRouting(request);
}

/**
 * Public API — validate a routing plan.
 */
export function validateRoutingPlan(options: {
  readonly plan: RoutingPlan;
  readonly service?: SupervisorRoutingService;
}): RoutingResult {
  const { plan, service } = options;
  return resolveService(service).validateRoutingPlan(plan);
}

/**
 * Public API — describe a routing plan.
 */
export function describeRouting(options: {
  readonly plan: RoutingPlan;
  readonly service?: SupervisorRoutingService;
}): RoutingResult {
  const { plan, service } = options;
  return resolveService(service).describeRouting(plan);
}

/**
 * Public API — build an immutable routing snapshot.
 */
export function buildRoutingSnapshot(options: {
  readonly plan: RoutingPlan;
  readonly request: RoutingRequest;
  readonly snapshotId?: string;
  readonly service?: SupervisorRoutingService;
}): RoutingResult {
  const { plan, request, snapshotId, service } = options;
  return resolveService(service).buildRoutingSnapshot({
    plan,
    request,
    snapshotId,
  });
}

export type { SupervisorRoutingServiceDeps };
