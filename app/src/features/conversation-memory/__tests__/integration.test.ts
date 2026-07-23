import {
  buildMemorySnapshot,
  queryMemory,
  saveMemory,
  summarizeMemory,
} from "../application";
import { buildMemoryQuery } from "../builders";
import { MemoryCategories } from "../models/MemoryCategory";
import { MemoryQueryModes } from "../models/MemoryQuery";
import {
  createContextEntry,
  createDecisionEntry,
  createProfileEntry,
  createTestMemoryService,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("conversation-memory integration", () => {
  it("flows Coach Agent → Conversation Memory → lanes → snapshot → result", () => {
    const service = createTestMemoryService();

    // Coach Agent would persist structured knowledge (not chat turns)
    expect(
      saveMemory({ service, entry: createProfileEntry() }).success,
    ).toBe(true);
    expect(
      saveMemory({ service, entry: createContextEntry() }).success,
    ).toBe(true);
    expect(
      saveMemory({ service, entry: createDecisionEntry() }).success,
    ).toBe(true);

    const decisionQuery = queryMemory({
      service,
      query: buildMemoryQuery({
        id: "q:decisions",
        createdAt: FIXED_TIMESTAMP,
        mode: MemoryQueryModes.BY_CATEGORY,
        category: MemoryCategories.DECISION,
      }),
    });
    expect(decisionQuery.entries).toHaveLength(1);

    const snapshotResult = buildMemorySnapshot({ service, turnCount: 3 });
    expect(snapshotResult.success).toBe(true);
    expect(snapshotResult.snapshot?.profile.entries[0]?.key).toBe(
      "experience_level",
    );
    expect(snapshotResult.snapshot?.context.turnCount).toBe(3);
    expect(snapshotResult.snapshot?.decision.acceptedCount).toBe(1);
    expect(snapshotResult.timeline?.eventCount).toBeGreaterThan(0);

    const summary = summarizeMemory({ service });
    expect(summary.summary?.categories).toEqual(
      expect.arrayContaining([
        MemoryCategories.PROFILE,
        MemoryCategories.CONTEXT,
        MemoryCategories.DECISION,
      ]),
    );
  });
});
