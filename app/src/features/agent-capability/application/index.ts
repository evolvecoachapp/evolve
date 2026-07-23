import type { CapabilityId } from "../models/CapabilityId";
import type { CapabilityResult } from "../models/CapabilityResult";
import {
  createAgentCapabilityService,
  type AgentCapabilityService,
  type AgentCapabilityServiceDeps,
} from "../services/AgentCapabilityService";
import type { CapabilityRegistrationInput } from "../registration/CapabilityRegistrar";

function resolveService(
  service?: AgentCapabilityService,
  deps?: AgentCapabilityServiceDeps,
): AgentCapabilityService {
  return service ?? createAgentCapabilityService(deps);
}

/**
 * Public API — register an immutable capability.
 */
export function registerCapability(options: {
  readonly input: CapabilityRegistrationInput;
  readonly service?: AgentCapabilityService;
  readonly clock?: AgentCapabilityServiceDeps["clock"];
  readonly registryId?: string;
}): CapabilityResult {
  const { input, service, clock, registryId } = options;
  return resolveService(
    service,
    clock || registryId ? { clock, registryId } : undefined,
  ).registerCapability(input);
}

/**
 * Public API — resolve a requested capability deterministically.
 */
export function resolveCapability(options: {
  readonly capabilityId: CapabilityId;
  readonly service?: AgentCapabilityService;
}): CapabilityResult {
  const { capabilityId, service } = options;
  return resolveService(service).resolveCapability(capabilityId);
}

/**
 * Public API — find a single capability by id.
 */
export function findCapability(options: {
  readonly capabilityId: CapabilityId;
  readonly service?: AgentCapabilityService;
}): CapabilityResult {
  const { capabilityId, service } = options;
  return resolveService(service).findCapability(capabilityId);
}

/**
 * Public API — list capabilities (optionally by agent).
 */
export function findCapabilities(options: {
  readonly agentId?: string;
  readonly enabledOnly?: boolean;
  readonly service?: AgentCapabilityService;
} = {}): CapabilityResult {
  const { service, agentId, enabledOnly } = options;
  return resolveService(service).findCapabilities({ agentId, enabledOnly });
}

/**
 * Public API — build an immutable capability registry snapshot.
 */
export function buildCapabilitySnapshot(options: {
  readonly service?: AgentCapabilityService;
  readonly snapshotId?: string;
} = {}): CapabilityResult {
  const { service, snapshotId } = options;
  return resolveService(service).buildCapabilitySnapshot({ snapshotId });
}

/**
 * Public API — validate registry consistency.
 */
export function validateRegistry(options: {
  readonly service?: AgentCapabilityService;
} = {}): CapabilityResult {
  const { service } = options;
  return resolveService(service).validateRegistry();
}

export type { AgentCapabilityServiceDeps, CapabilityRegistrationInput };
