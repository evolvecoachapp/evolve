import {
  describeAgent,
  registerAgent,
  resolveAgent,
} from "../application";
import {
  createTestFrameworkService,
  createWorkoutStubAgent,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { AgentRoles } from "../models/AgentRole";
import { freezeDescriptor } from "../utils/FreezeAgent";

describe("agent-framework regression", () => {
  it("describe snapshots are deterministic for identical clock", () => {
    const service = createTestFrameworkService();
    const agent = createWorkoutStubAgent();
    registerAgent({ service, agent, clock: () => FIXED_TIMESTAMP });

    const a = describeAgent({
      service,
      agentId: agent.id,
      clock: () => FIXED_TIMESTAMP,
    });
    const b = describeAgent({
      service,
      agentId: agent.id,
      clock: () => FIXED_TIMESTAMP,
    });

    expect(a).toEqual(b);
    expect(Object.isFrozen(a?.descriptor)).toBe(true);
    expect(freezeDescriptor(a!.descriptor)).toEqual(a!.descriptor);
  });

  it("resolve by role remains stable after multiple resolves", () => {
    const service = createTestFrameworkService();
    registerAgent({ service, agent: createWorkoutStubAgent() });

    const first = resolveAgent({ service, role: AgentRoles.WORKOUT });
    const second = resolveAgent({ service, role: AgentRoles.WORKOUT });
    expect(first.id).toBe(second.id);
  });
});
