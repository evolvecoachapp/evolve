import type { AgentExecutionSummary } from "../models/AgentExecutionSummary";
import type { CoachSupervisor } from "../models/CoachSupervisor";
import type { CoachSupervisorPlan } from "../models/CoachSupervisorPlan";
import type { CoachSupervisorRequest } from "../models/CoachSupervisorRequest";
import type { CoachSupervisorResult } from "../models/CoachSupervisorResult";
import type { CoachSupervisorValidation } from "../models/CoachSupervisorValidation";
import {
  createCoachSupervisorService,
  type CoachSupervisorService,
  type CoachSupervisorServiceDeps,
} from "../services/CoachSupervisorService";

function resolveService(
  service?: CoachSupervisorService,
  deps?: CoachSupervisorServiceDeps,
): CoachSupervisorService {
  return service ?? createCoachSupervisorService(deps);
}

/**
 * Public API — process a coach request through Coach Supervisor.
 */
export function processCoachRequest(options: {
  readonly request: CoachSupervisorRequest;
  readonly service?: CoachSupervisorService;
  readonly routingPort?: CoachSupervisorServiceDeps["routingPort"];
  readonly collaborationPort?: CoachSupervisorServiceDeps["collaborationPort"];
  readonly clock?: CoachSupervisorServiceDeps["clock"];
}): CoachSupervisorResult {
  const { request, service, routingPort, collaborationPort, clock } = options;
  return resolveService(
    service,
    routingPort || collaborationPort || clock
      ? { routingPort, collaborationPort, clock }
      : undefined,
  ).processCoachRequest(request);
}

/**
 * Public API — build an immutable coordination plan.
 */
export function buildCoordinationPlan(options: {
  readonly request: CoachSupervisorRequest;
  readonly service?: CoachSupervisorService;
  readonly routingPort?: CoachSupervisorServiceDeps["routingPort"];
  readonly clock?: CoachSupervisorServiceDeps["clock"];
}): CoachSupervisorResult {
  const { request, service, routingPort, clock } = options;
  return resolveService(
    service,
    routingPort || clock ? { routingPort, clock } : undefined,
  ).buildCoordinationPlan(request);
}

/**
 * Public API — aggregate specialist execution summaries.
 */
export function aggregateResults(options: {
  readonly plan: CoachSupervisorPlan;
  readonly summaries: readonly AgentExecutionSummary[];
  readonly service?: CoachSupervisorService;
}): CoachSupervisorResult {
  const { plan, summaries, service } = options;
  return resolveService(service).aggregateResults({ plan, summaries });
}

/**
 * Public API — describe Coach Supervisor capabilities.
 */
export function describeSupervisorCapabilities(options: {
  readonly service?: CoachSupervisorService;
  readonly clock?: CoachSupervisorServiceDeps["clock"];
} = {}): CoachSupervisor {
  const resolved = resolveService(
    options.service,
    options.clock ? { clock: options.clock } : undefined,
  );
  return resolved.describeCapabilities();
}

/**
 * Public API — validate a supervisor plan.
 */
export function validateSupervisorPlan(options: {
  readonly plan: CoachSupervisorPlan;
  readonly service?: CoachSupervisorService;
}): CoachSupervisorValidation {
  return resolveService(options.service).validateSupervisorPlan(options.plan);
}

export type { CoachSupervisorServiceDeps };
