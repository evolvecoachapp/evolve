import type { SupervisorRoutingService } from "../../../features/supervisor-routing/services/SupervisorRoutingService";
import type { AgentCollaborationService } from "../../../features/agent-collaboration/services/AgentCollaborationService";
import {
  createCoachSupervisorService,
  type CoachSupervisorService,
} from "../../../features/coach-supervisor/services/CoachSupervisorService";
import {
  createCoachingSessionService,
  type CoachingSessionService,
} from "../../../features/coaching-session/services/CoachingSessionService";
import {
  createSupervisorRoutingPortAdapter,
  createAgentCollaborationPortAdapter,
  createCoachSupervisorPortAdapter,
} from "../adapters";

export interface CoachSupervisorFactoryDeps {
  readonly routing: SupervisorRoutingService;
  readonly collaboration: AgentCollaborationService;
}

export const CoachSupervisorFactory = {
  create(deps: CoachSupervisorFactoryDeps): CoachSupervisorService {
    return createCoachSupervisorService({
      routingPort: createSupervisorRoutingPortAdapter(deps.routing),
      collaborationPort: createAgentCollaborationPortAdapter(deps.collaboration),
    });
  },
} as const;

export interface CoachingSessionFactoryDeps {
  readonly supervisor: CoachSupervisorService;
}

export const CoachingSessionFactory = {
  create(deps: CoachingSessionFactoryDeps): CoachingSessionService {
    return createCoachingSessionService({
      supervisorPort: createCoachSupervisorPortAdapter(deps.supervisor),
    });
  },
} as const;
