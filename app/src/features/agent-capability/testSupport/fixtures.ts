import { buildCapabilityRegistration } from "../builders/CapabilityRegistrationBuilder";
import { WellKnownCapabilityIds } from "../models/CapabilityId";
import {
  createAgentCapabilityService,
  type AgentCapabilityService,
} from "../services/AgentCapabilityService";
import type { CapabilityRegistrationInput } from "../registration/CapabilityRegistrar";

export const FIXED_TIMESTAMP = "2026-07-24T12:00:00.000Z";
export const FIXED_TIMESTAMP_LATER = "2026-07-24T12:00:01.000Z";

export function createFixedClock(ts = FIXED_TIMESTAMP): () => string {
  return () => ts;
}

export function createTestCapabilityService(
  overrides: {
    readonly registryId?: string;
    readonly clock?: () => string;
  } = {},
): AgentCapabilityService {
  return createAgentCapabilityService({
    registryId: overrides.registryId ?? "registry:capability:test",
    clock: overrides.clock ?? createFixedClock(),
  });
}

export function createWorkoutCapabilityInput(
  overrides: Partial<CapabilityRegistrationInput> = {},
): CapabilityRegistrationInput {
  return {
    capabilityId: WellKnownCapabilityIds.GENERATE_WORKOUT,
    agentId: "agent:workout",
    name: "Generate Workout",
    description: "Generate a workout plan for the athlete.",
    category: "workout",
    supportedOperations: Object.freeze(["generate", "adapt"]),
    enabled: true,
    registeredAt: FIXED_TIMESTAMP,
    ...overrides,
  };
}

export function createNutritionCapabilityInput(
  overrides: Partial<CapabilityRegistrationInput> = {},
): CapabilityRegistrationInput {
  return {
    capabilityId: WellKnownCapabilityIds.ANALYZE_NUTRITION,
    agentId: "agent:nutrition",
    name: "Analyze Nutrition",
    description: "Analyze nutrition for the athlete.",
    category: "nutrition",
    supportedOperations: Object.freeze(["analyze"]),
    enabled: true,
    registeredAt: FIXED_TIMESTAMP,
    ...overrides,
  };
}

export function createRecoveryCapabilityInput(
  overrides: Partial<CapabilityRegistrationInput> = {},
): CapabilityRegistrationInput {
  return {
    capabilityId: WellKnownCapabilityIds.EVALUATE_RECOVERY,
    agentId: "agent:recovery",
    name: "Evaluate Recovery",
    description: "Evaluate recovery readiness for the athlete.",
    category: "recovery",
    supportedOperations: Object.freeze(["evaluate"]),
    enabled: true,
    registeredAt: FIXED_TIMESTAMP,
    ...overrides,
  };
}

export function seedSpecialistCapabilities(
  service: AgentCapabilityService,
): void {
  service.registerCapability(createWorkoutCapabilityInput());
  service.registerCapability(createNutritionCapabilityInput());
  service.registerCapability(createRecoveryCapabilityInput());
}

export function createFrozenRegistration(
  overrides: Partial<CapabilityRegistrationInput> = {},
) {
  const input = createWorkoutCapabilityInput(overrides);
  return buildCapabilityRegistration({
    id: input.id ?? `registration:${input.capabilityId}`,
    capabilityId: input.capabilityId,
    agentId: input.agentId,
    name: input.name,
    description: input.description,
    category: input.category,
    supportedOperations: input.supportedOperations,
    enabled: input.enabled,
    metadata: input.metadata,
    registeredAt: input.registeredAt ?? FIXED_TIMESTAMP,
  });
}
