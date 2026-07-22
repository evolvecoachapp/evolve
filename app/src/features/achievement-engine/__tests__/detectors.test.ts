import {
  CompletedSetsPRDetector,
  DensityPRDetector,
  ExerciseVolumeDetector,
  RepetitionPRDetector,
  SessionVolumeDetector,
  TonnagePRDetector,
  VolumePRDetector,
  WeightPRDetector,
} from "../detectors";
import {
  createAchievementContext,
  createBaselineProvider,
  createPerformanceSnapshotFixture,
  createWorkoutResultFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

function detectionInput(
  baselines: Parameters<typeof createBaselineProvider>[0] = {},
  exerciseVolumes: Record<string, number> = {},
) {
  return {
    performanceSnapshot: createPerformanceSnapshotFixture(),
    workoutResult: createWorkoutResultFixture(),
    baselineProvider: createBaselineProvider(baselines, exerciseVolumes),
    context: createAchievementContext(),
    evaluatedAt: FIXED_TIMESTAMP,
  };
}

describe("achievement-engine detectors", () => {
  it("WeightPRDetector unlocks when max weight exceeds baseline", () => {
    const records = new WeightPRDetector().detect(
      detectionInput({ highest_weight: 90 }),
    );
    expect(records).toHaveLength(1);
    expect(records[0].personalRecordType).toBe("highest_weight");
    expect(records[0].evidence.currentValue).toBe(100);
  });

  it("WeightPRDetector stays silent when below baseline", () => {
    const records = new WeightPRDetector().detect(
      detectionInput({ highest_weight: 150 }),
    );
    expect(records).toHaveLength(0);
  });

  it("VolumePRDetector and TonnagePRDetector detect volume metrics", () => {
    const volume = new VolumePRDetector().detect(
      detectionInput({ highest_volume: 100 }),
    );
    const tonnage = new TonnagePRDetector().detect(
      detectionInput({ highest_tonnage: 100 }),
    );
    expect(volume[0].personalRecordType).toBe("highest_volume");
    expect(tonnage[0].personalRecordType).toBe("highest_tonnage");
  });

  it("RepetitionPRDetector and CompletedSetsPRDetector detect count metrics", () => {
    const reps = new RepetitionPRDetector().detect(
      detectionInput({ highest_repetitions: 5 }),
    );
    const sets = new CompletedSetsPRDetector().detect(
      detectionInput({ highest_completed_sets: 1 }),
    );
    expect(reps[0].evidence.currentValue).toBe(26);
    expect(sets[0].evidence.currentValue).toBe(4);
  });

  it("DensityPRDetector uses tonnage per minute", () => {
    const records = new DensityPRDetector().detect(
      detectionInput({ highest_density: 10 }),
    );
    expect(records).toHaveLength(1);
    expect(records[0].personalRecordType).toBe("highest_density");
  });

  it("SessionVolumeDetector compares session tonnage", () => {
    const records = new SessionVolumeDetector().detect(
      detectionInput({ highest_session_volume: 100 }),
    );
    expect(records[0].personalRecordType).toBe("highest_session_volume");
  });

  it("ExerciseVolumeDetector emits per-exercise PRs", () => {
    const records = new ExerciseVolumeDetector().detect(
      detectionInput({}, { "ex-squat": 100, "ex-bench": 100 }),
    );
    expect(records).toHaveLength(2);
    expect(records.map((r) => r.evidence.exerciseId).sort()).toEqual([
      "ex-bench",
      "ex-squat",
    ]);
  });

  it("each detector has a single responsibility id", () => {
    const ids = [
      new WeightPRDetector().id,
      new VolumePRDetector().id,
      new TonnagePRDetector().id,
      new RepetitionPRDetector().id,
      new CompletedSetsPRDetector().id,
      new DensityPRDetector().id,
      new SessionVolumeDetector().id,
      new ExerciseVolumeDetector().id,
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });
});
