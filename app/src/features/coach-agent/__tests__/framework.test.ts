import {
  registerAgent,
  resolveAgent,
} from "../../agent-framework/application";
import { createAgentFrameworkService } from "../../agent-framework/services/AgentFrameworkService";
import { AgentCapabilityKeys } from "../../agent-framework/models/AgentCapabilityKey";
import { AgentRoles } from "../../agent-framework/models/AgentRole";
import { createCoachAgentService } from "../services/CoachAgentService";
import {
  createFixedClock,
  createMockSpecialistPorts,
} from "../testSupport/fixtures";

describe("coach-agent framework", () => {
  it("registers CoachFrameworkAgent under coach_supervisor role", () => {
    const framework = createAgentFrameworkService({
      clock: createFixedClock(),
    });
    const service = createCoachAgentService({
      clock: createFixedClock(),
      ports: createMockSpecialistPorts(),
      agentId: "agent:coach:framework",
    });
    service.registerWithFramework(framework);

    const resolved = resolveAgent({
      service: framework,
      role: AgentRoles.COACH_SUPERVISOR,
    });
    expect(resolved.id).toBe("agent:coach:framework");
    expect(resolved.getRole()).toBe(AgentRoles.COACH_SUPERVISOR);
    expect(resolved.supports(AgentCapabilityKeys.GOAL_PLANNING)).toBe(true);
  });

  it("asFrameworkAgent is registerable via public registerAgent API", () => {
    const framework = createAgentFrameworkService({
      clock: createFixedClock(),
    });
    const service = createCoachAgentService({
      clock: createFixedClock(),
      ports: createMockSpecialistPorts(),
      agentId: "agent:coach:framework2",
    });
    registerAgent({ service: framework, agent: service.asFrameworkAgent() });
    const resolved = resolveAgent({
      service: framework,
      role: AgentRoles.COACH_SUPERVISOR,
    });
    expect(resolved.id).toBe("agent:coach:framework2");
  });
});
