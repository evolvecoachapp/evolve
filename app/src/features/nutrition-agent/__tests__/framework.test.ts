import {
  describeAgent,
  registerAgent,
  resolveAgent,
} from "../../agent-framework/application";
import { createAgentFrameworkService } from "../../agent-framework/services/AgentFrameworkService";
import { AgentCapabilityKeys } from "../../agent-framework/models/AgentCapabilityKey";
import { AgentRoles } from "../../agent-framework/models/AgentRole";
import {
  processNutritionRequest,
  describeNutritionCapabilities,
} from "../application";
import {
  createTestAgentService,
  createNutritionRequestFixture,
  createFixedClock,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("nutrition-agent framework integration", () => {
  it("registers with Agent Framework without changing process behavior", () => {
    const framework = createAgentFrameworkService({
      clock: createFixedClock(),
    });
    const service = createTestAgentService();
    service.registerWithFramework(framework);

    const frameworkAgent = resolveAgent({
      service: framework,
      role: AgentRoles.NUTRITION,
    });
    expect(frameworkAgent.id).toBe("agent:nutrition:test");
    expect(
      frameworkAgent.supports(AgentCapabilityKeys.NUTRITION_PLANNING),
    ).toBe(true);

    const snapshot = describeAgent({
      service: framework,
      agentId: frameworkAgent.id,
      clock: () => FIXED_TIMESTAMP,
    });
    expect(snapshot?.descriptor.identity.role).toBe(AgentRoles.NUTRITION);

    const result = processNutritionRequest({
      service,
      request: createNutritionRequestFixture(),
    });
    expect(result.success).toBe(true);
    expect(result.decision.accepted).toBe(true);

    const described = describeNutritionCapabilities({ service });
    expect(described.name).toBe("Nutrition Agent");
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
        capability: AgentCapabilityKeys.NUTRITION_PLANNING,
      }).getRole(),
    ).toBe(AgentRoles.NUTRITION);
  });
});
