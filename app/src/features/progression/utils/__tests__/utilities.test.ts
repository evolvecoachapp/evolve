import {
  createProgressionRequest,
  createTestProgressionContext,
} from "../../testSupport/fixtures";
import {
  buildProgressionContext,
  calculateProgressionScore,
  compareStepsByWeekThenOrderThenId,
  estimateProgressionScore,
  estimateWorkloadTrend,
  freezeProgressionPlan,
  mergeScoreParts,
  normalizeExerciseProgression,
  normalizeTimeline,
  sortTimeline,
} from "../index";
import { VolumeProgressionStrategy } from "../../strategies/VolumeProgressionStrategy";
import { FIXED_PROGRESSION_TIMESTAMP } from "../../engine/ProgressionEngine";
import { createEmptyProgressionScore } from "../../models/ProgressionScore";

describe("progression utilities", () => {
  it("builds progression context from a request", async () => {
    const context = await createTestProgressionContext();
    expect(context.dayId).toBe("day-upper");
    expect(context.programmingRequestId).toContain("programming:");
    expect(context.prescriptionCount).toBe(3);
    expect(context.window.weekCount).toBe(4);
  });

  it("normalizes a prescription into a baseline progression skeleton", async () => {
    const request = await createProgressionRequest();
    const context = buildProgressionContext(request);
    const prescription = request.programming.prescriptions[0]!;
    const progression = normalizeExerciseProgression(prescription, context);

    expect(progression.steps.length).toBe(4);
    expect(progression.steps[0]!.target.volumeSets).toBe(
      prescription.volume.sets,
    );
    expect(Object.isFrozen(progression)).toBe(true);
  });

  it("calculates and merges progression scores", () => {
    const score = calculateProgressionScore({
      linear: 2,
      volume: 4,
      intensity: 3,
    });
    expect(score.total).toBe(9);

    const merged = mergeScoreParts(
      { linear: 1 },
      { volume: 2 },
      { intensity: 1.5 },
    );
    expect(merged.total).toBe(4.5);
  });

  it("estimates progression score and workload trend deterministically", async () => {
    const request = await createProgressionRequest();
    const context = buildProgressionContext(request);
    const progression = normalizeExerciseProgression(
      request.programming.prescriptions[0]!,
      context,
    );
    const progressed = new VolumeProgressionStrategy().apply(
      progression,
      context,
    );

    const scoreA = estimateProgressionScore([progressed]);
    const scoreB = estimateProgressionScore([progressed]);
    expect(scoreA).toEqual(scoreB);

    const timeline = normalizeTimeline([progressed]);
    const workloadA = estimateWorkloadTrend(timeline);
    const workloadB = estimateWorkloadTrend(timeline);
    expect(workloadA).toBe(workloadB);
    expect(workloadA).toBeGreaterThan(0);
  });

  it("sorts timeline by week then order then id", async () => {
    const request = await createProgressionRequest();
    const context = buildProgressionContext(request);
    const progressions = request.programming.prescriptions.map((prescription) =>
      normalizeExerciseProgression(prescription, context),
    );
    const unsorted = [
      ...progressions[2]!.steps,
      ...progressions[0]!.steps,
      ...progressions[1]!.steps,
    ];
    const sorted = sortTimeline(unsorted);
    for (let index = 1; index < sorted.length; index += 1) {
      expect(
        compareStepsByWeekThenOrderThenId(sorted[index - 1]!, sorted[index]!),
      ).toBeLessThanOrEqual(0);
    }
  });

  it("freezes a progression plan deeply", async () => {
    const request = await createProgressionRequest();
    const context = buildProgressionContext(request);
    const progressions = request.programming.prescriptions.map((prescription) =>
      normalizeExerciseProgression(prescription, context),
    );
    const timeline = normalizeTimeline(progressions);
    const plan = freezeProgressionPlan({
      requestId: "progression:test",
      context,
      exerciseProgressions: progressions,
      timeline,
      explanations: Object.freeze([]),
      validationIssues: Object.freeze([]),
      score: createEmptyProgressionScore(),
      progressedAt: FIXED_PROGRESSION_TIMESTAMP,
    });
    expect(Object.isFrozen(plan)).toBe(true);
    expect(Object.isFrozen(plan.timeline[0])).toBe(true);
  });
});
