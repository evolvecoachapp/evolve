import {
  findAlternativeExercises,
  findProgressions,
  findRegressions,
  queryExerciseKnowledge,
  searchExercises,
} from "../index";
import { ILLUSTRATIVE_EXERCISE_CATALOG } from "../../catalog";
import { InMemoryExerciseKnowledgeRepository } from "../../repository/InMemoryExerciseKnowledgeRepository";
import { createExerciseKnowledgeService } from "../../services";

describe("exercise-kb application", () => {
  const service = createExerciseKnowledgeService(
    new InMemoryExerciseKnowledgeRepository(ILLUSTRATIVE_EXERCISE_CATALOG),
  );

  it("queryExerciseKnowledge returns the catalog", async () => {
    const result = await queryExerciseKnowledge(service);
    expect(result.exercises.length).toBe(ILLUSTRATIVE_EXERCISE_CATALOG.length);
    expect(result.validationIssues).toEqual([]);
  });

  it("searchExercises filters by movement pattern", async () => {
    const result = await searchExercises(
      { movementPattern: "hinge" },
      service,
    );
    expect(result.exercises.length).toBeGreaterThan(0);
    expect(
      result.exercises.every((entry) => entry.movementPattern.code === "hinge"),
    ).toBe(true);
  });

  it("findAlternativeExercises resolves ranked alternatives", async () => {
    const alternatives = await findAlternativeExercises("deadlift", service);
    expect(alternatives.map((entry) => entry.id)).toEqual(
      expect.arrayContaining(["sumo-deadlift", "romanian-deadlift"]),
    );
  });

  it("findProgressions and findRegressions resolve graph edges", async () => {
    const progressions = await findProgressions("lat-pulldown", service);
    expect(progressions.some((entry) => entry.id === "pull-up")).toBe(true);

    const regressions = await findRegressions("pull-up", service);
    expect(regressions.some((entry) => entry.id === "lat-pulldown")).toBe(true);
  });
});
