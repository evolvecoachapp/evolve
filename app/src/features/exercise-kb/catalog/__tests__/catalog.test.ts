import {
  getIllustrativeCatalogSize,
  ILLUSTRATIVE_EXERCISE_CATALOG,
} from "../index";
import { validateExerciseDefinition } from "../../validators";

describe("illustrative exercise catalog", () => {
  it("contains 20–30 representative exercises", () => {
    const size = getIllustrativeCatalogSize();
    expect(size).toBeGreaterThanOrEqual(20);
    expect(size).toBeLessThanOrEqual(30);
    expect(size).toBe(ILLUSTRATIVE_EXERCISE_CATALOG.length);
  });

  it("includes required example exercises", () => {
    const ids = new Set(ILLUSTRATIVE_EXERCISE_CATALOG.map((entry) => entry.id));
    for (const expected of [
      "back-squat",
      "front-squat",
      "safety-bar-squat",
      "paused-squat",
      "bench-press",
      "incline-bench",
      "close-grip-bench",
      "overhead-press",
      "deadlift",
      "romanian-deadlift",
      "sumo-deadlift",
      "barbell-row",
      "chest-supported-row",
      "pull-up",
      "lat-pulldown",
      "leg-press",
      "hack-squat",
      "bulgarian-split-squat",
      "hip-thrust",
      "leg-curl",
    ]) {
      expect(ids.has(expected)).toBe(true);
    }
  });

  it("every catalog entry is structurally valid and frozen", () => {
    for (const definition of ILLUSTRATIVE_EXERCISE_CATALOG) {
      expect(validateExerciseDefinition(definition)).toEqual([]);
      expect(Object.isFrozen(definition)).toBe(true);
      expect(definition.metadata.source).toBe("catalog");
    }
  });

  it("relationship targets resolve within the catalog", () => {
    const ids = new Set(ILLUSTRATIVE_EXERCISE_CATALOG.map((entry) => entry.id));
    for (const definition of ILLUSTRATIVE_EXERCISE_CATALOG) {
      for (const edge of definition.relationships) {
        expect(ids.has(edge.targetExerciseId)).toBe(true);
      }
    }
  });
});
