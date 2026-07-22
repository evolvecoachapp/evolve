import { generateInsights } from "../../insight-engine/application";
import { prepareCoachingContext } from "../application";
import {
  createFullInsightInputs,
  FIXED_TIMESTAMP,
} from "../../insight-engine/testSupport/fixtures";

describe("coach-intelligence integration", () => {
  it("consumes InsightSnapshot and optional upstream references", () => {
    const inputs = createFullInsightInputs();
    const insights = generateInsights({
      ...inputs,
      generatedAt: FIXED_TIMESTAMP,
      snapshotId: "insight:coach-integration",
    });

    const coach = prepareCoachingContext({
      insightSnapshot: insights.snapshot,
      recoverySnapshot: inputs.recoverySnapshot,
      athleteHistory: inputs.athleteHistory,
      achievementResult: inputs.achievementResult,
      performanceSnapshot: inputs.performanceSnapshot,
      preparedAt: FIXED_TIMESTAMP,
      contextId: "coach:integration",
    });

    expect(coach.context.session.insightSnapshotId).toBe(
      "insight:coach-integration",
    );
    expect(coach.context.session.performanceSnapshotId).toBe(
      inputs.performanceSnapshot.id,
    );
    expect(coach.context.session.recoverySnapshotId).toBe(
      inputs.recoverySnapshot.id,
    );
    expect(coach.context.session.historyId).toBe(inputs.athleteHistory.id);
    expect(coach.context.session.achievementEvaluationId).toBe(
      inputs.achievementResult.evaluationId,
    );
    expect(coach.context.constraints.some((c) => c.code === "recovery_status")).toBe(
      true,
    );
  });

  it("does not mutate InsightSnapshot or optional upstream inputs", () => {
    const inputs = createFullInsightInputs();
    const insights = generateInsights({
      ...inputs,
      generatedAt: FIXED_TIMESTAMP,
      snapshotId: "insight:coach-immutability",
    });

    const insightBefore = JSON.stringify(insights.snapshot);
    const recoveryBefore = JSON.stringify(inputs.recoverySnapshot);
    const historyBefore = JSON.stringify(inputs.athleteHistory);
    const performanceBefore = JSON.stringify(inputs.performanceSnapshot);
    const achievementBefore = JSON.stringify(inputs.achievementResult);

    prepareCoachingContext({
      insightSnapshot: insights.snapshot,
      recoverySnapshot: inputs.recoverySnapshot,
      athleteHistory: inputs.athleteHistory,
      achievementResult: inputs.achievementResult,
      performanceSnapshot: inputs.performanceSnapshot,
      preparedAt: FIXED_TIMESTAMP,
    });

    expect(JSON.stringify(insights.snapshot)).toBe(insightBefore);
    expect(JSON.stringify(inputs.recoverySnapshot)).toBe(recoveryBefore);
    expect(JSON.stringify(inputs.athleteHistory)).toBe(historyBefore);
    expect(JSON.stringify(inputs.performanceSnapshot)).toBe(performanceBefore);
    expect(JSON.stringify(inputs.achievementResult)).toBe(achievementBefore);
  });
});
