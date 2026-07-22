import {
  createProgressionRequest,
  createTestProgressionContext,
} from "../../testSupport/fixtures";
import { normalizeExerciseProgression } from "../../utils/normalizeTimeline";
import { ExerciseRotationStrategy } from "../ExerciseRotationStrategy";
import { FrequencyProgressionStrategy } from "../FrequencyProgressionStrategy";
import { IntensityProgressionStrategy } from "../IntensityProgressionStrategy";
import { LinearProgressionStrategy } from "../LinearProgressionStrategy";
import { VolumeProgressionStrategy } from "../VolumeProgressionStrategy";
import { createDefaultStrategies } from "../index";

async function primaryProgression() {
  const request = await createProgressionRequest();
  const context = await createTestProgressionContext();
  const prescription = request.programming.prescriptions.find(
    (entry) => entry.role === "primary",
  )!;
  return normalizeExerciseProgression(prescription, context);
}

describe("progression strategies", () => {
  it("createDefaultStrategies returns the expected pipeline", () => {
    const ids = createDefaultStrategies().map((strategy) => strategy.id);
    expect(ids).toEqual([
      "linear",
      "volume",
      "intensity",
      "frequency",
      "exercise_rotation",
    ]);
  });

  it("LinearProgressionStrategy sets increasing difficulty trend", async () => {
    const before = await primaryProgression();
    const context = await createTestProgressionContext();
    const after = new LinearProgressionStrategy().apply(before, context);
    expect(after.steps[0]!.expectedDifficultyTrend).toBe("stable");
    expect(after.steps[1]!.expectedDifficultyTrend).toBe("increasing");
    expect(Object.isFrozen(after)).toBe(true);
  });

  it("VolumeProgressionStrategy increases volume over weeks", async () => {
    const before = await primaryProgression();
    const context = await createTestProgressionContext();
    const after = new VolumeProgressionStrategy().apply(before, context);
    const first = after.steps[0]!;
    const last = after.steps[after.steps.length - 1]!;
    expect(last.target.volumeRepMax).toBeGreaterThanOrEqual(
      first.target.volumeRepMax,
    );
    expect(after.steps.every((step) => step.expectedVolumeTrend !== "decreasing")).toBe(
      true,
    );
  });

  it("IntensityProgressionStrategy evolves intensity without load", async () => {
    const before = await primaryProgression();
    const context = await createTestProgressionContext();
    const after = new IntensityProgressionStrategy().apply(before, context);
    expect(after).not.toHaveProperty("loadKg");
    expect(after.steps[0]!.target.intensityValue).not.toBeNull();
  });

  it("FrequencyProgressionStrategy sets frequency sessions", async () => {
    const before = await primaryProgression();
    const context = await createTestProgressionContext();
    const after = new FrequencyProgressionStrategy().apply(before, context);
    expect(
      after.steps.every((step) => step.target.frequencySessionsPerWeek >= 1),
    ).toBe(true);
  });

  it("ExerciseRotationStrategy preserves exercise id continuity", async () => {
    const before = await primaryProgression();
    const context = await createTestProgressionContext();
    const after = new ExerciseRotationStrategy().apply(before, context);
    expect(
      after.steps.every((step) => step.exerciseId === before.exerciseId),
    ).toBe(true);
    expect(after.steps.every((step) => step.target.rotationIndex === 0)).toBe(
      true,
    );
  });
});
