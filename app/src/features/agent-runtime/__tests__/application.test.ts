import {
  describeAgent,
  executeAgent,
  listAgents,
  registerAgent,
  unregisterAgent,
} from "../application";
import { AgentRoles } from "../../agent-framework/models/AgentRole";
import {
  createRoleRequest,
  createTestRuntimeService,
  createWorkoutAgent,
  createNutritionAgent,
  createFallbackRequest,
  createGenericAgent,
} from "../testSupport/fixtures";

describe("agent-runtime application", () => {
  it("exposes public API without leaking internals", async () => {
    const service = createTestRuntimeService();
    registerAgent({ service, agent: createWorkoutAgent() });
    registerAgent({ service, agent: createNutritionAgent() });

    expect(listAgents({ service }).map((a) => a.id).sort()).toEqual([
      "agent:nutrition:runtime",
      "agent:workout:runtime",
    ]);

    const described = describeAgent({
      service,
      agentId: "agent:workout:runtime",
    });
    expect(described?.role).toBe(AgentRoles.WORKOUT);
    expect(described?.hasExecutor).toBe(false);

    const response = await executeAgent({
      service,
      request: createRoleRequest(AgentRoles.NUTRITION),
    });
    expect(response.success).toBe(true);
    expect(response.selectedAgentId).toBe("agent:nutrition:runtime");

    expect(
      unregisterAgent({ service, agentId: "agent:nutrition:runtime" }),
    ).toBe(true);
    expect(listAgents({ service })).toHaveLength(1);
  });

  it("supports fallback selection via public executeAgent", async () => {
    const service = createTestRuntimeService();
    registerAgent({ service, agent: createGenericAgent() });
    registerAgent({ service, agent: createWorkoutAgent() });

    const response = await executeAgent({
      service,
      request: createFallbackRequest(),
    });
    expect(response.success).toBe(true);
    expect(response.plan?.fallbackUsed).toBe(true);
    expect(response.selectedAgentId).toBe("agent:generic:runtime");
  });
});
