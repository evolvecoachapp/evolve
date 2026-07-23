import type { MemoryEntry } from "../models/MemoryEntry";
import type { MemoryPolicy } from "../models/MemoryPolicy";
import { MemoryPolicyKinds } from "../models/MemoryPolicy";
import { freezeEntry } from "../utils/FreezeMemoryState";
import { sortEntriesDeterministic } from "../utils/sortHelpers";

/**
 * Deterministic merge policy — merge by key within category/scope.
 * Higher priority wins; equal priority → later updatedAt wins.
 */
export interface MemoryMergePolicy {
  readonly policy: MemoryPolicy;
  merge(entries: readonly MemoryEntry[]): readonly MemoryEntry[];
}

export class DefaultMemoryMergePolicy implements MemoryMergePolicy {
  readonly policy: MemoryPolicy = Object.freeze({
    id: "policy:memory:merge:default",
    kind: MemoryPolicyKinds.MERGE,
    name: "Default Memory Merge",
    description:
      "Merges entries with the same category+scope+key; higher priority / later update wins.",
    enabled: true,
  });

  merge(entries: readonly MemoryEntry[]): readonly MemoryEntry[] {
    const byKey = new Map<string, MemoryEntry>();

    for (const entry of sortEntriesDeterministic(entries)) {
      const composite = `${entry.category}|${entry.scope}|${entry.key}`;
      const existing = byKey.get(composite);
      if (!existing) {
        byKey.set(composite, entry);
        continue;
      }
      const winner =
        entry.priority > existing.priority
          ? entry
          : entry.priority < existing.priority
            ? existing
            : entry.updatedAt >= existing.updatedAt
              ? entry
              : existing;
      byKey.set(
        composite,
        freezeEntry({
          ...winner,
          version: Math.max(existing.version, entry.version),
        }),
      );
    }

    return Object.freeze(
      sortEntriesDeterministic([...byKey.values()]),
    );
  }
}

export function createMemoryMergePolicy(): MemoryMergePolicy {
  return new DefaultMemoryMergePolicy();
}
