import {
  buildAgentContext,
  buildAgentDescriptor,
  buildAgentPackage,
} from "../builders";
import { createCapabilities } from "../models/AgentCapabilities";
import { AgentCapabilityKeys } from "../models/AgentCapabilityKey";
import { AgentRoles } from "../models/AgentRole";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("agent-framework builders", () => {
  it("builds frozen context / descriptor / package", () => {
    const descriptor = buildAgentDescriptor({
      id: "agent:builder",
      name: "Builder Agent",
      role: AgentRoles.GOAL,
      capabilities: createCapabilities([AgentCapabilityKeys.GOAL_PLANNING]),
      registeredAt: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(descriptor)).toBe(true);
    expect(descriptor.identity.role).toBe(AgentRoles.GOAL);

    const context = buildAgentContext({
      agentId: descriptor.identity.id,
      role: descriptor.identity.role,
      capabilityKeys: [AgentCapabilityKeys.GOAL_PLANNING],
      createdAt: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(context)).toBe(true);

    const pkg = buildAgentPackage({
      descriptor,
      packagedAt: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(pkg)).toBe(true);
    expect(pkg.descriptor.identity.id).toBe("agent:builder");
  });
});
