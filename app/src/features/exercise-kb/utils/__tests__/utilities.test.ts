import {
  calculateEquipmentScore,
  calculateExerciseComplexity,
  freezeExerciseDefinition,
  normalizeExerciseDefinition,
  rankAlternatives,
} from "../index";
import {
  createExerciseDefinition,
  FIXED_TIMESTAMP,
} from "../../testSupport/fixtures";

describe("exercise-kb utilities", () => {
  it("freezeExerciseDefinition deep-freezes nested structures", () => {
    const frozen = freezeExerciseDefinition(
      createExerciseDefinition({
        id: "freeze-1",
        name: "Freeze",
        movementPattern: "squat",
        primaryMuscles: ["quads"],
        equipment: ["barbell"],
        pushPullLegs: "legs",
        fatigueScore: 5,
        jointStress: 5,
        axialLoading: true,
        tags: ["squat_pattern"],
      }),
    );

    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isFrozen(frozen.primaryMuscles[0])).toBe(true);
    expect(Object.isFrozen(frozen.metadata.tags)).toBe(true);
  });

  it("normalizeExerciseDefinition fills defaults for sparse input", () => {
    const normalized = normalizeExerciseDefinition(
      { name: "Sparse", movementPattern: "hinge" },
      { id: "norm-1", createdAt: FIXED_TIMESTAMP, source: "derived" },
    );

    expect(normalized.id).toBe("norm-1");
    expect(normalized.movementPattern.code).toBe("hinge");
    expect(normalized.primaryMuscles.length).toBeGreaterThan(0);
    expect(normalized.metadata.source).toBe("derived");
  });

  it("calculateExerciseComplexity scores metadata", () => {
    const simple = createExerciseDefinition({
      id: "simple",
      name: "Simple",
      movementPattern: "isolation",
      primaryMuscles: ["biceps"],
      equipment: ["dumbbell"],
      difficulty: "beginner",
      skillScore: 1,
      category: "isolation",
      isCompound: false,
      pushPullLegs: "pull",
      fatigueScore: 2,
      jointStress: 1,
      axialLoading: false,
    });

    const hard = createExerciseDefinition({
      id: "hard",
      name: "Hard",
      movementPattern: "squat",
      primaryMuscles: ["quads", "glutes"],
      equipment: ["barbell"],
      difficulty: "advanced",
      skillScore: 8,
      pushPullLegs: "legs",
      fatigueScore: 9,
      jointStress: 8,
      axialLoading: true,
    });

    expect(calculateExerciseComplexity(hard)).toBeGreaterThan(
      calculateExerciseComplexity(simple),
    );
  });

  it("calculateEquipmentScore weights equipment demand", () => {
    const bodyweight = createExerciseDefinition({
      id: "bw",
      name: "BW",
      movementPattern: "vertical_pull",
      primaryMuscles: ["lats"],
      equipment: ["bodyweight"],
      pushPullLegs: "pull",
      fatigueScore: 5,
      jointStress: 4,
      axialLoading: false,
    });
    const barbell = createExerciseDefinition({
      id: "bb",
      name: "BB",
      movementPattern: "squat",
      primaryMuscles: ["quads"],
      equipment: ["barbell"],
      pushPullLegs: "legs",
      fatigueScore: 5,
      jointStress: 4,
      axialLoading: true,
    });

    expect(calculateEquipmentScore(barbell)).toBeGreaterThan(
      calculateEquipmentScore(bodyweight),
    );
  });

  it("rankAlternatives orders by strength and proximity", () => {
    const source = createExerciseDefinition({
      id: "source",
      name: "Source",
      movementPattern: "squat",
      primaryMuscles: ["quads"],
      equipment: ["barbell"],
      pushPullLegs: "legs",
      fatigueScore: 8,
      jointStress: 6,
      axialLoading: true,
      relationships: [
        { kind: "alternative", targetExerciseId: "close", strength: 0.9 },
        { kind: "alternative", targetExerciseId: "far", strength: 0.4 },
        { kind: "progression", targetExerciseId: "prog", strength: 0.95 },
      ],
    });

    const candidates = [
      createExerciseDefinition({
        id: "close",
        name: "Close",
        movementPattern: "squat",
        primaryMuscles: ["quads"],
        equipment: ["machine"],
        pushPullLegs: "legs",
        fatigueScore: 7,
        jointStress: 5,
        axialLoading: false,
      }),
      createExerciseDefinition({
        id: "far",
        name: "Far",
        movementPattern: "hinge",
        primaryMuscles: ["hamstrings"],
        equipment: ["barbell"],
        pushPullLegs: "legs",
        fatigueScore: 3,
        jointStress: 3,
        axialLoading: true,
      }),
      createExerciseDefinition({
        id: "prog",
        name: "Prog",
        movementPattern: "squat",
        primaryMuscles: ["quads"],
        equipment: ["barbell"],
        pushPullLegs: "legs",
        fatigueScore: 9,
        jointStress: 7,
        axialLoading: true,
      }),
    ];

    const ranked = rankAlternatives(
      source,
      candidates,
      source.relationships,
    );

    expect(ranked.map((entry) => entry.exercise.id)).toEqual(["close", "far"]);
    expect(ranked[0]!.score).toBeGreaterThan(ranked[1]!.score);
  });
});
