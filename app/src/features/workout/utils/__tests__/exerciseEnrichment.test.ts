import { enrichExercise } from "../exerciseEnrichment";
import type { Exercise } from "../../models/Exercise";

function buildExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: "exercise-1",
    name: "Back Squat",
    muscleGroup: "quads",
    equipment: "barbell",
    instructions: "Brace and squat.",
    primaryMuscles: ["quads"],
    secondaryMuscles: ["glutes"],
    commonMistakes: ["Rounding your back"],
    ...overrides,
  };
}

describe("enrichExercise", () => {
  it("applies metadata enrichment for known catalog exercises", () => {
    const exercise = enrichExercise(buildExercise({ id: "ex-low-bar-squat" }));

    expect(exercise.metadata?.difficulty).toBe("Advanced");
    expect(exercise.metadata?.movementPattern).toBe("squat");
    expect(exercise.metadata?.coachTip?.toLowerCase()).toContain("brace");
    expect(exercise.metadata?.primaryMuscles).toEqual(["quads", "glutes"]);
  });

  it("preserves existing metadata and falls back to safe defaults", () => {
    const exercise = enrichExercise(buildExercise({ id: "unknown-exercise" }));

    expect(exercise.metadata).toMatchObject({
      difficulty: "Beginner",
      movementPattern: "compound",
      equipment: [],
      unilateral: false,
      bodyRegion: "full-body",
      tempo: "2-0-2",
      recommendedRestSeconds: 60,
      coachTip: "",
      executionSteps: [],
      breathingInstructions: "",
      rangeOfMotion: "",
      safetyNotes: [],
      commonMistakes: ["Rounding your back"],
      primaryMuscles: ["quads"],
      secondaryMuscles: ["glutes"],
      stabilizerMuscles: [],
    });
  });
});
