import { buildGoalDescriptor } from "../builders/DescriptorBuilder";
import { buildContinuousAdaptationInput } from "../builders/HandoffBuilder";
import { buildGoalPackage } from "../builders/GoalPackageBuilder";
import { buildGoalResult } from "../builders/ResultBuilder";
import { buildGoalSnapshot } from "../builders/GoalSnapshotBuilder";
import { buildGoalSummary } from "../builders/GoalSummaryBuilder";
import { GoalOperationKinds } from "../models/GoalResult";
import { buildStatistics } from "../utils/StatisticsHelpers";
import {
  createGoalProgressInput,
  createTestGoalProgressEngineService,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("goal-progress builders", () => {
  it("builds frozen package, summary, snapshot, handoffs, and result", () => {
    const service = createTestGoalProgressEngineService();
    const evaluated = service.evaluateGoalProgress(createGoalProgressInput());
    const decisions = evaluated.decisions;

    const summary = buildGoalSummary({
      id: "summary:1",
      athleteId: "athlete:1",
      contextId: "context:1",
      decisions,
      at: FIXED_TIMESTAMP,
    });
    const snapshot = buildGoalSnapshot({
      id: "snapshot:1",
      athleteId: "athlete:1",
      contextId: "context:1",
      decisions,
      summary,
      at: FIXED_TIMESTAMP,
    });
    const handoff = buildContinuousAdaptationInput({
      athleteId: "athlete:1",
      contextId: "context:1",
      decisions,
      at: FIXED_TIMESTAMP,
    });

    expect(handoff.id.startsWith("handoff:")).toBe(true);

    const pkg = buildGoalPackage({
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
      continuousAdaptationInput: handoff,
      at: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(pkg)).toBe(true);

    const result = buildGoalResult({
      id: "result:1",
      operation: GoalOperationKinds.EVALUATE,
      success: true,
      decisions,
      package: pkg,
      continuousAdaptationInput: handoff,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(result)).toBe(true);

    const descriptor = buildGoalDescriptor({
      id: "runtime:goal-progress",
      createdAt: FIXED_TIMESTAMP,
    });
    expect(descriptor.name).toBe("Goal Progress Engine");
  });
});
