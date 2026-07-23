import { saveMemory, updateMemory } from "../application";
import { MemoryCategories } from "../models/MemoryCategory";
import { MemoryPriorities } from "../models/MemoryPriority";
import {
  createContextEntry,
  createMemoryUpdateFixture,
  createTestMemoryService,
} from "../testSupport/fixtures";

describe("conversation-memory regression", () => {
  it("does not treat memory as chat history and keeps immutability", () => {
    const service = createTestMemoryService({ maxEntries: 2 });

    const first = saveMemory({
      service,
      entry: createContextEntry({
        id: "m1",
        key: "focus",
        value: "hypertrophy",
        priority: MemoryPriorities.LOW,
      }),
    });
    expect(first.message).not.toMatch(/chat|message history/i);
    expect(first.entries[0]?.category).toBe(MemoryCategories.CONTEXT);

    saveMemory({
      service,
      entry: createContextEntry({
        id: "m2",
        key: "equipment",
        value: "dumbbells",
        priority: MemoryPriorities.CRITICAL,
      }),
    });
    saveMemory({
      service,
      entry: createContextEntry({
        id: "m3",
        key: "tempo",
        value: "slow",
        priority: MemoryPriorities.NORMAL,
      }),
    });

    const working = service.getMemory().listEntries();
    expect(working).toHaveLength(2);
    expect(working.map((e) => e.id)).toContain("m2");

    const original = working.find((e) => e.id === "m2")!;
    const updated = updateMemory({
      service,
      update: createMemoryUpdateFixture("m2"),
    });
    expect(updated.entries[0]?.value).toBe("strength");
    expect(original.value).toBe("dumbbells");
    expect(Object.isFrozen(original)).toBe(true);
  });
});
