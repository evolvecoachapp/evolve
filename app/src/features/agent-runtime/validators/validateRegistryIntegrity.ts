import type { AgentRegistry } from "../registry/AgentRegistry";

export function validateRegistryIntegrity(
  registry: AgentRegistry | null | undefined,
): readonly string[] {
  const issues: string[] = [];
  if (!registry) {
    return Object.freeze(["registry_missing"]);
  }
  const seen = new Set<string>();
  for (const entry of registry.listEntries()) {
    const id = entry.agent.id?.trim();
    if (!id) {
      issues.push("registry_entry_missing_id");
      continue;
    }
    if (seen.has(id)) {
      issues.push(`registry_duplicate_id:${id}`);
    }
    seen.add(id);
    if (entry.agent.id !== id) {
      issues.push(`registry_id_not_normalized:${entry.agent.id}`);
    }
    if (!entry.registeredAt?.trim()) {
      issues.push(`registry_registered_at_missing:${id}`);
    }
    try {
      const info = entry.agent.getInfo();
      if (info.id !== id) {
        issues.push(`registry_info_id_mismatch:${id}`);
      }
    } catch {
      issues.push(`registry_agent_info_unavailable:${id}`);
    }
  }
  return Object.freeze(issues);
}
