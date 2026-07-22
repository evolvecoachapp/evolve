import type { CandidateExercise } from "../../exercise-selection/models/CandidateExercise";
import type { CandidateRole } from "../../exercise-selection/models/CandidateRole";
import type { ExerciseSelectionResult } from "../../exercise-selection/models/ExerciseSelectionResult";
import { createEmptySelectionScore } from "../../exercise-selection/models/SelectionScore";
import {
  createSelectionCatalog,
  createUpperBodySelectionRequest,
  FIXED_TIMESTAMP,
} from "../../exercise-selection/testSupport/fixtures";
import { buildSelectionContext } from "../../exercise-selection/utils/buildSelectionContext";
import { freezeSelectionResult } from "../../exercise-selection/utils/freezeSelectionResult";
import type { ExerciseDefinition } from "../../exercise-kb/models/ExerciseDefinition";
import type { ProgrammingRequest } from "../models/ProgrammingRequest";
import { buildProgrammingContext } from "../utils/buildProgrammingContext";

export { FIXED_TIMESTAMP };

export function createProgrammingCandidate(
  exercise: ExerciseDefinition,
  role: CandidateRole,
  rank: number,
): CandidateExercise {
  return Object.freeze({
    exerciseId: exercise.id,
    exercise,
    role,
    score: createEmptySelectionScore(),
    reasons: Object.freeze([
      Object.freeze({ code: `selected_as_${role}`, weight: 1 }),
    ]),
    rank,
  });
}

export function createSampleSelectionResult(
  overrides: {
    readonly candidates?: readonly CandidateExercise[];
    readonly requestId?: string;
  } = {},
): ExerciseSelectionResult {
  const selectionRequest = createUpperBodySelectionRequest({
    availableEquipment: ["barbell", "dumbbell", "cable", "machine"],
  });
  const context = buildSelectionContext(selectionRequest);
  const catalog = createSelectionCatalog();
  const byId = new Map(catalog.map((exercise) => [exercise.id, exercise]));

  const candidates =
    overrides.candidates ??
    Object.freeze([
      createProgrammingCandidate(byId.get("bench-press")!, "primary", 1),
      createProgrammingCandidate(byId.get("barbell-row")!, "secondary", 1),
      createProgrammingCandidate(byId.get("tricep-pushdown")!, "accessory", 1),
    ]);

  const groups = Object.freeze([
    Object.freeze({
      role: "primary" as const,
      candidates: Object.freeze(
        candidates.filter((entry) => entry.role === "primary"),
      ),
    }),
    Object.freeze({
      role: "secondary" as const,
      candidates: Object.freeze(
        candidates.filter((entry) => entry.role === "secondary"),
      ),
    }),
    Object.freeze({
      role: "accessory" as const,
      candidates: Object.freeze(
        candidates.filter((entry) => entry.role === "accessory"),
      ),
    }),
  ]);

  return freezeSelectionResult({
    requestId: overrides.requestId ?? `selection:${context.blueprintId}:${context.dayId}`,
    context,
    groups,
    candidates,
    rejected: Object.freeze([]),
    explanations: Object.freeze(
      candidates.map((candidate) =>
        Object.freeze({
          exerciseId: candidate.exerciseId,
          role: candidate.role,
          summaryCode: `selected_as_${candidate.role}`,
          reasons: candidate.reasons,
          score: candidate.score,
        }),
      ),
    ),
    validationIssues: Object.freeze([]),
    selectedAt: FIXED_TIMESTAMP,
  });
}

export function createProgrammingRequest(
  overrides: Partial<ProgrammingRequest> = {},
): ProgrammingRequest {
  const selectionRequest = createUpperBodySelectionRequest({
    availableEquipment: ["barbell", "dumbbell", "cable", "machine"],
  });
  const selection =
    overrides.selection ?? createSampleSelectionResult();

  return Object.freeze({
    blueprint: overrides.blueprint ?? selectionRequest.blueprint,
    selection,
    dayId: overrides.dayId ?? selection.context.dayId,
    includeExplanations: overrides.includeExplanations,
  });
}

export function createTestProgrammingContext(
  overrides: Partial<ProgrammingRequest> = {},
) {
  return buildProgrammingContext(createProgrammingRequest(overrides));
}
