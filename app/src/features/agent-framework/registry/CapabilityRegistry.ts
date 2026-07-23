import type { IAgentCapability } from "../contracts/IAgentCapability";
import type { AgentCapabilityKey } from "../models/AgentCapabilityKey";
import { AgentError } from "../models/AgentError";

/**
 * In-memory capability definition registry.
 * Registration only — no domain logic.
 */
export class CapabilityRegistry {
  private readonly capabilities = new Map<
    AgentCapabilityKey,
    IAgentCapability
  >();

  register(capability: IAgentCapability): void {
    if (this.capabilities.has(capability.key)) {
      throw new AgentError(
        "capability_already_registered",
        `Capability already registered: ${capability.key}`,
      );
    }
    this.capabilities.set(capability.key, capability);
  }

  unregister(key: AgentCapabilityKey): boolean {
    return this.capabilities.delete(key);
  }

  resolve(key: AgentCapabilityKey): IAgentCapability | null {
    return this.capabilities.get(key) ?? null;
  }

  list(): readonly IAgentCapability[] {
    return Object.freeze([...this.capabilities.values()]);
  }

  has(key: AgentCapabilityKey): boolean {
    return this.capabilities.has(key);
  }

  clear(): void {
    this.capabilities.clear();
  }
}

export function createCapabilityRegistry(): CapabilityRegistry {
  return new CapabilityRegistry();
}
