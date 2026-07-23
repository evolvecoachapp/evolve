import type { CollaborationPlan } from "../models/CollaborationPlan";
import type { CollaborationRequest } from "../models/CollaborationRequest";
import type { CollaborationResult } from "../models/CollaborationResult";
import type { ExecutionResult } from "../models/ExecutionResult";
import {
  createAgentCollaborationService,
  type AgentCollaborationService,
  type AgentCollaborationServiceDeps,
} from "../services/AgentCollaborationService";

function resolveService(
  service?: AgentCollaborationService,
  deps?: AgentCollaborationServiceDeps,
): AgentCollaborationService {
  return service ?? createAgentCollaborationService(deps);
}

/**
 * Public API — create an executable collaboration plan from a Coach request.
 */
export function createCollaborationPlan(options: {
  readonly request: CollaborationRequest;
  readonly service?: AgentCollaborationService;
  readonly clock?: AgentCollaborationServiceDeps["clock"];
  readonly collaborationId?: string;
}): CollaborationResult {
  const { request, service, clock, collaborationId } = options;
  return resolveService(
    service,
    clock || collaborationId ? { clock, collaborationId } : undefined,
  ).createCollaborationPlan(request);
}

/**
 * Public API — dispatch planned participants deterministically.
 */
export async function dispatchCollaboration(options: {
  readonly plan?: CollaborationPlan;
  readonly request?: CollaborationRequest;
  readonly service?: AgentCollaborationService;
} = {}): Promise<CollaborationResult> {
  const { service, plan, request } = options;
  return resolveService(service).dispatchCollaboration({ plan, request });
}

/**
 * Public API — execute full collaboration lifecycle (plan → dispatch → aggregate).
 */
export async function executeCollaboration(options: {
  readonly request: CollaborationRequest;
  readonly service?: AgentCollaborationService;
  readonly clock?: AgentCollaborationServiceDeps["clock"];
  readonly nowMs?: AgentCollaborationServiceDeps["nowMs"];
  readonly collaborationId?: string;
}): Promise<CollaborationResult> {
  const { request, service, clock, nowMs, collaborationId } = options;
  return resolveService(
    service,
    clock || nowMs || collaborationId
      ? { clock, nowMs, collaborationId }
      : undefined,
  ).executeCollaboration(request);
}

/**
 * Public API — deterministically aggregate specialist execution results.
 */
export function aggregateResults(options: {
  readonly plan?: CollaborationPlan;
  readonly results?: readonly ExecutionResult[];
  readonly service?: AgentCollaborationService;
} = {}): CollaborationResult {
  const { service, ...rest } = options;
  return resolveService(service).aggregateResults(rest);
}

/**
 * Public API — build an immutable collaboration snapshot.
 */
export function buildCollaborationSnapshot(options: {
  readonly service?: AgentCollaborationService;
  readonly snapshotId?: string;
} = {}): CollaborationResult {
  const { service, snapshotId } = options;
  return resolveService(service).buildCollaborationSnapshot({ snapshotId });
}

export type { AgentCollaborationServiceDeps };
