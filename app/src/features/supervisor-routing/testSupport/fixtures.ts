import { WellKnownCapabilityIds } from "../../agent-capability/models/CapabilityId";
import {
  MockCapabilityRegistry,
  type CapabilityOwnerRecord,
} from "../contracts/CapabilityRegistryPort";
import { EMPTY_ROUTING_METADATA } from "../models/RoutingMetadata";
import { RoutingPriorityLevels } from "../models/RoutingPriority";
import type { RoutingCapability } from "../models/RoutingCapability";
import type { RoutingDependency } from "../models/RoutingDependency";
import { RoutingDependencyKinds } from "../models/RoutingDependency";
import type { RoutingRequest } from "../models/RoutingRequest";
import {
  createSupervisorRoutingService,
  type SupervisorRoutingService,
} from "../services/SupervisorRoutingService";
import { freezeCapability, freezeRequest } from "../utils/FreezeRoutingState";

export const FIXED_TIMESTAMP = "2026-07-24T12:00:00.000Z";

export function createFixedClock(ts = FIXED_TIMESTAMP): () => string {
  return () => ts;
}

export function createMockCapabilityRegistry(
  records: readonly CapabilityOwnerRecord[] = defaultCapabilityRecords(),
): MockCapabilityRegistry {
  return new MockCapabilityRegistry("registry:capability:test", records);
}

export function defaultCapabilityRecords(): readonly CapabilityOwnerRecord[] {
  return Object.freeze([
    Object.freeze({
      capabilityId: WellKnownCapabilityIds.GENERATE_WORKOUT,
      agentId: "agent:workout",
      enabled: true,
      name: "Generate Workout",
    }),
    Object.freeze({
      capabilityId: WellKnownCapabilityIds.ANALYZE_NUTRITION,
      agentId: "agent:nutrition",
      enabled: true,
      name: "Analyze Nutrition",
    }),
    Object.freeze({
      capabilityId: WellKnownCapabilityIds.EVALUATE_RECOVERY,
      agentId: "agent:recovery",
      enabled: true,
      name: "Evaluate Recovery",
    }),
  ]);
}

export function createTestRoutingService(
  overrides: {
    readonly registry?: MockCapabilityRegistry;
    readonly clock?: () => string;
  } = {},
): SupervisorRoutingService {
  return createSupervisorRoutingService({
    registry: overrides.registry ?? createMockCapabilityRegistry(),
    clock: overrides.clock ?? createFixedClock(),
  });
}

export function createRoutingCapability(
  overrides: Partial<RoutingCapability> & { readonly capabilityId: string },
): RoutingCapability {
  return freezeCapability({
    id: overrides.id ?? `cap:${overrides.capabilityId}`,
    capabilityId: overrides.capabilityId,
    required: overrides.required ?? true,
    priority: overrides.priority ?? RoutingPriorityLevels.NORMAL,
    dependsOn: Object.freeze([...(overrides.dependsOn ?? [])]),
    metadata: overrides.metadata ?? EMPTY_ROUTING_METADATA,
  });
}

export function createRoutingDependency(input: {
  readonly fromId: string;
  readonly toId: string;
  readonly id?: string;
  readonly required?: boolean;
}): RoutingDependency {
  return Object.freeze({
    id: input.id ?? `dep:${input.fromId}->${input.toId}`,
    kind: RoutingDependencyKinds.CAPABILITY,
    fromId: input.fromId,
    toId: input.toId,
    required: input.required ?? true,
    description: null,
  });
}

export function createRoutingRequest(
  overrides: Partial<RoutingRequest> & {
    readonly requiredCapabilities?: readonly RoutingCapability[];
  } = {},
): RoutingRequest {
  const requiredCapabilities =
    overrides.requiredCapabilities ??
    Object.freeze([
      createRoutingCapability({
        capabilityId: WellKnownCapabilityIds.GENERATE_WORKOUT,
        priority: RoutingPriorityLevels.HIGH,
      }),
      createRoutingCapability({
        capabilityId: WellKnownCapabilityIds.EVALUATE_RECOVERY,
        dependsOn: [WellKnownCapabilityIds.GENERATE_WORKOUT],
        priority: RoutingPriorityLevels.NORMAL,
      }),
    ]);

  return freezeRequest({
    id: overrides.id ?? "request:routing:test",
    coachAgentId: overrides.coachAgentId ?? "agent:coach",
    intent: overrides.intent ?? "Plan workout with recovery check",
    requiredCapabilities,
    dependencies: Object.freeze([...(overrides.dependencies ?? [])]),
    constraints: Object.freeze([...(overrides.constraints ?? [])]),
    athleteId: overrides.athleteId ?? "athlete:1",
    conversationId: overrides.conversationId ?? null,
    sessionId: overrides.sessionId ?? null,
    metadata: overrides.metadata ?? EMPTY_ROUTING_METADATA,
    createdAt: overrides.createdAt ?? FIXED_TIMESTAMP,
  });
}

export { WellKnownCapabilityIds };
