import {
  AthleteHistoryBuilder,
  HistoryEntryBuilder,
  HistorySnapshotBuilder,
  HistorySummaryBuilder,
} from "../builders";
import { HistoryStatisticsAggregator } from "../aggregators";
import { HistoryEntryCategories } from "../models/HistoryEntryCategory";
import { HistoryEntryTypes } from "../models/HistoryEntryType";
import {
  createHistoryContext,
  createHistoryEntryFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("athlete-history builders", () => {
  it("HistoryEntryBuilder produces frozen entries", () => {
    const entry = new HistoryEntryBuilder()
      .withId("hist:custom:1")
      .withType(HistoryEntryTypes.WORKOUT)
      .withCategory(HistoryEntryCategories.TRAINING)
      .withOccurredAt(FIXED_TIMESTAMP)
      .withTitle("Custom")
      .withDescription("desc")
      .withEvidence(
        Object.freeze({
          sourceType: "Test",
          sourceId: "1",
          attributes: Object.freeze({}),
        }),
      )
      .withContext(createHistoryContext())
      .withFrozenAt(FIXED_TIMESTAMP)
      .build();

    expect(Object.isFrozen(entry)).toBe(true);
    expect(Object.isFrozen(entry.evidence)).toBe(true);
  });

  it("AthleteHistoryBuilder normalizes and freezes history", () => {
    const a = createHistoryEntryFixture({
      id: "hist:a",
      occurredAt: "2026-07-23T11:00:00.000Z",
    });
    const b = createHistoryEntryFixture({
      id: "hist:b",
      occurredAt: "2026-07-23T10:00:00.000Z",
    });

    const history = new AthleteHistoryBuilder()
      .withId("hist-1")
      .withAthleteId(null)
      .withEntries([a, b])
      .withContext(createHistoryContext())
      .withBuiltAt(FIXED_TIMESTAMP)
      .withFrozenAt(FIXED_TIMESTAMP)
      .build();

    expect(history.entryCount).toBe(2);
    expect(history.entries[0].id).toBe("hist:b");
    expect(history.entries[1].id).toBe("hist:a");
    expect(Object.isFrozen(history)).toBe(true);
  });

  it("HistorySummaryBuilder builds from entries", () => {
    const summary = new HistorySummaryBuilder()
      .fromEntries("hist-1", null, [createHistoryEntryFixture()])
      .build();
    expect(summary.entryCount).toBe(1);
    expect(summary.workoutCount).toBe(1);
  });

  it("HistorySnapshotBuilder requires statistics and summary", () => {
    const entries = [createHistoryEntryFixture()];
    const summary = new HistorySummaryBuilder()
      .fromEntries("hist-1", null, entries)
      .build();
    const statistics = new HistoryStatisticsAggregator().aggregate(entries);

    const snapshot = new HistorySnapshotBuilder()
      .withId("snap-1")
      .withHistoryId("hist-1")
      .withEntries(entries)
      .withStatistics(statistics)
      .withSummary(summary)
      .withCreatedAt(FIXED_TIMESTAMP)
      .withFrozenAt(FIXED_TIMESTAMP)
      .build();

    expect(snapshot.entryCount).toBe(1);
    expect(Object.isFrozen(snapshot)).toBe(true);
  });

  it("throws when required fields are missing", () => {
    expect(() => new HistoryEntryBuilder().build()).toThrow(
      /missing required fields/,
    );
    expect(() => new AthleteHistoryBuilder().build()).toThrow(
      /missing required fields/,
    );
  });
});
