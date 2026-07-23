import { MemoryCategories } from "../models/MemoryCategory";
import { MemoryQueryModes } from "../models/MemoryQuery";
import { createMemoryTimelineTracker } from "../timeline";
import {
  createCategoryQuery,
  createContextEntry,
  createFixedClock,
  createMemoryUpdateFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { buildMemorySnapshot } from "../builders";
import {
  validateCategoryCompatibility,
  validateMemoryEntry,
  validateMemoryQuery,
  validateMemorySnapshot,
  validateMemoryUpdate,
  validateTimelineIntegrity,
} from "../validators";

describe("conversation-memory validators", () => {
  it("validates entries, queries, updates, categories", () => {
    expect(validateMemoryEntry(createContextEntry()).valid).toBe(true);
    expect(validateMemoryEntry(null).valid).toBe(false);
    expect(
      validateMemoryEntry(createContextEntry({ id: "", key: "" })).valid,
    ).toBe(false);

    expect(validateMemoryQuery(createCategoryQuery()).valid).toBe(true);
    expect(
      validateMemoryQuery({
        ...createCategoryQuery(),
        mode: MemoryQueryModes.BY_CATEGORY,
        category: null,
      }).valid,
    ).toBe(false);

    expect(validateMemoryUpdate(createMemoryUpdateFixture()).valid).toBe(true);
    expect(
      validateMemoryUpdate({
        ...createMemoryUpdateFixture(),
        value: null,
        summary: null,
        priority: null,
        metadata: null,
      }).valid,
    ).toBe(false);

    expect(
      validateCategoryCompatibility(MemoryCategories.PROFILE, "profile").valid,
    ).toBe(true);
    expect(
      validateCategoryCompatibility(MemoryCategories.DECISION, "profile").valid,
    ).toBe(false);
  });

  it("validates snapshot and timeline integrity", () => {
    const snapshot = buildMemorySnapshot({
      id: "snap:1",
      createdAt: FIXED_TIMESTAMP,
      entries: [createContextEntry()],
    });
    expect(validateMemorySnapshot(snapshot).valid).toBe(true);
    expect(
      validateMemorySnapshot({ ...snapshot, entryCount: 99 }).valid,
    ).toBe(false);

    const tracker = createMemoryTimelineTracker({
      clock: createFixedClock(),
    });
    tracker.recordSaved("mem:1", MemoryCategories.CONTEXT);
    const timeline = tracker.snapshot();
    expect(validateTimelineIntegrity(timeline).valid).toBe(true);
    expect(
      validateTimelineIntegrity({
        ...timeline,
        nextSequence: 99,
      }).valid,
    ).toBe(false);
  });
});
