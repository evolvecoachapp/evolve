import {
  executeAgent,
  listAgents,
  registerAgent,
  unregisterAgent,
} from "../application";
import { AgentRoles } from "../../agent-framework/models/AgentRole";
import { AgentCapabilityKeys } from "../../agent-framework/models/AgentCapabilityKey";
import {
  createCapabilityRequest,
  createRecoveryFrameworkAgentFixture,
  createRoleRequest,
  createTestRuntimeService,
  createWorkoutAgent,
  createNutritionAgent,
  createGenericAgent,
  createFallbackRequest,
} from "../testSupport/fixtures";
import { AgentRegistry } from "../registry/AgentRegistry";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("agent-runtime regression", () => {
  it("keeps registry immutable across register/unregister cycles", () => {
    const a = AgentRegistry.empty().register(createWorkoutAgent(), {
      registeredAt: FIXED_TIMESTAMP,
    });
    const b = a.register(createNutritionAgent(), {
      registeredAt: FIXED_TIMESTAMP,
    });
    const c = b.unregister("agent:workout:runtime");

    expect(a.list()).toHaveLength(1);
    expect(b.list()).toHaveLength(2);
    expect(c.list()).toHaveLength(1);
    expect(c.lookupById("agent:nutrition:runtime")).not.toBeNull();
  });

  it("does not modify existing RecoveryFrameworkAgent contract surface", async () => {
    const service = createTestRuntimeService();
    const recovery = createRecoveryFrameworkAgentFixture();

    expect(recovery.getRole()).toBe(AgentRoles.RECOVERY);
    expect(recovery.supports(AgentCapabilityKeys.RECOVERY_ANALYSIS)).toBe(true);
    expect(typeof recovery.getDescriptor).toBe("function");
    expect(typeof recovery.getInfo).toBe("function");

    registerAgent({ service, agent: recovery });
    registerAgent({ service, agent: createWorkoutAgent() });
    registerAgent({ service, agent: createGenericAgent() });

    const byRole = await executeAgent({
      service,
      request: createRoleRequest(AgentRoles.RECOVERY),
    });
    expect(byRole.selectedAgentId).toBe(recovery.id);

    const byCap = await executeAgent({
      service,
      request: createCapabilityRequest(AgentCapabilityKeys.WORKOUT_PLANNING),
    });
    expect(byCap.selectedAgentId).toBe("agent:workout:runtime");

    const fallback = await executeAgent({
      service,
      request: createFallbackRequest(),
    });
    expect(fallback.plan?.fallbackUsed).toBe(true);

    unregisterAgent({ service, agentId: recovery.id });
    expect(listAgents({ service }).map((a) => a.id)).not.toContain(recovery.id);
  });

  it("shell executor path remains deterministic without custom handlers", async () => {
    const service = createTestRuntimeService();
    registerAgent({ service, agent: createNutritionAgent() });
    const first = await executeAgent({
      service,
      request: createRoleRequest(AgentRoles.NUTRITION),
    });
    const second = await executeAgent({
      service,
      request: createRoleRequest(AgentRoles.NUTRITION),
    });
    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    expect(first.result?.attributes.executor).toBe("shell");
    expect(second.selectedAgentId).toBe(first.selectedAgentId);
  });
});
