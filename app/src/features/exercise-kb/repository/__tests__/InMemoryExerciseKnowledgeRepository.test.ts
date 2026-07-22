import { ILLUSTRATIVE_EXERCISE_CATALOG } from "../../catalog";
import { createExerciseDefinition } from "../../testSupport/fixtures";
import { InMemoryExerciseKnowledgeRepository } from "../InMemoryExerciseKnowledgeRepository";

describe("InMemoryExerciseKnowledgeRepository", () => {
  it("loads all immutable definitions from seed", async () => {
    const repository = new InMemoryExerciseKnowledgeRepository(
      ILLUSTRATIVE_EXERCISE_CATALOG,
    );

    const all = await repository.loadAll();

    expect(all.length).toBeGreaterThanOrEqual(20);
    expect(all.length).toBeLessThanOrEqual(30);
    expect(Object.isFrozen(all[0])).toBe(true);
    expect(all[0]).not.toBe(ILLUSTRATIVE_EXERCISE_CATALOG[0]);
  });

  it("finds by id, tag, movement pattern, and equipment", async () => {
    const repository = new InMemoryExerciseKnowledgeRepository(
      ILLUSTRATIVE_EXERCISE_CATALOG,
    );

    const byId = await repository.findById("back-squat");
    expect(byId?.name).toBe("Back Squat");
    expect(Object.isFrozen(byId)).toBe(true);

    const byTag = await repository.findByTag("competition_lift");
    expect(byTag.some((entry) => entry.id === "back-squat")).toBe(true);

    const byPattern = await repository.findByMovementPattern("squat");
    expect(byPattern.every((entry) => entry.movementPattern.code === "squat")).toBe(
      true,
    );

    const byEquipment = await repository.findByEquipment("barbell");
    expect(
      byEquipment.every((entry) =>
        entry.equipment.some((item) => item.equipment === "barbell"),
      ),
    ).toBe(true);
  });

  it("returns null for unknown ids", async () => {
    const repository = new InMemoryExerciseKnowledgeRepository();
    expect(await repository.findById("missing")).toBeNull();
  });

  it("rejects invalid definitions on seed", () => {
    expect(() =>
      new InMemoryExerciseKnowledgeRepository([
        createExerciseDefinition({
          id: "",
          name: "Broken",
          movementPattern: "squat",
          primaryMuscles: ["quads"],
          equipment: ["barbell"],
          pushPullLegs: "legs",
          fatigueScore: 5,
          jointStress: 5,
          axialLoading: false,
        }),
      ]),
    ).toThrow(/invalid_definition|Invalid exercise definition/);
  });
});
