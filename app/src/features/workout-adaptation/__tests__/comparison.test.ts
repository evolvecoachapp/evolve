import { compareBlueprints } from "../comparison/BlueprintComparator";
import { compareExercises } from "../comparison/ExerciseComparator";
import { diffKeys } from "../comparison/diffHelpers";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("workout-adaptation comparison", () => {
  it("produces immutable key diffs", () => {
    const diff = diffKeys(
      Object.freeze(["a", "b"]),
      Object.freeze(["b", "c"]),
    );
    expect(diff.added).toEqual(["c"]);
    expect(diff.removed).toEqual(["a"]);
    expect(diff.shared).toEqual(["b"]);
    expect(Object.isFrozen(diff)).toBe(true);

    const comparison = compareBlueprints({
      id: "cmp",
      athleteId: "athlete:1",
      blueprintId: "blueprint:1",
      beforeKeys: Object.freeze(["a"]),
      afterKeys: Object.freeze(["a", "b"]),
      at: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(comparison)).toBe(true);
    expect(comparison.addedKeys).toEqual(["b"]);

    expect(compareExercises(["e1"], ["e1", "e2"]).added).toEqual(["e2"]);
  });
});
