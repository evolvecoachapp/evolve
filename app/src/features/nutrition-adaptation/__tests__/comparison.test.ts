import { compareMeals } from "../comparison/MealComparator";
import { comparePlans } from "../comparison/PlanComparator";
import { diffKeys } from "../comparison/diffHelpers";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("nutrition-adaptation comparison", () => {
  it("produces immutable key diffs", () => {
    const diff = diffKeys(
      Object.freeze(["a", "b"]),
      Object.freeze(["b", "c"]),
    );
    expect(diff.added).toEqual(["c"]);
    expect(diff.removed).toEqual(["a"]);
    expect(diff.shared).toEqual(["b"]);
    expect(Object.isFrozen(diff)).toBe(true);

    const comparison = comparePlans({
      id: "cmp",
      athleteId: "athlete:1",
      planId: "plan:1",
      beforeKeys: Object.freeze(["a"]),
      afterKeys: Object.freeze(["a", "b"]),
      at: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(comparison)).toBe(true);
    expect(comparison.addedKeys).toEqual(["b"]);

    expect(compareMeals(["m1"], ["m1", "m2"]).added).toEqual(["m2"]);
  });
});
