import {
  createAgentCapabilityService,
  type AgentCapabilityService,
} from "../../../features/agent-capability/services/AgentCapabilityService";
import { WellKnownCapabilityIds } from "../../../features/agent-capability/models/CapabilityId";

/**
 * Factory — object creation only for Agent Capability Registry.
 * Seeds specialist capabilities required by Supervisor Routing.
 */
export const AgentCapabilityFactory = {
  create(): AgentCapabilityService {
    const service = createAgentCapabilityService({
      registryId: "registry:capability:composition",
    });
    seedSpecialistCapabilities(service);
    return service;
  },
} as const;

function seedSpecialistCapabilities(service: AgentCapabilityService): void {
  service.registerCapability({
    capabilityId: WellKnownCapabilityIds.GENERATE_WORKOUT,
    agentId: "agent:workout",
    name: "Generate Workout",
    description: "Generate a workout plan for the athlete.",
    category: "workout",
    supportedOperations: Object.freeze(["generate", "adapt"]),
    enabled: true,
  });
  service.registerCapability({
    capabilityId: WellKnownCapabilityIds.ANALYZE_NUTRITION,
    agentId: "agent:nutrition",
    name: "Analyze Nutrition",
    description: "Analyze nutrition for the athlete.",
    category: "nutrition",
    supportedOperations: Object.freeze(["analyze"]),
    enabled: true,
  });
  service.registerCapability({
    capabilityId: WellKnownCapabilityIds.EVALUATE_RECOVERY,
    agentId: "agent:recovery",
    name: "Evaluate Recovery",
    description: "Evaluate recovery readiness for the athlete.",
    category: "recovery",
    supportedOperations: Object.freeze(["evaluate"]),
    enabled: true,
  });
}
