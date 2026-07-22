import { createSelectionCatalog, createTestSelectionContext } from "../../testSupport/fixtures";
import { ConstraintStrategy } from "../ConstraintStrategy";
import { DifficultyStrategy } from "../DifficultyStrategy";
import { EquipmentStrategy } from "../EquipmentStrategy";
import { GoalStrategy } from "../GoalStrategy";
import { MovementPatternStrategy } from "../MovementPatternStrategy";
import { RelationshipStrategy } from "../RelationshipStrategy";

describe("selection strategies", () => {
  const catalog = createSelectionCatalog();

  it("MovementPatternStrategy scores primary pattern matches higher", () => {
    const strategy = new MovementPatternStrategy();
    const context = createTestSelectionContext();
    const evaluations = strategy.evaluate(catalog, context);

    const bench = evaluations.find((entry) => entry.exerciseId === "bench-press");
    const squat = evaluations.find((entry) => entry.exerciseId === "back-squat");

    expect(bench?.accepted).toBe(true);
    expect((bench?.scoreParts.movementPattern ?? 0) > (squat?.scoreParts.movementPattern ?? 0)).toBe(
      true,
    );
  });

  it("EquipmentStrategy hard-rejects missing required equipment", () => {
    const strategy = new EquipmentStrategy();
    const context = createTestSelectionContext({
      availableEquipment: ["dumbbell"],
    });
    const evaluations = strategy.evaluate(catalog, context);
    const bench = evaluations.find((entry) => entry.exerciseId === "bench-press");
    const dbBench = evaluations.find(
      (entry) => entry.exerciseId === "dumbbell-bench-press",
    );

    expect(bench?.accepted).toBe(false);
    expect(dbBench?.accepted).toBe(true);
  });

  it("DifficultyStrategy rejects exercises above the cap", () => {
    const strategy = new DifficultyStrategy();
    const context = createTestSelectionContext({
      maxDifficulty: "beginner",
    });
    const evaluations = strategy.evaluate(catalog, context);
    const snatch = evaluations.find((entry) => entry.exerciseId === "muscle-snatch");
    const goblet = evaluations.find((entry) => entry.exerciseId === "goblet-squat");

    expect(snatch?.accepted).toBe(false);
    expect(goblet?.accepted).toBe(true);
  });

  it("GoalStrategy rewards matching allowed goals", () => {
    const strategy = new GoalStrategy();
    const context = createTestSelectionContext();
    const evaluations = strategy.evaluate(catalog, context);
    const bench = evaluations.find((entry) => entry.exerciseId === "bench-press");
    const snatch = evaluations.find((entry) => entry.exerciseId === "muscle-snatch");

    expect((bench?.scoreParts.goal ?? 0) > (snatch?.scoreParts.goal ?? 0)).toBe(
      true,
    );
  });

  it("ConstraintStrategy hard-rejects contraindicated exercises", () => {
    const strategy = new ConstraintStrategy();
    const context = createTestSelectionContext();
    // inject hard constraint via context rebuild
    const constrained = {
      ...context,
      constraints: Object.freeze([
        {
          kind: "injury",
          code: "acute_knee_pain",
          severity: "hard" as const,
          source: "blueprint" as const,
        },
      ]),
    };
    const evaluations = strategy.evaluate(catalog, constrained);
    const squat = evaluations.find((entry) => entry.exerciseId === "back-squat");
    expect(squat?.accepted).toBe(false);
  });

  it("ConstraintStrategy rejects explicitly excluded ids", () => {
    const strategy = new ConstraintStrategy();
    const context = createTestSelectionContext({
      excludedExerciseIds: ["bench-press"],
    });
    const evaluations = strategy.evaluate(catalog, context);
    const bench = evaluations.find((entry) => entry.exerciseId === "bench-press");
    expect(bench?.accepted).toBe(false);
  });

  it("RelationshipStrategy scores denser graphs higher", () => {
    const strategy = new RelationshipStrategy();
    const context = createTestSelectionContext();
    const evaluations = strategy.evaluate(catalog, context);
    const bench = evaluations.find((entry) => entry.exerciseId === "bench-press");
    const extension = evaluations.find(
      (entry) => entry.exerciseId === "leg-extension",
    );

    expect(
      (bench?.scoreParts.relationship ?? 0) >
        (extension?.scoreParts.relationship ?? 0),
    ).toBe(true);
  });

  it("strategies are independent (no cross-mutation)", () => {
    const movement = new MovementPatternStrategy();
    const equipment = new EquipmentStrategy();
    const context = createTestSelectionContext({
      availableEquipment: ["barbell", "dumbbell"],
    });

    const before = catalog.map((exercise) => exercise.id);
    movement.evaluate(catalog, context);
    equipment.evaluate(catalog, context);
    const after = catalog.map((exercise) => exercise.id);

    expect(after).toEqual(before);
  });
});
