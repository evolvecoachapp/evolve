import { FIXED_ASSEMBLY_TIMESTAMP } from "../../engine/WorkoutAssemblyEngine";
import type { WorkoutAssemblyResult } from "../../models/WorkoutAssemblyResult";
import { createEmptyWorkoutAssemblyScore } from "../../models/WorkoutAssemblyScore";
import {
  createSampleAdaptationResult,
  createTestAssemblyContext,
} from "../../testSupport/fixtures";
import { freezeWorkoutAssemblyResult } from "../../utils/freezeWorkoutSession";
import { InMemoryWorkoutAssemblyRepository } from "../InMemoryWorkoutAssemblyRepository";

async function sampleResult(
  requestId: string,
): Promise<WorkoutAssemblyResult> {
  const context = await createTestAssemblyContext();
  const adaptation = await createSampleAdaptationResult();

  return freezeWorkoutAssemblyResult({
    requestId,
    context,
    session: Object.freeze({
      id: `session:${requestId}`,
      blueprintId: context.blueprintId,
      dayId: context.dayId,
      dayIndex: context.dayIndex,
      weekNumber: context.weekNumber,
      name: "Upper",
      focus: context.focus,
      sessionGoal: context.sessionGoal,
      priority: context.priority,
      exercises: Object.freeze([]),
      blocks: Object.freeze([]),
      executionOrder: Object.freeze({
        exerciseIds: Object.freeze([]),
        blockIds: Object.freeze([]),
      }),
      summary: Object.freeze({
        exerciseCount: 0,
        blockCount: 0,
        totalSets: 0,
        totalRepsMin: 0,
        totalRepsMax: 0,
        estimatedDurationSeconds: 0,
        estimatedWorkload: 0,
        appliedRecommendationCount: 0,
        readinessScore: adaptation.readiness.overallScore,
      }),
      notes: Object.freeze([]),
      estimatedDurationSeconds: 0,
      estimatedWorkload: 0,
      assembledAt: FIXED_ASSEMBLY_TIMESTAMP,
    }),
    explanations: Object.freeze([]),
    validationIssues: Object.freeze([]),
    score: createEmptyWorkoutAssemblyScore(),
    assembledAt: FIXED_ASSEMBLY_TIMESTAMP,
  });
}

describe("InMemoryWorkoutAssemblyRepository", () => {
  it("saves, loads, lists, and deletes cached results", async () => {
    const repo = new InMemoryWorkoutAssemblyRepository();
    const saved = await repo.save(await sampleResult("assembly:a"));
    expect(saved.requestId).toBe("assembly:a");
    expect(Object.isFrozen(saved)).toBe(true);

    const loaded = await repo.load("assembly:a");
    expect(loaded?.requestId).toBe("assembly:a");

    await repo.save(await sampleResult("assembly:b"));
    const listed = await repo.list();
    expect(listed.map((entry) => entry.requestId)).toEqual([
      "assembly:a",
      "assembly:b",
    ]);

    expect(await repo.delete("assembly:a")).toBe(true);
    expect(await repo.load("assembly:a")).toBeNull();

    await repo.clear();
    expect(await repo.list()).toEqual([]);
  });
});
