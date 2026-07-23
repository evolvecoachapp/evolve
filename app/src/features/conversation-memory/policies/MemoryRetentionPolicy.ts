import type { MemoryEntry } from "../models/MemoryEntry";
import { MemoryPriorities } from "../models/MemoryPriority";
import type { MemoryPolicy } from "../models/MemoryPolicy";
import { MemoryPolicyKinds } from "../models/MemoryPolicy";
import { sortEntriesDeterministic } from "../utils/sortHelpers";

/**
 * Deterministic retention policy — keep high-priority / latest entries.
 * No persistence. No AI.
 */
export interface MemoryRetentionPolicy {
  readonly policy: MemoryPolicy;
  retain(
    entries: readonly MemoryEntry[],
    maxEntries: number,
  ): readonly MemoryEntry[];
}

export class DefaultMemoryRetentionPolicy implements MemoryRetentionPolicy {
  readonly policy: MemoryPolicy = Object.freeze({
    id: "policy:memory:retention:default",
    kind: MemoryPolicyKinds.RETENTION,
    name: "Default Memory Retention",
    description:
      "Retains highest-priority then most-recent entries up to a max count.",
    enabled: true,
  });

  retain(
    entries: readonly MemoryEntry[],
    maxEntries: number,
  ): readonly MemoryEntry[] {
    if (maxEntries < 0) {
      return Object.freeze([]);
    }
    const sorted = sortEntriesDeterministic(entries);
    if (sorted.length <= maxEntries) {
      return Object.freeze([...sorted]);
    }
    // Always retain CRITICAL entries first, then fill remaining slots.
    const critical = sorted.filter(
      (e) => e.priority >= MemoryPriorities.CRITICAL,
    );
    const rest = sorted.filter((e) => e.priority < MemoryPriorities.CRITICAL);
    const kept = [...critical];
    for (const entry of rest) {
      if (kept.length >= maxEntries) break;
      kept.push(entry);
    }
    return Object.freeze(sortEntriesDeterministic(kept));
  }
}

export function createMemoryRetentionPolicy(): MemoryRetentionPolicy {
  return new DefaultMemoryRetentionPolicy();
}
