import { createAgentRegistry } from "../registry/AgentRegistry";
import { createCapabilityRegistry } from "../registry/CapabilityRegistry";
import { createRoleRegistry } from "../registry/RoleRegistry";
import { createMetadataRegistry } from "../registry/MetadataRegistry";
import { WorkoutPlanning } from "../capabilities";
import {
  createStubAgent,
  createWorkoutStubAgent,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { AgentRoles } from "../models/AgentRole";
import { AgentError } from "../models/AgentError";

describe("agent-framework registry", () => {
  it("registers and resolves agents", () => {
    const registry = createAgentRegistry();
    const agent = createWorkoutStubAgent();
    registry.register(agent);

    expect(registry.resolve(agent.id)?.id).toBe(agent.id);
    expect(registry.list()).toHaveLength(1);
    expect(registry.isAvailable(agent.id)).toBe(true);
  });

  it("rejects duplicate registration", () => {
    const registry = createAgentRegistry();
    const agent = createStubAgent({ id: "agent:dup" });
    registry.register(agent);
    expect(() => registry.register(agent)).toThrow(AgentError);
  });

  it("capability / role / metadata registries store mappings only", () => {
    const capabilities = createCapabilityRegistry();
    const roles = createRoleRegistry();
    const metadata = createMetadataRegistry();
    const agent = createWorkoutStubAgent();

    capabilities.register(WorkoutPlanning);
    roles.syncFromAgent(agent);
    metadata.register(agent.id, agent.getMetadata(), FIXED_TIMESTAMP);

    expect(capabilities.resolve(WorkoutPlanning.key)?.name).toBe(
      "Workout Planning",
    );
    expect(roles.resolve(AgentRoles.WORKOUT)).toBe(agent.id);
    expect(metadata.resolve(agent.id)).toBeTruthy();
  });
});
