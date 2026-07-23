import type { IAgent } from "../contracts/IAgent";
import type { IAgentFactory } from "../contracts/IAgentFactory";
import type { IAgentLifecycle } from "../contracts/IAgentLifecycle";
import type { IAgentRegistry } from "../contracts/IAgentRegistry";
import {
  createStubAgent,
  createWorkoutStubAgent,
} from "../testSupport/fixtures";
import { AgentCapabilityKeys } from "../models/AgentCapabilityKey";
import { createAgentRegistry } from "../registry/AgentRegistry";
import { createAgentFactory } from "../factory/AgentFactory";
import { createAgentLifecycle } from "../lifecycle/AgentLifecycle";

describe("agent-framework contracts", () => {
  it("stub satisfies IAgent core contract", () => {
    const agent: IAgent = createStubAgent({ id: "contract" });

    expect(agent.id).toBe("contract");
    expect(agent.getInfo().id).toBe("contract");
    expect(agent.getCapabilities().reasoning).toBe(true);
    expect(agent.getConfiguration().agentId).toBe("contract");
    expect(agent.supports(AgentCapabilityKeys.REASONING)).toBe(true);
    expect(agent.supports(AgentCapabilityKeys.NUTRITION_PLANNING)).toBe(false);
  });

  it("registry / factory / lifecycle contracts are implemented", () => {
    const registry: IAgentRegistry = createAgentRegistry();
    const factory: IAgentFactory = createAgentFactory(registry);
    const lifecycle: IAgentLifecycle = createAgentLifecycle();
    const agent = createWorkoutStubAgent();

    registry.register(agent);
    expect(registry.has(agent.id)).toBe(true);
    expect(factory.resolveByRole(agent.getRole()).id).toBe(agent.id);

    const state = lifecycle.initialize(agent);
    expect(state.status).toBe("ready");
    expect(Object.isFrozen(state)).toBe(true);
  });

  it("does not expose networking or provider surfaces", () => {
    const agent = createStubAgent();
    const keys = Object.keys(agent);

    expect(keys).not.toContain("fetch");
    expect(keys).not.toContain("http");
    expect(keys).not.toContain("openai");
    expect(keys).not.toContain("prompt");
  });
});
