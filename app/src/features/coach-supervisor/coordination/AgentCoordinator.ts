import type { RoutingResolution } from "../contracts/RoutingPort";
import { selectAgents } from "../selectors/AgentSelector";

export class AgentCoordinator {
  coordinate(routing: RoutingResolution): readonly string[] {
    return selectAgents(routing.targets);
  }
}

export function createAgentCoordinator(): AgentCoordinator {
  return new AgentCoordinator();
}
