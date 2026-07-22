import {
  createProgressionRequest,
  createTestProgressionContext,
} from "../../testSupport/fixtures";
import { createDefaultStrategies } from "../../strategies";
import {
  freezeExerciseProgression,
  freezeProgressionStep,
} from "../../utils/freezeProgressionPlan";
import { normalizeExerciseProgression } from "../../utils/normalizeTimeline";
import { normalizeTimeline } from "../../utils/normalizeTimeline";
import {
  validateExerciseContinuity,
  validateProgressionConsistency,
  validateProgressionPlan,
  validateTimelineConsistency,
  validateWeekOrdering,
} from "../index";

async function buildProgressions() {
  const request = await createProgressionRequest();
  const context = await createTestProgressionContext();
  const strategies = createDefaultStrategies();

  return Object.freeze(
    request.programming.prescriptions.map((prescription) => {
      let current = normalizeExerciseProgression(prescription, context);
      for (const strategy of strategies) {
        current = strategy.apply(current, context);
      }
      return current;
    }),
  );
}

describe("progression validators", () => {
  it("accepts a well-formed progression plan", async () => {
    const request = await createProgressionRequest();
    const progressions = await buildProgressions();
    const timeline = normalizeTimeline(progressions);
    expect(
      validateProgressionPlan(
        request,
        progressions,
        timeline,
        request.window!,
      ),
    ).toEqual([]);
  });

  it("detects week ordering violations", async () => {
    const progressions = await buildProgressions();
    const broken = freezeExerciseProgression({
      ...progressions[0]!,
      steps: Object.freeze([
        progressions[0]!.steps[1]!,
        progressions[0]!.steps[0]!,
        ...progressions[0]!.steps.slice(2),
      ]),
    });
    expect(validateWeekOrdering([broken])).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^week_order_violation:/),
      ]),
    );
  });

  it("detects exercise continuity breaks", async () => {
    const progressions = await buildProgressions();
    const base = progressions[0]!;
    const brokenStep = freezeProgressionStep({
      ...base.steps[1]!,
      exerciseId: "other-exercise",
    });
    const broken = freezeExerciseProgression({
      ...base,
      steps: Object.freeze([
        base.steps[0]!,
        brokenStep,
        ...base.steps.slice(2),
      ]),
    });
    expect(validateExerciseContinuity([broken])).toContain(
      `exercise_continuity_broken:${base.exerciseId}->other-exercise:week_${brokenStep.weekNumber}`,
    );
  });

  it("detects progression consistency violations", async () => {
    const progressions = await buildProgressions();
    const base = progressions[0]!;
    const brokenStep = freezeProgressionStep({
      ...base.steps[0]!,
      target: Object.freeze({
        ...base.steps[0]!.target,
        volumeSets: 0,
      }),
    });
    const broken = freezeExerciseProgression({
      ...base,
      steps: Object.freeze([brokenStep, ...base.steps.slice(1)]),
    });
    expect(validateProgressionConsistency([broken])).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^volume_sets_out_of_range:/),
      ]),
    );
  });

  it("detects missing weeks in timeline", async () => {
    const progressions = await buildProgressions();
    const timeline = normalizeTimeline(progressions).filter(
      (step) => step.weekNumber !== 2,
    );
    expect(validateTimelineConsistency(timeline, 1, 4)).toContain(
      "missing_week:2",
    );
  });
});
