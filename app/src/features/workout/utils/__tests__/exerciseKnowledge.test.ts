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

describe("ExerciseKnowledge mapping and defaults", () => {
  it("maps enrichment knowledge into metadata.knowledge", () => {
    const ex = enrichExercise(buildExercise({ id: "ex-low-bar-squat" }));
    expect(ex.metadata?.knowledge).toBeDefined();
    expect(ex.metadata?.knowledge?.aliases).toContain("low-bar back squat");
    expect(ex.metadata?.knowledge?.substitutions?.some(s => s.id === "ex-front-squat")).toBeTruthy();
    expect(ex.metadata?.knowledge?.variations?.length).toBeGreaterThan(0);
  });

  it("provides safe defaults when no catalog enrichment exists", () => {
    const ex = enrichExercise(buildExercise({ id: "unknown-ex" }));
    expect(ex.metadata?.knowledge).toBeDefined();
    expect(ex.metadata?.knowledge?.aliases).toEqual([]);
    expect(ex.metadata?.knowledge?.substitutions).toEqual([]);
    expect(ex.metadata?.knowledge?.tempo).toBe("2-0-2");
    expect(ex.metadata?.primaryMuscles).toEqual(["quads"]);
  });

  it("includes mock catalog tags and substitution reasons for seeded entries", () => {
    const ex = enrichExercise(buildExercise({ id: "ex-low-bar-squat" }));
    expect(ex.metadata?.knowledge?.tags).toContain("strength");
    expect(ex.metadata?.knowledge?.substitutions?.find(s => s.id === "ex-high-bar-squat")?.reason).toBeDefined();
  });
});
