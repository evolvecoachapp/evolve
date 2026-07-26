import type { AgentCapabilityService } from "../../../features/agent-capability/services/AgentCapabilityService";
import { createCapabilityRegistryPortFromStore } from "../../../features/supervisor-routing/contracts/CapabilityRegistryPort";
import {
  createSupervisorRoutingService,
  type SupervisorRoutingService,
} from "../../../features/supervisor-routing/services/SupervisorRoutingService";
import {
  createAgentCollaborationService,
  type AgentCollaborationService,
} from "../../../features/agent-collaboration/services/AgentCollaborationService";

export interface SupervisorRoutingFactoryDeps {
  readonly capabilityService: AgentCapabilityService;
}

export const SupervisorRoutingFactory = {
  create(deps: SupervisorRoutingFactoryDeps): SupervisorRoutingService {
    const registry = createCapabilityRegistryPortFromStore(
      deps.capabilityService.getStore(),
    );
    return createSupervisorRoutingService({ registry });
  },
} as const;

export const AgentCollaborationFactory = {
  create(): AgentCollaborationService {
    return createAgentCollaborationService();
  },
} as const;
