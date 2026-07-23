import {
  describeAgent,
  executeAgent,
  listAgents,
  registerAgent,
} from "../application";
import { AgentCapabilityKeys } from "../../agent-framework/models/AgentCapabilityKey";
import { AgentRoles } from "../../agent-framework/models/AgentRole";
import {
  createCapabilityRequest,
  createRecoveryFrameworkAgentFixture,
  createTestRuntimeService,
  createTrackingExecutor,
  createWorkoutAgent,
  createNutritionAgent,
} from "../testSupport/fixtures";
import { AgentSelector } from "../selectors/AgentSelector";
import { validateRegistryIntegrity } from "../validators";

describe("agent-runtime integration", () => {
  it("wires registry + selector + coordinators + RecoveryFrameworkAgent", async () => {
    const service = createTestRuntimeService();
    const recovery = createRecoveryFrameworkAgentFixture();

    registerAgent({
      service,
      agent: recovery,
      executor: createTrackingExecutor("recovery"),
    });
    registerAgent({ service, agent: createWorkoutAgent() });
    registerAgent({ service, agent: createNutritionAgent() });

    expect(listAgents({ service })).toHaveLength(3);
    expect(validateRegistryIntegrity(service.getRuntime().getRegistry())).toEqual(
      [],
    );

    const described = describeAgent({ service, agentId: recovery.id });
    expect(described?.role).toBe(AgentRoles.RECOVERY);
    expect(described?.capabilities).toContain(
      AgentCapabilityKeys.RECOVERY_ANALYSIS,
    );
    expect(described?.hasExecutor).toBe(true);

    const response = await executeAgent({
      service,
      request: createCapabilityRequest(AgentCapabilityKeys.RECOVERY_ANALYSIS),
    });

    expect(response.success).toBe(true);
    expect(response.selectedAgentId).toBe(recovery.id);
    expect(response.result?.message).toContain("Custom executor:recovery");
    expect(response.snapshot.plan?.selectionReason).toContain(recovery.id);

    const ranked = new AgentSelector().selectHighestPriority(
      listAgents({ service }),
    );
    expect(ranked?.getRole()).toBe(AgentRoles.RECOVERY);
  });
});
