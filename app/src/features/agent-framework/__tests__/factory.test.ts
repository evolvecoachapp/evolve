import { createAgentRegistry } from "../registry/AgentRegistry";
import { createAgentFactory } from "../factory/AgentFactory";
import {
  createStubAgent,
  createWorkoutStubAgent,
} from "../testSupport/fixtures";
import { AgentCapabilityKeys } from "../models/AgentCapabilityKey";
import { AgentRoles } from "../models/AgentRole";
import { AgentError } from "../models/AgentError";

describe("agent-framework factory", () => {
  it("resolves by id / role / capability / default", () => {
    const registry = createAgentRegistry();
    const workout = createWorkoutStubAgent();
    const generic = createStubAgent({
      id: "agent:generic",
      role: AgentRoles.GENERIC,
    });
    registry.register(workout);
    registry.register(generic);

    const factory = createAgentFactory(registry);
    factory.setDefaultAgentId(workout.id);

    expect(factory.resolveById(workout.id).id).toBe(workout.id);
    expect(factory.resolveByRole(AgentRoles.WORKOUT).id).toBe(workout.id);
    expect(
      factory.resolveByCapability(AgentCapabilityKeys.WORKOUT_PLANNING).id,
    ).toBe(workout.id);
    expect(factory.resolveDefault().id).toBe(workout.id);
  });

  it("throws when capability is missing", () => {
    const registry = createAgentRegistry();
    registry.register(createStubAgent({ id: "agent:a" }));
    const factory = createAgentFactory(registry);

    expect(() =>
      factory.resolveByCapability(AgentCapabilityKeys.NUTRITION_PLANNING),
    ).toThrow(AgentError);
  });
});
