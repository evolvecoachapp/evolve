import type { AgentCapability } from "../models/AgentCapability";
import type { CapabilityCollection } from "../models/CapabilityCollection";
import type { CapabilityDescriptor } from "../models/CapabilityDescriptor";
import type { CapabilityError } from "../models/CapabilityError";
import type { CapabilityEvent } from "../models/CapabilityEvent";
import type { CapabilityMatch } from "../models/CapabilityMatch";
import type { CapabilityMetadata } from "../models/CapabilityMetadata";
import type { CapabilityQuery } from "../models/CapabilityQuery";
import type { CapabilityRegistration } from "../models/CapabilityRegistration";
import type { CapabilityRegistry } from "../models/CapabilityRegistry";
import type { CapabilityResolution } from "../models/CapabilityResolution";
import type { CapabilityResult } from "../models/CapabilityResult";
import type { CapabilitySnapshot } from "../models/CapabilitySnapshot";
import type {
  CapabilityValidation,
  CapabilityValidationIssue,
} from "../models/CapabilityValidation";
import type { CapabilityPolicy } from "../models/CapabilityPolicy";

export function freezeMetadata(
  metadata: CapabilityMetadata,
): CapabilityMetadata {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezeValidationIssue(
  issue: CapabilityValidationIssue,
): CapabilityValidationIssue {
  return Object.freeze({ ...issue });
}

export function freezeValidation(
  validation: CapabilityValidation,
): CapabilityValidation {
  return Object.freeze({
    valid: validation.valid,
    issues: Object.freeze(validation.issues.map(freezeValidationIssue)),
  });
}

export function freezeError(
  error: CapabilityError | null,
): CapabilityError | null {
  return error ? Object.freeze({ ...error }) : null;
}

export function freezeDescriptor(
  descriptor: CapabilityDescriptor,
): CapabilityDescriptor {
  return Object.freeze({
    ...descriptor,
    supportedOperations: Object.freeze([...descriptor.supportedOperations]),
    metadata: freezeMetadata(descriptor.metadata),
  });
}

export function freezeRegistration(
  registration: CapabilityRegistration,
): CapabilityRegistration {
  return Object.freeze({
    ...registration,
    descriptor: freezeDescriptor(registration.descriptor),
    supportedOperations: Object.freeze([...registration.supportedOperations]),
    metadata: freezeMetadata(registration.metadata),
  });
}

export function freezeAgentCapability(
  capability: AgentCapability,
): AgentCapability {
  return Object.freeze({
    ...capability,
    descriptor: freezeDescriptor(capability.descriptor),
    metadata: freezeMetadata(capability.metadata),
  });
}

export function freezeMatch(match: CapabilityMatch): CapabilityMatch {
  return Object.freeze({
    ...match,
    registration: freezeRegistration(match.registration),
  });
}

export function freezeResolution(
  resolution: CapabilityResolution,
): CapabilityResolution {
  return Object.freeze({
    ...resolution,
    matches: Object.freeze(resolution.matches.map(freezeMatch)),
    validation: freezeValidation(resolution.validation),
    metadata: freezeMetadata(resolution.metadata),
  });
}

export function freezeRegistry(
  registry: CapabilityRegistry,
): CapabilityRegistry {
  return Object.freeze({
    ...registry,
    registrations: Object.freeze(
      registry.registrations.map(freezeRegistration),
    ),
    metadata: freezeMetadata(registry.metadata),
  });
}

export function freezeSnapshot(
  snapshot: CapabilitySnapshot,
): CapabilitySnapshot {
  return Object.freeze({
    ...snapshot,
    registry: freezeRegistry(snapshot.registry),
    registrations: Object.freeze(
      snapshot.registrations.map(freezeRegistration),
    ),
    capabilityIds: Object.freeze([...snapshot.capabilityIds]),
    agentIds: Object.freeze([...snapshot.agentIds]),
    metadata: freezeMetadata(snapshot.metadata),
  });
}

export function freezeQuery(query: CapabilityQuery): CapabilityQuery {
  return Object.freeze({
    ...query,
    metadata: freezeMetadata(query.metadata),
  });
}

export function freezeCollection(
  collection: CapabilityCollection,
): CapabilityCollection {
  return Object.freeze({
    ...collection,
    capabilities: Object.freeze(
      collection.capabilities.map(freezeAgentCapability),
    ),
    registrations: Object.freeze(
      collection.registrations.map(freezeRegistration),
    ),
    metadata: freezeMetadata(collection.metadata),
  });
}

export function freezeEvent(event: CapabilityEvent): CapabilityEvent {
  return Object.freeze({
    ...event,
    metadata: freezeMetadata(event.metadata),
  });
}

export function freezePolicy(policy: CapabilityPolicy): CapabilityPolicy {
  return Object.freeze({ ...policy });
}

export function freezeResult(result: CapabilityResult): CapabilityResult {
  return Object.freeze({
    ...result,
    registration: result.registration
      ? freezeRegistration(result.registration)
      : null,
    resolution: result.resolution
      ? freezeResolution(result.resolution)
      : null,
    collection: result.collection
      ? freezeCollection(result.collection)
      : null,
    snapshot: result.snapshot ? freezeSnapshot(result.snapshot) : null,
    validation: freezeValidation(result.validation),
    error: freezeError(result.error),
    events: Object.freeze(result.events.map(freezeEvent)),
    metadata: freezeMetadata(result.metadata),
  });
}

export const FreezeCapabilityState = Object.freeze({
  freezeMetadata,
  freezeValidation,
  freezeError,
  freezeDescriptor,
  freezeRegistration,
  freezeAgentCapability,
  freezeMatch,
  freezeResolution,
  freezeRegistry,
  freezeSnapshot,
  freezeQuery,
  freezeCollection,
  freezeEvent,
  freezePolicy,
  freezeResult,
});
