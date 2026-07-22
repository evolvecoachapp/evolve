import { buildAthleteHistory } from "../application";
import { HistoryEntryCategories } from "../models/HistoryEntryCategory";
import { HistoryEntryTypes } from "../models/HistoryEntryType";
import {
  createFullBuildInputs,
  createHistoryEntryFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import {
  validateBuildInput,
  validateCategories,
  validateChronologicalOrder,
  validateDuplicates,
  validateHistoryEntries,
  validateReferences,
  validateSnapshotConsistency,
  validateTimestamps,
} from "../validators";

describe("athlete-history validators", () => {
  it("detects duplicate entries", () => {
    const entry = createHistoryEntryFixture({ id: "dup-1" });
    const issues = validateDuplicates([entry, entry]);
    expect(issues.some((i) => i.startsWith("duplicate_entry:"))).toBe(true);
  });

  it("detects chronology violations", () => {
    const later = createHistoryEntryFixture({
      id: "later",
      occurredAt: "2026-07-23T14:00:00.000Z",
    });
    const earlier = createHistoryEntryFixture({
      id: "earlier",
      occurredAt: "2026-07-23T10:00:00.000Z",
    });
    const issues = validateChronologicalOrder([later, earlier]);
    expect(issues.some((i) => i.startsWith("chronology_violation:"))).toBe(
      true,
    );
  });

  it("detects invalid timestamps", () => {
    const bad = {
      ...createHistoryEntryFixture(),
      occurredAt: "not-a-date",
    };
    const issues = validateTimestamps([bad]);
    expect(issues.some((i) => i.startsWith("invalid_occurred_at:"))).toBe(true);
  });

  it("detects broken references", () => {
    const bad = {
      ...createHistoryEntryFixture(),
      references: Object.freeze([
        Object.freeze({ kind: "", id: "", label: null }),
      ]),
    };
    const issues = validateReferences([bad]);
    expect(issues.some((i) => i.startsWith("broken_reference:"))).toBe(true);
  });

  it("detects invalid categories for known types", () => {
    const bad = createHistoryEntryFixture({
      type: HistoryEntryTypes.WORKOUT,
      category: HistoryEntryCategories.ACHIEVEMENT,
    });
    const issues = validateCategories([bad]);
    expect(
      issues.some((i) => i.startsWith("invalid_category_for_type:")),
    ).toBe(true);
  });

  it("allows future unknown entry types", () => {
    const future = createHistoryEntryFixture({
      type: HistoryEntryTypes.NUTRITION,
      category: HistoryEntryCategories.NUTRITION,
    });
    expect(validateCategories([future])).toHaveLength(0);
  });

  it("validateBuildInput flags mismatches", () => {
    const inputs = createFullBuildInputs();
    const mismatched = {
      ...inputs.achievementResult,
      runtimeId: "other-runtime",
    };
    const issues = validateBuildInput(
      inputs.workoutResult,
      inputs.performanceSnapshot,
      mismatched,
    );
    expect(issues).toContain("workout_achievement_runtime_mismatch");
  });

  it("validateSnapshotConsistency passes for engine output", () => {
    const result = buildAthleteHistory({
      ...createFullBuildInputs(),
      builtAt: FIXED_TIMESTAMP,
    });
    expect(
      validateSnapshotConsistency(result.history, result.snapshot),
    ).toHaveLength(0);
  });

  it("validateHistoryEntries aggregates soft issues", () => {
    const entry = createHistoryEntryFixture();
    expect(validateHistoryEntries([entry])).toEqual([]);
  });
});
