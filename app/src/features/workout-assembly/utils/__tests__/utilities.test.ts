import { WorkoutAssemblyEngine } from "../../engine/WorkoutAssemblyEngine";
import {
  createTestAssemblyContext,
  createWorkoutAssemblyRequest,
} from "../../testSupport/fixtures";
import {
  buildAssemblyContext,
  buildSummary,
  calculateAssemblyScore,
  compareExercises,
  estimateAssemblyScore,
  estimateDuration,
  estimateExerciseDurationSeconds,
  estimateExerciseWorkload,
  estimateWorkload,
  freezeWorkoutAssemblyResult,
  groupIntoBlocks,
  mergeScoreParts,
  normalizeSession,
  resolveRecommendations,
  sortExercises,
} from "../index";

describe("workout assembly utilities", () => {
  it("builds assembly context from a request", async () => {
    const context = await createTestAssemblyContext();
    expect(context.dayId).toBe("day-upper");
    expect(context.programmingRequestId).toContain("programming:");
    expect(context.progressionRequestId).toContain("progression:");
    expect(context.adaptationRequestId).toContain("adaptation:");
    expect(context.weekNumber).toBe(1);
  });

  it("calculates and merges assembly scores", () => {
    const score = calculateAssemblyScore({
      ordering: 1,
      prescription: 2,
      adaptation: 0.5,
    });
    expect(score.total).toBe(3.5);

    const merged = mergeScoreParts(
      { ordering: 1 },
      { prescription: 2 },
      { workload: 0.5 },
    );
    expect(merged.total).toBe(3.5);
  });

  it("resolves recommendations for the assembled week", async () => {
    const request = await createWorkoutAssemblyRequest();
    const resolved = resolveRecommendations(request, 1);
    expect(Array.isArray(resolved)).toBe(true);
    for (const recommendation of resolved) {
      expect(recommendation.action.kind).not.toBe("maintain");
    }
  });

  it("groups exercises into role blocks", async () => {
    const engine = new WorkoutAssemblyEngine();
    const result = await engine.assemble(await createWorkoutAssemblyRequest());
    const blocks = groupIntoBlocks(result.session.exercises);
    expect(blocks.length).toBeGreaterThan(0);
    expect(blocks[0]?.order).toBe(1);
  });

  it("estimates duration and workload", () => {
    expect(
      estimateExerciseDurationSeconds({
        setCount: 3,
        betweenSetsRestSeconds: 90,
        workSecondsPerSet: 40,
      }),
    ).toBe(3 * 40 + 2 * 90);

    expect(
      estimateExerciseWorkload({
        setCount: 3,
        repMin: 8,
        repMax: 10,
        fatigueEstimate: 5,
      }),
    ).toBeGreaterThan(0);

    const exercises = Object.freeze([
      Object.freeze({
        id: "ex-1",
        exerciseId: "bench-press",
        name: "Bench",
        role: "primary" as const,
        order: 1,
        blockId: "block:primary",
        sets: Object.freeze([]),
        setCount: 3,
        repMin: 8,
        repMax: 10,
        intensityMetric: "rpe" as const,
        intensityValue: 7,
        restSeconds: 90,
        betweenSetsRestSeconds: 90,
        tempo: null,
        notes: Object.freeze([]),
        cues: Object.freeze([]),
        appliedRecommendationIds: Object.freeze([]),
        estimatedDurationSeconds: 300,
        estimatedWorkload: 40.5,
        fatigueEstimate: 5,
        skillEstimate: 4,
      }),
    ]);

    expect(estimateDuration(exercises)).toBe(300);
    expect(estimateWorkload(exercises)).toBe(40.5);
  });

  it("sorts exercises and builds summary", async () => {
    const engine = new WorkoutAssemblyEngine();
    const result = await engine.assemble(await createWorkoutAssemblyRequest());
    const sorted = sortExercises([...result.session.exercises].reverse());
    expect(sorted[0]?.order).toBeLessThanOrEqual(sorted[1]?.order ?? 999);

    const summary = buildSummary({
      exercises: result.session.exercises,
      blocks: result.session.blocks,
      readinessScore: result.context.readinessScore,
    });
    expect(summary.exerciseCount).toBe(result.session.exercises.length);
    expect(summary.blockCount).toBe(result.session.blocks.length);
  });

  it("freezes and normalizes sessions", async () => {
    const engine = new WorkoutAssemblyEngine();
    const result = await engine.assemble(await createWorkoutAssemblyRequest());
    const frozen = freezeWorkoutAssemblyResult(result);
    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isFrozen(frozen.session)).toBe(true);

    const normalized = normalizeSession(result.session);
    expect(normalized.executionOrder.exerciseIds.length).toBe(
      result.session.exercises.length,
    );
  });

  it("compares exercises and estimates assembly score", async () => {
    const request = await createWorkoutAssemblyRequest();
    const context = buildAssemblyContext(request);
    expect(context.blueprintId).toBe(request.blueprint.id);

    const engine = new WorkoutAssemblyEngine();
    const result = await engine.assemble(request);
    const [first, second] = result.session.exercises;
    if (first && second) {
      expect(compareExercises(first, second)).toBeLessThanOrEqual(0);
    }

    const score = estimateAssemblyScore({
      exercises: result.session.exercises,
      recommendations: request.adaptation.recommendations,
      validationIssueCount: 0,
    });
    expect(score.total).toBeGreaterThan(0);
  });
});
