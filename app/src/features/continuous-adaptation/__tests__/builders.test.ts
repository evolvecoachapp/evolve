import { buildAdaptationDescriptor } from "../builders/DescriptorBuilder";
import {
  buildGoalProgressInput,
  buildNutritionAdaptationInput,
  buildRecoveryAdaptationInput,
  buildWorkoutAdaptationInput,
} from "../builders/HandoffBuilder";
import { buildAdaptationPackage } from "../builders/PackageBuilder";
import { buildAdaptationResult } from "../builders/ResultBuilder";
import { buildAdaptationSnapshot } from "../builders/SnapshotBuilder";
import { buildAdaptationSummary } from "../builders/SummaryBuilder";
import { AdaptationOperationKinds } from "../models/AdaptationResult";
import { buildStatistics } from "../utils/StatisticsHelpers";
import {
  createAdaptationInput,
  createTestContinuousAdaptationEngineService,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("continuous-adaptation builders", () => {
  it("builds frozen package, summary, snapshot, handoffs, and result", () => {
    const service = createTestContinuousAdaptationEngineService();
    const evaluated = service.evaluateAdaptation(createAdaptationInput());
    const decisions = evaluated.decisions;

    const summary = buildAdaptationSummary({
      id: "summary:1",
      athleteId: "athlete:1",
      contextId: "context:1",
      decisions,
      at: FIXED_TIMESTAMP,
    });
    const snapshot = buildAdaptationSnapshot({
      id: "snapshot:1",
      athleteId: "athlete:1",
      contextId: "context:1",
      decisions,
      summary,
      at: FIXED_TIMESTAMP,
    });
    const workout = buildWorkoutAdaptationInput({
      athleteId: "athlete:1",
      contextId: "context:1",
      decisions,
      at: FIXED_TIMESTAMP,
    });
    const nutrition = buildNutritionAdaptationInput({
      athleteId: "athlete:1",
      contextId: "context:1",
      decisions,
      at: FIXED_TIMESTAMP,
    });
    const recovery = buildRecoveryAdaptationInput({
      athleteId: "athlete:1",
      contextId: "context:1",
      decisions,
      at: FIXED_TIMESTAMP,
    });
    const goal = buildGoalProgressInput({
      athleteId: "athlete:1",
      contextId: "context:1",
      decisions,
      at: FIXED_TIMESTAMP,
    });

    expect(workout.id.startsWith("handoff:")).toBe(true);
    expect(nutrition.id.startsWith("handoff:")).toBe(true);
    expect(recovery.id.startsWith("handoff:")).toBe(true);
    expect(goal.id.startsWith("handoff:")).toBe(true);

    const pkg = buildAdaptationPackage({
      id: "package:1",
      athleteId: "athlete:1",
      contextId: "context:1",
      decisions,
      summary,
      snapshot,
      timeline: null,
      history: null,
      window: null,
      statistics: buildStatistics(decisions),
      processingSteps: Object.freeze(["build"]),
      workoutAdaptationInput: workout,
      nutritionAdaptationInput: nutrition,
      recoveryAdaptationInput: recovery,
      goalProgressInput: goal,
      at: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(pkg)).toBe(true);

    const result = buildAdaptationResult({
      id: "result:1",
      operation: AdaptationOperationKinds.EVALUATE,
      success: true,
      decisions,
      package: pkg,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(result)).toBe(true);

    const descriptor = buildAdaptationDescriptor({
      id: "runtime:test",
      createdAt: FIXED_TIMESTAMP,
    });
    expect(descriptor.name).toBe("Continuous Adaptation Engine");
    expect(descriptor.capabilities).toContain("evaluateAdaptation");
  });
});
