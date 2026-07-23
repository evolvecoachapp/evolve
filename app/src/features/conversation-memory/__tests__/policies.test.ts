import {
  createMemoryConflictPolicy,
  createMemoryMergePolicy,
  createMemoryRetentionPolicy,
} from "../policies";
import { MemoryPriorities } from "../models/MemoryPriority";
import {
  createContextEntry,
  FIXED_TIMESTAMP,
  FIXED_TIMESTAMP_LATER,
} from "../testSupport/fixtures";

describe("conversation-memory policies", () => {
  it("retains highest priority entries within max", () => {
    const retention = createMemoryRetentionPolicy();
    const entries = [
      createContextEntry({
        id: "a",
        priority: MemoryPriorities.LOW,
        key: "a",
      }),
      createContextEntry({
        id: "b",
        priority: MemoryPriorities.CRITICAL,
        key: "b",
      }),
      createContextEntry({
        id: "c",
        priority: MemoryPriorities.NORMAL,
        key: "c",
      }),
    ];
    const kept = retention.retain(entries, 2);
    expect(kept.map((e) => e.id)).toContain("b");
    expect(kept).toHaveLength(2);
  });

  it("merges same key by priority / time and detects conflicts", () => {
    const merge = createMemoryMergePolicy();
    const conflict = createMemoryConflictPolicy();

    const left = createContextEntry({
      id: "left",
      key: "focus",
      value: "hypertrophy",
      priority: MemoryPriorities.NORMAL,
      updatedAt: FIXED_TIMESTAMP,
    });
    const right = createContextEntry({
      id: "right",
      key: "focus",
      value: "strength",
      priority: MemoryPriorities.HIGH,
      updatedAt: FIXED_TIMESTAMP_LATER,
    });

    const merged = merge.merge([left, right]);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.value).toBe("strength");

    const conflicts = conflict.findConflicts([left, right]);
    expect(conflicts).toHaveLength(1);
    expect(conflict.resolveWinner(left, right).id).toBe("right");
  });
});
