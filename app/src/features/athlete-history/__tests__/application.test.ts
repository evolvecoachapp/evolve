import {
  createHistoryEntryFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { aggregateReferences } from "../utils/aggregateReferences";
import { formatHistoryEntry } from "../utils/formatting";
import { freezeHistoryEntry } from "../utils/freezeHistory";
import {
  dedupeHistoryEntries,
  historyEntryIdentity,
} from "../utils/normalizeHistory";

describe("athlete-history application helpers", () => {
  it("formatHistoryEntry produces readable line", () => {
    const entry = createHistoryEntryFixture({ title: "Workout completed" });
    expect(formatHistoryEntry(entry)).toContain("Workout completed");
    expect(formatHistoryEntry(entry)).toContain(FIXED_TIMESTAMP);
  });

  it("dedupeHistoryEntries keeps first occurrence", () => {
    const a = createHistoryEntryFixture({ id: "same" });
    const b = createHistoryEntryFixture({
      id: "same",
      title: "Other title",
    });
    const deduped = dedupeHistoryEntries([a, b]);
    expect(deduped).toHaveLength(1);
    expect(deduped[0].title).toBe(a.title);
    expect(historyEntryIdentity(a)).toBe("workout:same");
  });

  it("aggregateReferences dedupes by kind+id", () => {
    const a = createHistoryEntryFixture({ id: "a" });
    const b = createHistoryEntryFixture({ id: "b" });
    const refs = aggregateReferences([a, b]);
    expect(refs).toHaveLength(1);
    expect(refs[0].kind).toBe("workout_runtime");
  });

  it("freezeHistoryEntry deep-freezes nested bags", () => {
    const entry = freezeHistoryEntry(createHistoryEntryFixture());
    expect(Object.isFrozen(entry)).toBe(true);
    expect(Object.isFrozen(entry.metadata)).toBe(true);
    expect(Object.isFrozen(entry.references)).toBe(true);
  });
});
