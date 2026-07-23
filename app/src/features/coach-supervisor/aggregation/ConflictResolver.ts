import type { AgentExecutionSummary } from "../models/AgentExecutionSummary";

/**
 * Structural conflict detection only — no AI / ranking.
 */
export class ConflictResolver {
  resolve(summaries: readonly AgentExecutionSummary[]): readonly string[] {
    const conflicts: string[] = [];
    const byAgent = new Map<string, number>();
    for (const s of summaries) {
      byAgent.set(s.agentId, (byAgent.get(s.agentId) ?? 0) + 1);
    }
    for (const [agentId, count] of byAgent) {
      if (count > 1) {
        conflicts.push(`Duplicate summaries for ${agentId} (${count}).`);
      }
    }
    return Object.freeze(conflicts);
  }
}

export function createConflictResolver(): ConflictResolver {
  return new ConflictResolver();
}
