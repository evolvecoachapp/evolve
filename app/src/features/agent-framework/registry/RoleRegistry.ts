import type { IAgent } from "../contracts/IAgent";
import type { AgentRole } from "../models/AgentRole";
import { AgentError } from "../models/AgentError";
import type { AgentId } from "../models/AgentId";
import { normalizeAgentId } from "../models/AgentId";

/**
 * In-memory role → agent id registry.
 * Registration only — no concrete agents.
 */
export class RoleRegistry {
  private readonly roles = new Map<AgentRole, AgentId>();

  register(role: AgentRole, agentId: AgentId): void {
    const id = normalizeAgentId(agentId);
    if (!id) {
      throw new AgentError("invalid_agent_id", "Cannot register role mapping");
    }
    this.roles.set(role, id);
  }

  unregister(role: AgentRole): boolean {
    return this.roles.delete(role);
  }

  resolve(role: AgentRole): AgentId | null {
    return this.roles.get(role) ?? null;
  }

  list(): readonly { readonly role: AgentRole; readonly agentId: AgentId }[] {
    return Object.freeze(
      [...this.roles.entries()].map(([role, agentId]) =>
        Object.freeze({ role, agentId }),
      ),
    );
  }

  has(role: AgentRole): boolean {
    return this.roles.has(role);
  }

  syncFromAgent(agent: IAgent): void {
    this.register(agent.getRole(), agent.id);
  }

  clear(): void {
    this.roles.clear();
  }
}

export function createRoleRegistry(): RoleRegistry {
  return new RoleRegistry();
}
