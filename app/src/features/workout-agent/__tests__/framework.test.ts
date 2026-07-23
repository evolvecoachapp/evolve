import {
  describeAgent,
  registerAgent,
  resolveAgent,
} from "../../agent-framework/application";
import { createAgentFrameworkService } from "../../agent-framework/services/AgentFrameworkService";
import { AgentCapabilityKeys } from "../../agent-framework/models/AgentCapabilityKey";
import { AgentRoles } from "../../agent-framework/models/AgentRole";
import {
  processWorkoutRequest,
  describeWorkoutCapabilities,
} from "../application";
import {
  createTestAgentService,
  createWorkoutRequestFixture,
  createFixedClock,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("workout-agent framework migration", () => {
  it("registers with Agent Framework without changing process behavior", () => {
    const framework = createAgentFrameworkService({
      clock: createFixedClock(),
    });
    const service = createTestAgentService();
    service.registerWithFramework(framework);

    const frameworkAgent = resolveAgent({
      service: framework,
      role: AgentRoles.WORKOUT,
    });
    expect(frameworkAgent.id).toBe("agent:workout:test");
    expect(
      frameworkAgent.supports(AgentCapabilityKeys.WORKOUT_PLANNING),
    ).toBe(true);

    const snapshot = describeAgent({
      service: framework,
      agentId: frameworkAgent.id,
      clock: () => FIXED_TIMESTAMP,
    });
    expect(snapshot?.descriptor.identity.role).toBe(AgentRoles.WORKOUT);

    const result = processWorkoutRequest({
      service,
      request: createWorkoutRequestFixture(),
    });
    expect(result.success).toBe(true);
    expect(result.decision.accepted).toBe(true);

    const described = describeWorkoutCapabilities({ service });
    expect(described.name).toBe("Workout Agent");
  });

  it("asFrameworkAgent is registerable via public registerAgent API", () => {
    const framework = createAgentFrameworkService({
      clock: createFixedClock(),
    });
    const service = createTestAgentService();
    registerAgent({ service: framework, agent: service.asFrameworkAgent() });

    expect(
      resolveAgent({
        service: framework,
        capability: AgentCapabilityKeys.WORKOUT_PLANNING,
      }).getRole(),
    ).toBe(AgentRoles.WORKOUT);
  });
});
