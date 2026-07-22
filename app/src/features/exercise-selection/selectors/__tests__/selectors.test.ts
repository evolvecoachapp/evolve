import { createEmptySelectionScore } from "../../models/SelectionScore";
import {
  AccessoryExerciseSelector,
  PrimaryExerciseSelector,
  SecondaryExerciseSelector,
} from "../index";
import {
  createSelectionCatalog,
  createTestSelectionContext,
} from "../../testSupport/fixtures";
import { mergeScoreParts } from "../../utils/calculateSelectionScore";
import type { RankableCandidate } from "../../utils/rankCandidates";

function toScored(catalog = createSelectionCatalog()): readonly RankableCandidate[] {
  return Object.freeze(
    catalog.map((exercise) =>
      Object.freeze({
        exerciseId: exercise.id,
        exercise,
        score: mergeScoreParts({
          movementPattern: exercise.category.isCompound ? 4 : 1,
          category: exercise.category.isCompound ? 2 : 3,
        }),
        reasons: Object.freeze([
          { code: "fixture", weight: 1 },
        ]),
      }),
    ),
  );
}

describe("exercise role selectors", () => {
  const scored = toScored();

  it("PrimaryExerciseSelector returns compound pattern matches only", () => {
    const selector = new PrimaryExerciseSelector();
    const context = createTestSelectionContext({ maxCandidatesPerRole: 3 });
    const selected = selector.select(scored, context);

    expect(selected.every((entry) => entry.role === "primary")).toBe(true);
    expect(selected.every((entry) => entry.exercise.category.isCompound)).toBe(
      true,
    );
    expect(
      selected.every((entry) =>
        context.requiredMovementPatterns.includes(
          entry.exercise.movementPattern.code,
        ),
      ),
    ).toBe(true);
    expect(selected[0]?.rank).toBe(1);
  });

  it("SecondaryExerciseSelector prefers secondary focus patterns", () => {
    const selector = new SecondaryExerciseSelector();
    const context = createTestSelectionContext({ maxCandidatesPerRole: 3 });
    const selected = selector.select(scored, context);

    expect(selected.every((entry) => entry.role === "secondary")).toBe(true);
    expect(selected.length).toBeGreaterThan(0);
  });

  it("AccessoryExerciseSelector prefers isolation / accessory tagged work", () => {
    const selector = new AccessoryExerciseSelector();
    const context = createTestSelectionContext({ maxCandidatesPerRole: 3 });
    const selected = selector.select(scored, context);

    expect(selected.every((entry) => entry.role === "accessory")).toBe(true);
    expect(
      selected.some(
        (entry) =>
          !entry.exercise.category.isCompound ||
          entry.exercise.metadata.tags.some((tag) => tag.code === "accessory"),
      ),
    ).toBe(true);
  });

  it("respects maxCandidatesPerRole", () => {
    const selector = new PrimaryExerciseSelector();
    const context = createTestSelectionContext({ maxCandidatesPerRole: 1 });
    const selected = selector.select(scored, context);
    expect(selected.length).toBeLessThanOrEqual(1);
  });

  it("does not invent score objects", () => {
    expect(createEmptySelectionScore().total).toBe(0);
  });
});
