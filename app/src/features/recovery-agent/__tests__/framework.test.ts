import {
  describeAgent,
  registerAgent,
  resolveAgent,
} from "../../agent-framework/application";
import { createAgentFrameworkService } from "../../agent-framework/services/AgentFrameworkService";
import { AgentCapabilityKeys } from "../../agent-framework/models/AgentCapabilityKey";
import { AgentRoles } from "../../agent-framework/models/AgentRole";
import {
  processRecoveryRequest,
  describeRecoveryCapabilities,
} from "../application";
import {
  createTestAgentService,
  createRecoveryRequestFixture,
  createFixedClock,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("recovery-agent framework integration", () => {
  it("registers with Agent Framework without changing process behavior", () => {
    const framework = createAgentFrameworkService({
      clock: createFixedClock(),
    });
    const service = createTestAgentService();
    service.registerWithFramework(framework);

    const frameworkAgent = resolveAgent({
      service: framework,
      role: AgentRoles.RECOVERY,
    });
    expect(frameworkAgent.id).toBe("agent:recovery:test");
    expect(
      frameworkAgent.supports(AgentCapabilityKeys.RECOVERY_ANALYSIS),
    ).toBe(true);

    const snapshot = describeAgent({
      service: framework,
      agentId: frameworkAgent.id,
      clock: () => FIXED_TIMESTAMP,
    });
    expect(snapshot?.descriptor.identity.role).toBe(AgentRoles.RECOVERY);

    const result = processRecoveryRequest({
      service,
      request: createRecoveryRequestFixture(),
    });
    expect(result.success).toBe(true);
    expect(result.decision.accepted).toBe(true);

    const described = describeRecoveryCapabilities({ service });
    expect(described.name).toBe("Recovery Agent");
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
        capability: AgentCapabilityKeys.RECOVERY_ANALYSIS,
      }).getRole(),
    ).toBe(AgentRoles.RECOVERY);
  });
});
