import { IntensityMetric } from "../../../training/enums/IntensityMetric";
import { SetType } from "../../../training/enums/SetType";
import type { WorkoutPreviewDay, WorkoutSessionSet } from "../../../training/application";
import {
  countSessionSets,
  estimatePreviewDayDurationMinutes,
  formatSessionExerciseIntensity,
  formatSessionRest,
  formatSessionSetLine,
  formatSessionSetsSummary,
} from "../sessionPresentationFormatters";

function createSet(
  overrides: Partial<WorkoutSessionSet> & Pick<WorkoutSessionSet, "id">,
): WorkoutSessionSet {
  return Object.freeze({
    order: 0,
    setType: SetType.Working,
    setTypeLabel: "Working",
    targetReps: Object.freeze({ min: 8, max: 12, label: "8–12" }),
    intensity: Object.freeze({
      metric: IntensityMetric.Rir,
      value: 2,
      label: "RIR 2",
    }),
    restSeconds: 120,
    prescriptionNotes: null,
    notes: null,
    completed: false,
    completedReps: null,
    completedLoad: null,
    ...overrides,
  });
}

describe("sessionPresentationFormatters", () => {
  it("formats rest, set lines, summaries, and intensity", () => {
    expect(formatSessionRest(120)).toBe("2:00 rest");
    expect(formatSessionRest(90)).toBe("1:30 rest");
    expect(formatSessionRest(45)).toBe("45s rest");
    expect(formatSessionRest(null)).toBe("—");

    const set = createSet({ id: "set:1" });
    expect(formatSessionSetLine(set)).toBe("Working · 8–12 reps · RIR 2 · 2:00 rest");
    expect(formatSessionSetsSummary([set, createSet({ id: "set:2" })])).toBe("2 × 8–12");
    expect(formatSessionExerciseIntensity([set])).toBe("RIR 2");
    expect(formatSessionExerciseIntensity([])).toBe("—");
  });

  it("counts sets and estimates duration from a preview day", () => {
    const day: WorkoutPreviewDay = Object.freeze({
      id: "day:1",
      dayIndex: 0,
      name: "Upper A",
      isRestDay: false,
      primaryFocus: Object.freeze(["Chest"]),
      exercises: Object.freeze([
        Object.freeze({
          id: "ex:1",
          name: "Bench",
          order: 0,
          sets: Object.freeze([
            Object.freeze({
              id: "set:1",
              setType: SetType.Working,
              setTypeLabel: "Working",
              reps: Object.freeze({ min: 8, max: 10, label: "8–10" }),
              intensity: null,
              restSeconds: 60,
              notes: null,
            }),
            Object.freeze({
              id: "set:2",
              setType: SetType.Working,
              setTypeLabel: "Working",
              reps: Object.freeze({ min: 8, max: 10, label: "8–10" }),
              intensity: null,
              restSeconds: 60,
              notes: null,
            }),
          ]),
          progressionSummary: null,
          supersetGroup: null,
        }),
      ]),
    });

    expect(estimatePreviewDayDurationMinutes(day)).toBeGreaterThan(0);
    expect(
      countSessionSets([
        Object.freeze({
          id: "ex:1",
          name: "Bench",
          order: 0,
          sets: Object.freeze([createSet({ id: "a" }), createSet({ id: "b" })]),
          notes: null,
          completed: false,
          skipped: false,
          progressionReference: null,
          supersetGroup: null,
        }),
      ]),
    ).toBe(2);
  });
});
