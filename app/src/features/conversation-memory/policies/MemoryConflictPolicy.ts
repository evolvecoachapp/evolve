import type { MemoryEntry } from "../models/MemoryEntry";
import type { MemoryPolicy } from "../models/MemoryPolicy";
import { MemoryPolicyKinds } from "../models/MemoryPolicy";

export interface MemoryConflict {
  readonly leftEntryId: string;
  readonly rightEntryId: string;
  readonly key: string;
  readonly reason: string;
}

/**
 * Deterministic conflict detection for same-key differing values.
 * No resolution business logic beyond reporting.
 */
export interface MemoryConflictPolicy {
  readonly policy: MemoryPolicy;
  findConflicts(entries: readonly MemoryEntry[]): readonly MemoryConflict[];
  resolveWinner(
    left: MemoryEntry,
    right: MemoryEntry,
  ): MemoryEntry;
}

export class DefaultMemoryConflictPolicy implements MemoryConflictPolicy {
  readonly policy: MemoryPolicy = Object.freeze({
    id: "policy:memory:conflict:default",
    kind: MemoryPolicyKinds.CONFLICT,
    name: "Default Memory Conflict",
    description:
      "Detects same category+scope+key with different values; higher priority / later update wins.",
    enabled: true,
  });

  findConflicts(entries: readonly MemoryEntry[]): readonly MemoryConflict[] {
    const conflicts: MemoryConflict[] = [];
    const groups = new Map<string, MemoryEntry[]>();

    for (const entry of entries) {
      const composite = `${entry.category}|${entry.scope}|${entry.key}`;
      const list = groups.get(composite) ?? [];
      list.push(entry);
      groups.set(composite, list);
    }

    for (const [key, group] of groups) {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          if (group[i].value !== group[j].value) {
            conflicts.push(
              Object.freeze({
                leftEntryId: group[i].id,
                rightEntryId: group[j].id,
                key,
                reason: "value_mismatch_same_key",
              }),
            );
          }
        }
      }
    }

    return Object.freeze(conflicts);
  }

  resolveWinner(left: MemoryEntry, right: MemoryEntry): MemoryEntry {
    if (left.priority !== right.priority) {
      return left.priority > right.priority ? left : right;
    }
    if (left.updatedAt !== right.updatedAt) {
      return left.updatedAt >= right.updatedAt ? left : right;
    }
    return left.id <= right.id ? left : right;
  }
}

export function createMemoryConflictPolicy(): MemoryConflictPolicy {
  return new DefaultMemoryConflictPolicy();
}
