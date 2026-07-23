import type { CollaborationPort } from "../contracts/CollaborationPort";
import type { RoutingPort } from "../contracts/RoutingPort";
import type { CoachSupervisorPlan } from "../models/CoachSupervisorPlan";
import type { CoachSupervisorRequest } from "../models/CoachSupervisorRequest";
import { createSupervisorPlanner } from "../planning/SupervisorPlanner";
import { createAgentCoordinator } from "./AgentCoordinator";
import { createCapabilityCoordinator } from "./CapabilityCoordinator";
import { createDependencyCoordinator } from "./DependencyCoordinator";
import { createExecutionCoordinator } from "./ExecutionCoordinator";
import { createRoutingCoordinator } from "./RoutingCoordinator";

export interface CoordinatedSupervisor {
  readonly success: boolean;
  readonly plan: CoachSupervisorPlan | null;
  readonly message: string | null;
}

export class CoordinationEngine {
  private readonly routingCoordinator: ReturnType<typeof createRoutingCoordinator>;
  private readonly agentCoordinator = createAgentCoordinator();
  private readonly capabilityCoordinator = createCapabilityCoordinator();
  private readonly dependencyCoordinator = createDependencyCoordinator();
  private readonly executionCoordinator: ReturnType<
    typeof createExecutionCoordinator
  >;
  private readonly planner = createSupervisorPlanner();

  constructor(deps: {
    readonly routingPort: RoutingPort;
    readonly collaborationPort: CollaborationPort;
  }) {
    this.routingCoordinator = createRoutingCoordinator(deps.routingPort);
    this.executionCoordinator = createExecutionCoordinator(
      deps.collaborationPort,
    );
  }

  buildPlan(input: {
    readonly request: CoachSupervisorRequest;
    readonly planId: string;
    readonly createdAt: string;
  }): CoordinatedSupervisor {
    const routed = this.routingCoordinator.coordinate(input.request);
    this.agentCoordinator.coordinate(routed.routing);
    this.capabilityCoordinator.coordinate(routed.routing);
    const plan = this.planner.plan({
      request: input.request,
      routing: routed.routing,
      planId: input.planId,
      createdAt: input.createdAt,
    });
    const deps = this.dependencyCoordinator.coordinate(plan.coordination);
    return Object.freeze({
      success: routed.valid && deps.valid && routed.routing.success,
      plan,
      message: routed.valid
        ? "Coordination plan built."
        : (routed.routing.message ?? "Coordination failed."),
    });
  }

  getExecutionCoordinator() {
    return this.executionCoordinator;
  }
}

export function createCoordinationEngine(deps: {
  readonly routingPort: RoutingPort;
  readonly collaborationPort: CollaborationPort;
}): CoordinationEngine {
  return new CoordinationEngine(deps);
}
