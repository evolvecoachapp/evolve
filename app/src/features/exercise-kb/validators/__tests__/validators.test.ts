import {
  validateConstraints,
  validateExerciseDefinition,
  validateMetadata,
  validateRelationships,
} from "../index";
import { createExerciseDefinition, FIXED_TIMESTAMP } from "../../testSupport/fixtures";

describe("exercise-kb validators", () => {
  it("validateExerciseDefinition accepts a well-formed definition", () => {
    expect(
      validateExerciseDefinition(
        createExerciseDefinition({
          id: "valid-1",
          name: "Valid",
          movementPattern: "squat",
          primaryMuscles: ["quads"],
          equipment: ["barbell"],
          pushPullLegs: "legs",
          fatigueScore: 5,
          jointStress: 5,
          axialLoading: false,
        }),
      ),
    ).toEqual([]);
  });

  it("validateExerciseDefinition rejects missing id and name", () => {
    const issues = validateExerciseDefinition(
      createExerciseDefinition({
        id: "",
        name: "",
        movementPattern: "squat",
        primaryMuscles: ["quads"],
        equipment: ["barbell"],
        pushPullLegs: "legs",
        fatigueScore: 5,
        jointStress: 5,
        axialLoading: false,
      }),
    );
    expect(issues).toEqual(
      expect.arrayContaining(["missing_id", "missing_name"]),
    );
  });

  it("validateExerciseDefinition rejects out-of-range scores", () => {
    const base = createExerciseDefinition({
      id: "score-1",
      name: "Score",
      movementPattern: "squat",
      primaryMuscles: ["quads"],
      equipment: ["barbell"],
      pushPullLegs: "legs",
      fatigueScore: 5,
      jointStress: 5,
      axialLoading: false,
    });

    expect(
      validateExerciseDefinition({ ...base, fatigueScore: 11 }),
    ).toContain("invalid_fatigue_score");
  });

  it("validateRelationships rejects malformed edges", () => {
    expect(validateRelationships("nope")).toContain("invalid_relationships");
    expect(
      validateRelationships([
        { kind: "alternative", targetExerciseId: "a", strength: 0.5 },
      ]),
    ).toEqual([]);
    expect(
      validateRelationships([
        { kind: "alternative", targetExerciseId: "", strength: 2 },
      ]),
    ).toEqual(
      expect.arrayContaining([
        "missing_target_exercise_id",
        "invalid_relationship_strength",
      ]),
    );
  });

  it("validateConstraints rejects malformed entries", () => {
    expect(validateConstraints("nope")).toContain("invalid_constraints");
    expect(
      validateConstraints([
        { kind: "joint", code: "knee", severity: "soft" },
      ]),
    ).toEqual([]);
    expect(
      validateConstraints([{ kind: "joint", code: "", severity: "soft" }]),
    ).toContain("missing_constraint_code");
  });

  it("validateMetadata rejects missing fields", () => {
    expect(validateMetadata(null)).toEqual(
      expect.arrayContaining([
        "missing_metadata_version",
        "invalid_metadata_source",
      ]),
    );
    expect(
      validateMetadata({
        version: "1.0.0",
        source: "catalog",
        createdAt: FIXED_TIMESTAMP,
        updatedAt: FIXED_TIMESTAMP,
        tags: [{ code: "squat_pattern" }],
      }),
    ).toEqual([]);
  });
});
