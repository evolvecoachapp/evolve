/**
 * Opaque agent identifier.
 */
export type AgentId = string;

export function normalizeAgentId(id: AgentId): AgentId {
  return id.trim();
}

export function isValidAgentId(id: AgentId): boolean {
  return typeof id === "string" && id.trim().length > 0;
}
