import {
  describeAgent,
  listAgents,
  registerAgent,
  resolveAgent,
  validateAgent,
} from "../application";
import {
  createTestFrameworkService,
  createWorkoutStubAgent,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { AgentCapabilityKeys } from "../models/AgentCapabilityKey";
import { AgentRoles } from "../models/AgentRole";

describe("agent-framework application", () => {
  it("register / resolve / list / describe / validate public API", () => {
    const service = createTestFrameworkService();
    const agent = createWorkoutStubAgent();

    registerAgent({ service, agent, clock: () => FIXED_TIMESTAMP });

    expect(listAgents({ service })).toHaveLength(1);
    expect(
      resolveAgent({
        service,
        role: AgentRoles.WORKOUT,
      }).id,
    ).toBe(agent.id);
    expect(
      resolveAgent({
        service,
        capability: AgentCapabilityKeys.WORKOUT_PLANNING,
      }).id,
    ).toBe(agent.id);

    const snapshot = describeAgent({
      service,
      agentId: agent.id,
      clock: () => FIXED_TIMESTAMP,
    });
    expect(snapshot).not.toBeNull();
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(snapshot?.descriptor.identity.name).toBe("Workout Agent");
    expect(validateAgent({ service, agentId: agent.id })).toEqual([]);
  });
});
