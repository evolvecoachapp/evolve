import { createExerciseDefinition } from "../../../exercise-kb/testSupport/fixtures";
import { createWorkoutBlueprint } from "../../../workout-blueprint/testSupport/fixtures";
import type { CandidateExercise } from "../../models/CandidateExercise";
import { createEmptySelectionScore } from "../../models/SelectionScore";
import {
  createTestSelectionContext,
  createUpperBodySelectionRequest,
} from "../../testSupport/fixtures";
import {
  validateBlueprintCompatibility,
  validateCandidateConsistency,
  validateConstraintViolations,
  validateDuplicates,
  validateRelationships,
  validateSelectionResult,
} from "../index";

function candidate(
  overrides: Partial<CandidateExercise> & { id?: string } = {},
): CandidateExercise {
  const exercise =
    overrides.exercise ??
    createExerciseDefinition({
      id: overrides.id ?? "bench-press",
      name: "Bench Press",
      movementPattern: "horizontal_push",
      primaryMuscles: ["chest"],
      equipment: ["barbell"],
      pushPullLegs: "push",
      fatigueScore: 5,
      jointStress: 4,
      axialLoading: false,
    });

  return Object.freeze({
    exerciseId: overrides.exerciseId ?? exercise.id,
    exercise,
    role: overrides.role ?? "primary",
    score: overrides.score ?? createEmptySelectionScore(),
    reasons: overrides.reasons ?? Object.freeze([]),
    rank: overrides.rank ?? 1,
  });
}

describe("selection validators", () => {
  it("validateBlueprintCompatibility flags missing training days", () => {
    const issues = validateBlueprintCompatibility({
      blueprint: createWorkoutBlueprint({
        days: [
          {
            id: "rest",
            dayIndex: 0,
            name: "Rest",
            isRestDay: true,
            focus: { primary: "full_body", secondary: null },
            sessionGoal: "rest",
            estimatedDurationMinutes: null,
          },
        ],
      }),
    });
    expect(issues).toContain("blueprint_no_training_day");
  });

  it("validateCandidateConsistency detects id mismatches", () => {
    const issues = validateCandidateConsistency(
      [candidate({ exerciseId: "wrong-id" })],
      createTestSelectionContext(),
    );
    expect(issues.some((issue) => issue.startsWith("candidate_id_mismatch"))).toBe(
      true,
    );
  });

  it("validateDuplicates detects same id twice in a role", () => {
    const issues = validateDuplicates([
      candidate({ id: "bench-press", role: "primary", rank: 1 }),
      candidate({ id: "bench-press", role: "primary", rank: 2 }),
    ]);
    expect(issues).toContain("duplicate_in_role:primary:bench-press");
  });

  it("validateRelationships flags self-referential edges", () => {
    const exercise = createExerciseDefinition({
      id: "self-ref",
      name: "Self",
      movementPattern: "isolation",
      primaryMuscles: ["biceps"],
      equipment: ["dumbbell"],
      pushPullLegs: "pull",
      isCompound: false,
      fatigueScore: 2,
      jointStress: 1,
      axialLoading: false,
      relationships: [
        { kind: "alternative", targetExerciseId: "self-ref", strength: 1 },
      ],
    });
    const issues = validateRelationships([
      candidate({ exercise, exerciseId: "self-ref", role: "accessory" }),
    ]);
    expect(issues).toContain("relationship_self_reference:self-ref");
  });

  it("validateConstraintViolations flags hard constraint hits", () => {
    const exercise = createExerciseDefinition({
      id: "back-squat",
      name: "Back Squat",
      movementPattern: "squat",
      primaryMuscles: ["quads"],
      equipment: ["barbell"],
      pushPullLegs: "legs",
      fatigueScore: 9,
      jointStress: 7,
      axialLoading: true,
      contraindications: ["acute_knee_pain"],
    });
    const context = {
      ...createTestSelectionContext(),
      constraints: Object.freeze([
        {
          kind: "injury",
          code: "acute_knee_pain",
          severity: "hard" as const,
          source: "blueprint" as const,
        },
      ]),
    };
    const issues = validateConstraintViolations(
      [candidate({ exercise, exerciseId: "back-squat" })],
      context,
    );
    expect(
      issues.some((issue) => issue.includes("hard_constraint_on_candidate")),
    ).toBe(true);
  });

  it("validateSelectionResult aggregates unique issues", () => {
    const issues = validateSelectionResult(
      createUpperBodySelectionRequest(),
      createTestSelectionContext(),
      [
        candidate({ exerciseId: "wrong", rank: 0 }),
        candidate({ id: "a", role: "primary", rank: 1 }),
        candidate({ id: "a", role: "primary", rank: 2 }),
      ],
    );
    expect(issues.length).toBeGreaterThan(0);
    expect(new Set(issues).size).toBe(issues.length);
  });
});
