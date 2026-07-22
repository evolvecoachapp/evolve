import { createSelectionCatalog } from "../../../exercise-selection/testSupport/fixtures";
import { createEmptyProgrammingScore } from "../../models/ProgrammingScore";
import {
  createProgrammingCandidate,
  createTestProgrammingContext,
} from "../../testSupport/fixtures";
import { normalizePrescription } from "../../utils/normalizePrescription";
import { ExerciseOrderStrategy } from "../ExerciseOrderStrategy";
import { IntensityStrategy } from "../IntensityStrategy";
import { PriorityStrategy } from "../PriorityStrategy";
import { RestStrategy } from "../RestStrategy";
import { TempoStrategy } from "../TempoStrategy";
import { VolumeStrategy } from "../VolumeStrategy";
import { createDefaultStrategies } from "../index";

function primaryPrescription() {
  const catalog = createSelectionCatalog();
  const bench = catalog.find((entry) => entry.id === "bench-press")!;
  return normalizePrescription(
    createProgrammingCandidate(bench, "primary", 1),
  );
}

describe("programming strategies", () => {
  const context = createTestProgrammingContext();

  it("createDefaultStrategies returns the expected pipeline", () => {
    const ids = createDefaultStrategies().map((strategy) => strategy.id);
    expect(ids).toEqual([
      "volume",
      "intensity",
      "rest",
      "tempo",
      "exercise_order",
      "priority",
    ]);
  });

  it("VolumeStrategy assigns sets and rep ranges immutably", () => {
    const before = primaryPrescription();
    const after = new VolumeStrategy().apply(before, context);
    expect(after.volume.sets).toBeGreaterThan(0);
    expect(after.sets.length).toBe(after.volume.sets);
    expect(after.volume.repMax).toBeGreaterThanOrEqual(after.volume.repMin);
    expect(Object.isFrozen(after)).toBe(true);
    expect(before.volume.sets).toBe(0);
  });

  it("IntensityStrategy assigns RPE/RIR without load", () => {
    const volume = new VolumeStrategy().apply(primaryPrescription(), context);
    const after = new IntensityStrategy().apply(volume, context);
    expect(after.intensity.metric).toMatch(/rpe|rir/);
    expect(after.intensity.value).not.toBeNull();
    expect(after.sets.every((set) => set.targetRpe !== null)).toBe(true);
    expect(after).not.toHaveProperty("loadKg");
  });

  it("RestStrategy assigns positive rest seconds", () => {
    const after = new RestStrategy().apply(primaryPrescription(), context);
    expect(after.rest.seconds).toBeGreaterThan(0);
    expect(after.rest.betweenSetsSeconds).toBe(after.rest.seconds);
  });

  it("TempoStrategy assigns or omits tempo deterministically", () => {
    const after = new TempoStrategy().apply(primaryPrescription(), context);
    expect(after.tempo === null || after.tempo.eccentricSeconds > 0).toBe(true);
  });

  it("ExerciseOrderStrategy sets role-based order", () => {
    const after = new ExerciseOrderStrategy().apply(
      primaryPrescription(),
      context,
    );
    expect(after.order).toBe(101);
  });

  it("PriorityStrategy sets relative priority", () => {
    const after = new PriorityStrategy().apply(primaryPrescription(), context);
    expect(after.priority).toBeGreaterThanOrEqual(100);
  });

  it("strategies remain independent and do not mutate inputs", () => {
    const input = primaryPrescription();
    const scoreBefore = input.score;
    new VolumeStrategy().apply(input, context);
    expect(input.score).toBe(scoreBefore);
    expect(createEmptyProgrammingScore().volume).toBe(0);
  });

});
