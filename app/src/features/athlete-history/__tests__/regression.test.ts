import { buildAthleteHistory } from "../application";
import { HistoryEntryTypes } from "../models/HistoryEntryType";
import {
  createAchievementResultFixture,
  createFullBuildInputs,
  createHistoryEntryFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { sortHistoryEntries } from "../utils/sortEntries";
import { normalizeHistoryEntries } from "../utils/normalizeHistory";

describe("athlete-history regression", () => {
  it("keeps only implemented entry types from current domain inputs", () => {
    const result = buildAthleteHistory({
      ...createFullBuildInputs(),
      builtAt: FIXED_TIMESTAMP,
    });

    const allowed = new Set<string>([
      HistoryEntryTypes.WORKOUT,
      HistoryEntryTypes.PERFORMANCE,
      HistoryEntryTypes.ACHIEVEMENT,
    ]);

    for (const entry of result.history.entries) {
      expect(allowed.has(entry.type)).toBe(true);
    }
  });

  it("is deterministic for the same inputs", () => {
    const inputs = createFullBuildInputs();
    const a = buildAthleteHistory({
      ...inputs,
      builtAt: FIXED_TIMESTAMP,
      historyId: "hist-fixed",
      snapshotId: "snap-fixed",
    });
    const b = buildAthleteHistory({
      ...inputs,
      builtAt: FIXED_TIMESTAMP,
      historyId: "hist-fixed",
      snapshotId: "snap-fixed",
    });

    expect(a.history.entries.map((e) => e.id)).toEqual(
      b.history.entries.map((e) => e.id),
    );
    expect(a.summary.summaryText).toBe(b.summary.summaryText);
    expect(a.snapshot.statistics).toEqual(b.snapshot.statistics);
  });

  it("preserves chronological ordering after normalize", () => {
    const entries = [
      createHistoryEntryFixture({
        id: "c",
        occurredAt: "2026-07-23T15:00:00.000Z",
      }),
      createHistoryEntryFixture({
        id: "a",
        occurredAt: "2026-07-23T10:00:00.000Z",
      }),
      createHistoryEntryFixture({
        id: "b",
        occurredAt: "2026-07-23T12:00:00.000Z",
      }),
    ];

    const sorted = sortHistoryEntries(entries);
    const normalized = normalizeHistoryEntries(entries);

    expect(sorted.map((e) => e.id)).toEqual(["a", "b", "c"]);
    expect(normalized.map((e) => e.id)).toEqual(["a", "b", "c"]);
  });

  it("does not invent nutrition/recovery/sleep entries", () => {
    const result = buildAthleteHistory({
      workoutResult: createFullBuildInputs().workoutResult,
      achievementResult: createAchievementResultFixture({ unlockedCount: 1 }),
      builtAt: FIXED_TIMESTAMP,
    });

    expect(
      result.history.entries.some(
        (e) =>
          e.type === HistoryEntryTypes.NUTRITION ||
          e.type === HistoryEntryTypes.RECOVERY ||
          e.type === HistoryEntryTypes.SLEEP,
      ),
    ).toBe(false);
  });

  it("links related entities via references", () => {
    const result = buildAthleteHistory({
      ...createFullBuildInputs(),
      builtAt: FIXED_TIMESTAMP,
    });

    const kinds = new Set(
      result.history.references.map((r) => r.kind),
    );
    expect(kinds.has("workout_runtime")).toBe(true);
    expect(kinds.has("performance_snapshot")).toBe(true);
    expect(kinds.has("achievement")).toBe(true);
  });
});
