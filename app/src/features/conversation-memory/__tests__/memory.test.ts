import { MemoryCategories } from "../models/MemoryCategory";
import { MemoryOperationKinds } from "../models/MemoryResult";
import { createConversationMemory } from "../memory";
import {
  createContextEntry,
  createDecisionEntry,
  createFixedClock,
  createProfileEntry,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("conversation-memory ConversationMemory", () => {
  it("saves entries, resolves category lanes, and returns frozen results", () => {
    const memory = createConversationMemory({
      memoryId: "memory:unit",
      athleteId: "athlete-1",
      conversationId: "conv-1",
      clock: createFixedClock(),
    });

    const saved = memory.save(createProfileEntry());
    expect(saved.success).toBe(true);
    expect(saved.operation).toBe(MemoryOperationKinds.SAVE);
    expect(saved.entries[0]?.category).toBe(MemoryCategories.PROFILE);
    expect(saved.snapshot).not.toBeNull();
    expect(Object.isFrozen(saved)).toBe(true);
    expect(saved.startedAt).toBe(FIXED_TIMESTAMP);

    memory.save(createContextEntry());
    memory.save(createDecisionEntry());

    const snapshot = memory.buildSnapshot();
    expect(snapshot.success).toBe(true);
    expect(snapshot.snapshot?.profile.entryCount).toBe(1);
    expect(snapshot.snapshot?.context.entryCount).toBe(1);
    expect(snapshot.snapshot?.decision.entryCount).toBe(1);
  });

  it("loads and rejects invalid entries", () => {
    const memory = createConversationMemory({ clock: createFixedClock() });
    memory.save(createContextEntry());

    const loaded = memory.load("mem:context:1");
    expect(loaded.success).toBe(true);
    expect(loaded.entries).toHaveLength(1);

    const missing = memory.load("missing");
    expect(missing.success).toBe(false);

    const invalid = memory.save(
      createContextEntry({ id: "", key: "", value: "" }),
    );
    expect(invalid.success).toBe(false);
  });
});
