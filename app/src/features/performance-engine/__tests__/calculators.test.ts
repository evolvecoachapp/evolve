import { VolumeCalculator } from "../calculators/VolumeCalculator";
import { IntensityCalculator } from "../calculators/IntensityCalculator";
import { DensityCalculator } from "../calculators/DensityCalculator";
import { CompletionCalculator } from "../calculators/CompletionCalculator";
import { DurationCalculator } from "../calculators/DurationCalculator";
import {
  COMPLETED_AT,
  STARTED_AT,
  createCompletedWorkoutResult,
} from "../testSupport/fixtures";

describe("performance-engine calculators", () => {
  const sets = Object.freeze([
    Object.freeze({
      setRuntimeId: "s1",
      exerciseRuntimeId: "e1",
      setIndex: 1,
      weight: 100,
      repetitions: 5,
      rpe: 8,
      rir: 2,
    }),
    Object.freeze({
      setRuntimeId: "s2",
      exerciseRuntimeId: "e1",
      setIndex: 2,
      weight: 100,
      repetitions: 5,
      rpe: 9,
      rir: 1,
    }),
    Object.freeze({
      setRuntimeId: "s3",
      exerciseRuntimeId: "e2",
      setIndex: 1,
      weight: null,
      repetitions: 10,
      rpe: null,
      rir: null,
    }),
  ]);

  it("VolumeCalculator computes tonnage and loaded/unloaded sets", () => {
    const volume = new VolumeCalculator().calculate(sets);
    expect(volume.tonnage).toBe(1000);
    expect(volume.volumeLoad).toBe(1000);
    expect(volume.totalCompletedSets).toBe(3);
    expect(volume.totalCompletedRepetitions).toBe(20);
    expect(volume.loadedSetCount).toBe(2);
    expect(volume.unloadedSetCount).toBe(1);
  });

  it("IntensityCalculator averages available samples only", () => {
    const intensity = new IntensityCalculator().calculate(sets);
    expect(intensity.averageWeight).toBe(100);
    expect(intensity.averageRepetitions).toBeCloseTo(20 / 3);
    expect(intensity.averageRpe).toBe(8.5);
    expect(intensity.averageRir).toBe(1.5);
    expect(intensity.maxWeight).toBe(100);
    expect(intensity.weightSampleCount).toBe(2);
    expect(intensity.rpeSampleCount).toBe(2);
  });

  it("IntensityCalculator returns null averages for empty sets", () => {
    const intensity = new IntensityCalculator().calculate([]);
    expect(intensity.averageWeight).toBeNull();
    expect(intensity.averageRpe).toBeNull();
  });

  it("DurationCalculator computes duration and rejects inverted timestamps", () => {
    const calculator = new DurationCalculator();
    expect(calculator.calculateMs(STARTED_AT, COMPLETED_AT)).toBe(45 * 60_000);
    expect(calculator.calculateMs(null, COMPLETED_AT)).toBe(0);
    expect(calculator.calculateMs(COMPLETED_AT, STARTED_AT)).toBe(0);
    expect(calculator.calculateMinutes(120_000)).toBe(2);
  });

  it("DensityCalculator avoids division by zero", () => {
    const density = new DensityCalculator().calculate({
      durationMs: 0,
      tonnage: 1000,
      completedSets: 4,
      completedRepetitions: 20,
    });
    expect(density.tonnagePerMinute).toBeNull();
    expect(density.setsPerMinute).toBeNull();
    expect(density.repetitionsPerMinute).toBeNull();

    const withDuration = new DensityCalculator().calculate({
      durationMs: 60_000,
      tonnage: 1000,
      completedSets: 4,
      completedRepetitions: 20,
    });
    expect(withDuration.tonnagePerMinute).toBe(1000);
    expect(withDuration.setsPerMinute).toBe(4);
  });

  it("CompletionCalculator uses WorkoutResult progress", () => {
    const completion = new CompletionCalculator().calculate(
      createCompletedWorkoutResult({
        progress: Object.freeze({
          totalExercises: 2,
          completedExercises: 1,
          skippedExercises: 1,
          remainingExercises: 0,
          totalSets: 4,
          completedSets: 2,
          skippedSets: 2,
          remainingSets: 0,
          completionPercent: 50,
        }),
      }),
    );
    expect(completion.exerciseCompletionPercent).toBe(50);
    expect(completion.setCompletionPercent).toBe(50);
    expect(completion.workoutCompletionPercent).toBe(50);
  });
});
