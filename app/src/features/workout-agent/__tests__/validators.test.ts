import {
  validateExerciseCompatibility,
  validateIntensity,
  validateProgression,
  validateRecommendations,
  validateRecovery,
  validateSplitConsistency,
  validateTrainingObjective,
  validateVolume,
  validateWorkoutPlan,
} from "../validators";
import { WorkoutObjectives } from "../models/WorkoutObjective";
import { WorkoutPlanBuilder } from "../builders/WorkoutPlanBuilder";
import { WorkoutContextBuilder } from "../builders/WorkoutContextBuilder";
import {
  createFixedClock,
  createWorkoutRequestFixture,
} from "../testSupport/fixtures";
import { WorkoutRecommendationCategories } from "../models/WorkoutRecommendation";
import { labelFromScore } from "../models/WorkoutConfidence";

describe("workout-agent validators", () => {
  const clock = createFixedClock();
  const context = new WorkoutContextBuilder().build({
    request: createWorkoutRequestFixture(),
    clock,
  });
  const proposal = new WorkoutPlanBuilder().buildProposal({ context, clock });

  it("validateTrainingObjective", () => {
    expect(validateTrainingObjective(WorkoutObjectives.STRENGTH).valid).toBe(
      true,
    );
    expect(validateTrainingObjective(null).valid).toBe(false);
  });

  it("validateSplitConsistency / volume / intensity / progression", () => {
    expect(validateSplitConsistency(proposal).valid).toBe(true);
    expect(validateVolume(proposal).valid).toBe(true);
    expect(validateIntensity(proposal).valid).toBe(true);
    expect(validateProgression(proposal).valid).toBe(true);
  });

  it("validateExerciseCompatibility detects duplicates", () => {
    const bad = Object.freeze({
      ...proposal,
      primaryLifts: Object.freeze(["squat"]),
      accessories: Object.freeze(["squat"]),
    });
    expect(validateExerciseCompatibility(bad).valid).toBe(false);
  });

  it("validateRecovery flags recovery issues", () => {
    const bad = Object.freeze({
      ...proposal,
      objective: WorkoutObjectives.RECOVERY,
      deloadRecommended: false,
      intensityScore: 0.8,
    });
    expect(validateRecovery(bad).valid).toBe(false);
  });

  it("validateRecommendations and validateWorkoutPlan", () => {
    expect(
      validateRecommendations(
        Object.freeze([
          Object.freeze({
            id: "rec:1",
            category: WorkoutRecommendationCategories.GENERAL,
            title: "Ok",
            detail: "Detail",
            priority: 1,
            confidence: Object.freeze({
              score: 0.5,
              label: labelFromScore(0.5),
              rationale: null,
            }),
            relatedExerciseIds: Object.freeze([] as string[]),
          }),
        ]),
      ).valid,
    ).toBe(true);
    expect(validateWorkoutPlan(proposal).valid).toBe(true);
  });
});
