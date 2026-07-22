import {
  createSampleProgressionPlan,
  createTestAdaptationContext,
  createTrainingAdaptationRequest,
} from "../../testSupport/fixtures";
import { TrainingAdaptationEngine } from "../../engine/TrainingAdaptationEngine";
import { ExerciseSwapStrategy } from "../ExerciseSwapStrategy";
import { IntensityAdaptationStrategy } from "../IntensityAdaptationStrategy";
import { RecoveryDayStrategy } from "../RecoveryDayStrategy";
import { ScheduleAdjustmentStrategy } from "../ScheduleAdjustmentStrategy";
import { VolumeAdaptationStrategy } from "../VolumeAdaptationStrategy";
import { createDefaultStrategies } from "../index";
import type { ReadinessAssessment } from "../../models/ReadinessAssessment";

async function sampleReadiness(): Promise<ReadinessAssessment> {
  const engine = new TrainingAdaptationEngine();
  const result = await engine.evaluate(await createTrainingAdaptationRequest());
  return result.readiness;
}

describe("training adaptation strategies", () => {
  it("createDefaultStrategies returns the expected pipeline", () => {
    const ids = createDefaultStrategies().map((strategy) => strategy.id);
    expect(ids).toEqual([
      "volume_adaptation",
      "intensity_adaptation",
      "exercise_swap",
      "recovery_day",
      "schedule_adjustment",
    ]);
  });

  it("VolumeAdaptationStrategy recommends when fatigue is elevated", async () => {
    const context = await createTestAdaptationContext();
    const plan = await createSampleProgressionPlan();
    const readiness = await sampleReadiness();
    const elevated: ReadinessAssessment = Object.freeze({
      ...readiness,
      fatigue: Object.freeze({
        ...readiness.fatigue,
        level: "high" as const,
        score: 70,
      }),
    });

    const recommendations = new VolumeAdaptationStrategy().recommend(
      context,
      elevated,
      plan,
    );
    expect(recommendations.length).toBe(1);
    expect(recommendations[0]!.action.kind).toBe("reduce_volume");
    expect(Object.isFrozen(recommendations[0])).toBe(true);
  });

  it("IntensityAdaptationStrategy recommends only for high fatigue", async () => {
    const context = await createTestAdaptationContext();
    const plan = await createSampleProgressionPlan();
    const readiness = await sampleReadiness();
    const low: ReadinessAssessment = Object.freeze({
      ...readiness,
      fatigue: Object.freeze({
        ...readiness.fatigue,
        level: "low" as const,
        score: 10,
      }),
    });
    const high: ReadinessAssessment = Object.freeze({
      ...readiness,
      fatigue: Object.freeze({
        ...readiness.fatigue,
        level: "excessive" as const,
        score: 90,
      }),
    });

    expect(
      new IntensityAdaptationStrategy().recommend(context, low, plan),
    ).toEqual([]);
    expect(
      new IntensityAdaptationStrategy().recommend(context, high, plan)[0]
        ?.action.kind,
    ).toBe("reduce_intensity");
  });

  it("ExerciseSwapStrategy recommends when hard constraints exist", async () => {
    const context = await createTestAdaptationContext();
    const plan = await createSampleProgressionPlan();
    const readiness = await sampleReadiness();
    const blocked: ReadinessAssessment = Object.freeze({
      ...readiness,
      constraints: Object.freeze({
        ...readiness.constraints,
        hardCount: 1,
        blockingCodes: Object.freeze(["equipment_limit"]),
      }),
    });

    const recommendations = new ExerciseSwapStrategy().recommend(
      context,
      blocked,
      plan,
    );
    expect(recommendations[0]!.action.kind).toBe("swap_exercise");
  });

  it("RecoveryDayStrategy recommends when recovery is insufficient", async () => {
    const context = await createTestAdaptationContext();
    const plan = await createSampleProgressionPlan();
    const readiness = await sampleReadiness();
    const insufficient: ReadinessAssessment = Object.freeze({
      ...readiness,
      recovery: Object.freeze({
        ...readiness.recovery,
        status: "insufficient" as const,
        score: 20,
      }),
    });

    const recommendations = new RecoveryDayStrategy().recommend(
      context,
      insufficient,
      plan,
    );
    expect(recommendations[0]!.action.kind).toBe("insert_recovery_day");
  });

  it("ScheduleAdjustmentStrategy recommends for high frequency + fatigue", async () => {
    const context = Object.freeze({
      ...(await createTestAdaptationContext()),
      weeklyFrequency: 6,
    });
    const plan = await createSampleProgressionPlan();
    const readiness = await sampleReadiness();
    const elevated: ReadinessAssessment = Object.freeze({
      ...readiness,
      fatigue: Object.freeze({
        ...readiness.fatigue,
        level: "high" as const,
      }),
    });

    const recommendations = new ScheduleAdjustmentStrategy().recommend(
      context,
      elevated,
      plan,
    );
    expect(recommendations[0]!.action.kind).toBe("adjust_schedule");
  });
});
