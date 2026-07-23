import { AgentCapabilityKeys } from "../../agent-framework/models/AgentCapabilityKey";
import { AgentRoles } from "../../agent-framework/models/AgentRole";
import { createAgentFrameworkService } from "../../agent-framework/services/AgentFrameworkService";
import { createCoachSupervisorService } from "../services/CoachSupervisorService";
import { createFixedClock } from "../testSupport/fixtures";

describe("coach-supervisor framework integration", () => {
  it("registers as IAgent with role coach_supervisor", () => {
    const framework = createAgentFrameworkService({
      clock: createFixedClock(),
    });
    const service = createCoachSupervisorService({
      clock: createFixedClock(),
      frameworkService: framework,
      registerWithFramework: true,
    });

    const agent = service.asFrameworkAgent();
    expect(agent.getRole()).toBe(AgentRoles.COACH_SUPERVISOR);
    expect(agent.supports(AgentCapabilityKeys.REASONING)).toBe(true);
    expect(agent.getCapabilities()[AgentCapabilityKeys.REASONING]).toBe(true);

    const listed = framework.listAgents();
    expect(listed.some((a) => a.id === agent.id)).toBe(true);
  });
});
