import { ILLUSTRATIVE_EXERCISE_CATALOG } from "../../catalog";
import { ExerciseKnowledgeError } from "../../models/ExerciseKnowledgeError";
import { InMemoryExerciseKnowledgeRepository } from "../../repository/InMemoryExerciseKnowledgeRepository";
import { createExerciseKnowledgeService } from "../createExerciseKnowledgeService";

describe("ExerciseKnowledgeService", () => {
  const repository = new InMemoryExerciseKnowledgeRepository(
    ILLUSTRATIVE_EXERCISE_CATALOG,
  );
  const service = createExerciseKnowledgeService(repository);

  it("queries all definitions as an immutable result", async () => {
    const result = await service.queryAll();

    expect(result.exercises.length).toBe(ILLUSTRATIVE_EXERCISE_CATALOG.length);
    expect(result.validationIssues).toEqual([]);
    expect(Object.isFrozen(result.exercises[0])).toBe(true);
  });

  it("searches by query, tag, and equipment", async () => {
    const byName = await service.search({ query: "squat", limit: 5 });
    expect(byName.exercises.length).toBeGreaterThan(0);
    expect(byName.exercises.length).toBeLessThanOrEqual(5);
    expect(
      byName.exercises.every((entry) =>
        entry.name.toLowerCase().includes("squat"),
      ),
    ).toBe(true);

    const byTag = await service.search({ tag: "machine" });
    expect(byTag.exercises.every((entry) =>
      entry.metadata.tags.some((tag) => tag.code === "machine"),
    )).toBe(true);
  });

  it("resolves alternatives, progressions, and regressions", async () => {
    const alternatives = await service.resolveAlternatives("back-squat");
    expect(alternatives.map((entry) => entry.id)).toEqual(
      expect.arrayContaining(["front-squat", "leg-press"]),
    );

    const progressions = await service.resolveProgressions("back-squat");
    expect(progressions.some((entry) => entry.id === "paused-squat")).toBe(true);

    const regressions = await service.resolveRegressions("back-squat");
    expect(regressions.some((entry) => entry.id === "leg-press")).toBe(true);
  });

  it("resolves relationships by kind", async () => {
    const variations = await service.resolveRelationships(
      "bench-press",
      "variation",
    );
    expect(variations.some((entry) => entry.id === "close-grip-bench")).toBe(
      true,
    );
  });

  it("throws when resolving unknown exercise", async () => {
    await expect(service.resolveAlternatives("missing")).rejects.toBeInstanceOf(
      ExerciseKnowledgeError,
    );
  });
});
