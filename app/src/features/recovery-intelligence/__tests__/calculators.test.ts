import {
  DensityLoadCalculator,
  FatigueCalculator,
  FrequencyCalculator,
  RecoveryStatusCalculator,
  RecoveryWindowCalculator,
  TrainingLoadCalculator,
} from "../calculators";
import { RecoveryStatusLevels } from "../models/RecoveryStatus";
import {
  createAthleteHistoryFixture,
  createDensityLoadFixture,
  createFatigueScoreFixture,
  createFrequencyLoadFixture,
  createPerformanceSnapshotFixture,
  createTrainingLoadFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("recovery-intelligence calculators", () => {
  it("TrainingLoadCalculator derives session and cumulative load", () => {
    const snapshot = createPerformanceSnapshotFixture({ tonnage: 2000 });
    const history = createAthleteHistoryFixture({
      performanceSnapshot: snapshot,
    });
    const load = new TrainingLoadCalculator().calculate({
      performanceSnapshot: snapshot,
      athleteHistory: history,
      analyzedAt: FIXED_TIMESTAMP,
      frequencyWindowDays: 7,
    });

    expect(load.sessionLoad).toBe(2000);
    expect(load.volumeLoad).toBe(2000);
    expect(load.cumulativeTonnage).toBeGreaterThanOrEqual(2000);
    expect(load.loadScore).toBe(40);
  });

  it("DensityLoadCalculator scores tonnage per minute", () => {
    const density = new DensityLoadCalculator().calculate(
      createPerformanceSnapshotFixture({ tonnagePerMinute: 50 }),
    );
    expect(density.densityScore).toBe(100);
    expect(density.tonnagePerMinute).toBe(50);
  });

  it("DensityLoadCalculator returns 0 score when rate is null", () => {
    const density = new DensityLoadCalculator().calculate(
      createPerformanceSnapshotFixture({ tonnagePerMinute: null }),
    );
    expect(density.densityScore).toBe(0);
  });

  it("FrequencyCalculator counts workouts in window", () => {
    const history = createAthleteHistoryFixture();
    const frequency = new FrequencyCalculator().calculate({
      athleteHistory: history,
      analyzedAt: FIXED_TIMESTAMP,
      frequencyWindowDays: 7,
    });
    expect(frequency.workoutsInWindow).toBeGreaterThanOrEqual(1);
    expect(frequency.windowDays).toBe(7);
    expect(frequency.frequencyScore).toBeGreaterThan(0);
  });

  it("FatigueCalculator blends components with fixed weights", () => {
    const fatigue = new FatigueCalculator().calculate({
      trainingLoad: createTrainingLoadFixture({ loadScore: 40 }),
      densityLoad: createDensityLoadFixture({ densityScore: 80 }),
      frequencyLoad: createFrequencyLoadFixture({ frequencyScore: 20 }),
    });
    expect(fatigue.score).toBe(45);
    expect(fatigue.loadComponent).toBe(40);
    expect(fatigue.densityComponent).toBe(80);
    expect(fatigue.frequencyComponent).toBe(20);
  });

  it("RecoveryWindowCalculator maps fatigue bands to duration", () => {
    const window = new RecoveryWindowCalculator().calculate({
      fatigue: createFatigueScoreFixture({ score: 45 }),
      analyzedAt: FIXED_TIMESTAMP,
    });
    expect(window.durationHours).toBe(36);
    expect(window.startAt).toBe(FIXED_TIMESTAMP);
    expect(window.durationMs).toBe(36 * 3_600_000);
  });

  it("RecoveryStatusCalculator classifies score bands", () => {
    const calc = new RecoveryStatusCalculator();
    expect(calc.calculate(createFatigueScoreFixture({ score: 10 })).level).toBe(
      RecoveryStatusLevels.FRESH,
    );
    expect(calc.calculate(createFatigueScoreFixture({ score: 30 })).level).toBe(
      RecoveryStatusLevels.MODERATE,
    );
    expect(calc.calculate(createFatigueScoreFixture({ score: 60 })).level).toBe(
      RecoveryStatusLevels.ELEVATED,
    );
    expect(calc.calculate(createFatigueScoreFixture({ score: 90 })).level).toBe(
      RecoveryStatusLevels.HIGH,
    );
    expect(calc.calculate(null).level).toBe(
      RecoveryStatusLevels.INSUFFICIENT_DATA,
    );
  });
});
