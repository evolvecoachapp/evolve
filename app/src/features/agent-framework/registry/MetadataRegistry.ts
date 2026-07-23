import type { AgentId } from "../models/AgentId";
import { normalizeAgentId } from "../models/AgentId";
import type { AgentMetadata } from "../models/AgentMetadata";
import { EMPTY_AGENT_METADATA } from "../models/AgentMetadata";
import { freezeMetadata } from "../utils/FreezeAgent";
import { AgentError } from "../models/AgentError";

/**
 * In-memory metadata registry for registered agents.
 * Registration only.
 */
export class MetadataRegistry {
  private readonly metadata = new Map<AgentId, AgentMetadata>();
  private readonly registeredAt = new Map<AgentId, string>();

  register(
    agentId: AgentId,
    metadata: AgentMetadata = EMPTY_AGENT_METADATA,
    registeredAt: string = new Date().toISOString(),
  ): void {
    const id = normalizeAgentId(agentId);
    if (!id) {
      throw new AgentError("invalid_agent_id", "Cannot register metadata");
    }
    this.metadata.set(id, freezeMetadata(metadata));
    this.registeredAt.set(id, registeredAt);
  }

  unregister(agentId: AgentId): boolean {
    const id = normalizeAgentId(agentId);
    this.registeredAt.delete(id);
    return this.metadata.delete(id);
  }

  resolve(agentId: AgentId): AgentMetadata | null {
    return this.metadata.get(normalizeAgentId(agentId)) ?? null;
  }

  getRegisteredAt(agentId: AgentId): string | null {
    return this.registeredAt.get(normalizeAgentId(agentId)) ?? null;
  }

  list(): readonly {
    readonly agentId: AgentId;
    readonly metadata: AgentMetadata;
    readonly registeredAt: string;
  }[] {
    return Object.freeze(
      [...this.metadata.entries()].map(([agentId, metadata]) =>
        Object.freeze({
          agentId,
          metadata,
          registeredAt: this.registeredAt.get(agentId) ?? "",
        }),
      ),
    );
  }

  clear(): void {
    this.metadata.clear();
    this.registeredAt.clear();
  }
}

export function createMetadataRegistry(): MetadataRegistry {
  return new MetadataRegistry();
}
