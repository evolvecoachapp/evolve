import type { IAgent } from "../contracts/IAgent";
import type { AgentHealth } from "../models/AgentHealth";
import { AgentHealthStatuses } from "../models/AgentHealth";
import { AgentStatuses } from "../models/AgentStatus";
import { freezeHealth } from "../utils/FreezeAgent";

/**
 * Health checks for registered agents. Lifecycle only — no execution.
 */
export class AgentHealthChecker {
  constructor(
    private readonly clock: () => string = () => new Date().toISOString(),
  ) {}

  check(agent: IAgent): AgentHealth {
    const status = agent.getStatus();
    const configuration = agent.getConfiguration();
    const existing = agent.getHealth();

    if (!configuration.enabled) {
      return freezeHealth({
        agentId: agent.id,
        status: AgentHealthStatuses.UNHEALTHY,
        checkedAt: this.clock(),
        message: "agent_disabled",
        details: Object.freeze({ previous: existing.status }),
      });
    }

    if (
      status === AgentStatuses.FAILED ||
      status === AgentStatuses.SHUTDOWN ||
      status === AgentStatuses.UNREGISTERED
    ) {
      return freezeHealth({
        agentId: agent.id,
        status: AgentHealthStatuses.UNHEALTHY,
        checkedAt: this.clock(),
        message: `agent_status:${status}`,
        details: Object.freeze({ status }),
      });
    }

    if (
      status === AgentStatuses.DEGRADED ||
      status === AgentStatuses.SHUTTING_DOWN
    ) {
      return freezeHealth({
        agentId: agent.id,
        status: AgentHealthStatuses.DEGRADED,
        checkedAt: this.clock(),
        message: `agent_status:${status}`,
        details: Object.freeze({ status }),
      });
    }

    return freezeHealth({
      agentId: agent.id,
      status: AgentHealthStatuses.HEALTHY,
      checkedAt: this.clock(),
      message: null,
      details: Object.freeze({ status }),
    });
  }
}

export function createAgentHealthChecker(
  clock?: () => string,
): AgentHealthChecker {
  return new AgentHealthChecker(clock);
}
