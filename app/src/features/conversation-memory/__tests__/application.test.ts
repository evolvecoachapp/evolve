import {
  buildMemorySnapshot,
  loadMemory,
  queryMemory,
  saveMemory,
  summarizeMemory,
  updateMemory,
} from "../application";
import { MemoryOperationKinds } from "../models/MemoryResult";
import {
  createCategoryQuery,
  createContextEntry,
  createMemoryUpdateFixture,
  createProfileEntry,
  createTestMemoryService,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("conversation-memory application", () => {
  it("exposes public API without internals", () => {
    const service = createTestMemoryService();

    const saved = saveMemory({ service, entry: createProfileEntry() });
    expect(saved.success).toBe(true);
    expect(saved.operation).toBe(MemoryOperationKinds.SAVE);
    expect(Object.isFrozen(saved)).toBe(true);

    saveMemory({ service, entry: createContextEntry() });

    const loaded = loadMemory({ service, entryId: "mem:context:1" });
    expect(loaded.success).toBe(true);

    const queried = queryMemory({
      service,
      query: createCategoryQuery(),
    });
    expect(queried.entries).toHaveLength(1);

    const updated = updateMemory({
      service,
      update: createMemoryUpdateFixture("mem:context:1"),
    });
    expect(updated.success).toBe(true);
    expect(updated.entries[0]?.value).toBe("strength");
    expect(updated.entries[0]?.version).toBe(2);

    const snapshot = buildMemorySnapshot({ service });
    expect(snapshot.snapshot?.entryCount).toBe(2);

    const summary = summarizeMemory({ service });
    expect(summary.summary?.entryCount).toBe(2);
    expect(summary.startedAt).toBe(FIXED_TIMESTAMP);
  });
});
