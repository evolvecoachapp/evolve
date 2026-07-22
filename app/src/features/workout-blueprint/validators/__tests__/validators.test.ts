import {
  validateBlueprint,
  validateConstraints,
  validateTrainingBlock,
  validateTrainingFocus,
  validateWorkoutSplit,
} from "../index";
import {
  createTrainingBlock,
  createTrainingFocus,
  createWorkoutBlueprint,
  createWorkoutConstraint,
  createWorkoutSplit,
} from "../../testSupport/fixtures";

describe("workout-blueprint validators", () => {
  it("validateBlueprint accepts a well-formed blueprint", () => {
    expect(validateBlueprint(createWorkoutBlueprint())).toEqual([]);
  });

  it("validateBlueprint rejects missing id", () => {
    expect(validateBlueprint(createWorkoutBlueprint({ id: "" }))).toContain(
      "missing_id",
    );
  });

  it("validateBlueprint rejects frequency/split mismatch", () => {
    expect(
      validateBlueprint(
        createWorkoutBlueprint({
          weeklyFrequency: 2,
          split: { type: "upper_lower", daysPerWeek: 4, cycleLengthDays: 7 },
        }),
      ),
    ).toContain("frequency_split_mismatch");
  });

  it("validateWorkoutSplit rejects invalid days per week", () => {
    expect(
      validateWorkoutSplit(createWorkoutSplit({ daysPerWeek: 0 })),
    ).toContain("invalid_days_per_week");
  });

  it("validateTrainingFocus rejects unknown areas", () => {
    expect(
      validateTrainingFocus({ primary: "not_a_focus", secondary: null }),
    ).toContain("invalid_primary_focus");
    expect(validateTrainingFocus(createTrainingFocus())).toEqual([]);
  });

  it("validateTrainingBlock rejects invalid week count", () => {
    expect(
      validateTrainingBlock(createTrainingBlock({ weekCount: 0 })),
    ).toContain("invalid_block_week_count");
  });

  it("validateConstraints rejects malformed entries", () => {
    expect(validateConstraints("nope")).toContain("invalid_constraints");
    expect(validateConstraints([createWorkoutConstraint()])).toEqual([]);
    expect(
      validateConstraints([{ kind: "time", code: "", severity: "soft" }]),
    ).toContain("missing_constraint_code");
  });
});
