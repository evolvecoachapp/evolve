import type { CandidateExercise } from "../models/CandidateExercise";
import type { ExerciseCandidateGroup } from "../models/ExerciseCandidateGroup";
import type { ExerciseSelectionResult } from "../models/ExerciseSelectionResult";
import type { RejectedExercise } from "../models/RejectedExercise";
import type { SelectionContext } from "../models/SelectionContext";
import type { SelectionExplanation } from "../models/SelectionExplanation";
import type { SelectionScore } from "../models/SelectionScore";

/**
 * Deep-freeze an ExerciseSelectionResult for immutability guarantees.
 */
export function freezeSelectionResult(
  result: ExerciseSelectionResult,
): ExerciseSelectionResult {
  return Object.freeze({
    requestId: result.requestId,
    context: freezeContext(result.context),
    groups: Object.freeze(result.groups.map(freezeGroup)),
    candidates: Object.freeze(result.candidates.map(freezeCandidate)),
    rejected: Object.freeze(result.rejected.map(freezeRejected)),
    explanations: Object.freeze(result.explanations.map(freezeExplanation)),
    validationIssues: Object.freeze([...result.validationIssues]),
    selectedAt: result.selectedAt,
  });
}

function freezeContext(context: SelectionContext): SelectionContext {
  return Object.freeze({
    ...context,
    focus: Object.freeze({ ...context.focus }),
    priority: Object.freeze({ ...context.priority }),
    requiredMovementPatterns: Object.freeze([
      ...context.requiredMovementPatterns,
    ]),
    secondaryMovementPatterns: Object.freeze([
      ...context.secondaryMovementPatterns,
    ]),
    availableEquipment: context.availableEquipment
      ? Object.freeze([...context.availableEquipment])
      : null,
    constraints: Object.freeze(
      context.constraints.map((constraint) => Object.freeze({ ...constraint })),
    ),
    excludedExerciseIds: Object.freeze([...context.excludedExerciseIds]),
    goalCodes: Object.freeze([...context.goalCodes]),
  });
}

function freezeGroup(group: ExerciseCandidateGroup): ExerciseCandidateGroup {
  return Object.freeze({
    role: group.role,
    candidates: Object.freeze(group.candidates.map(freezeCandidate)),
  });
}

function freezeCandidate(candidate: CandidateExercise): CandidateExercise {
  return Object.freeze({
    ...candidate,
    score: freezeScore(candidate.score),
    reasons: Object.freeze(
      candidate.reasons.map((reason) => Object.freeze({ ...reason })),
    ),
  });
}

function freezeRejected(rejected: RejectedExercise): RejectedExercise {
  return Object.freeze({
    ...rejected,
    reasons: Object.freeze(
      rejected.reasons.map((reason) => Object.freeze({ ...reason })),
    ),
  });
}

function freezeExplanation(
  explanation: SelectionExplanation,
): SelectionExplanation {
  return Object.freeze({
    ...explanation,
    score: freezeScore(explanation.score),
    reasons: Object.freeze(
      explanation.reasons.map((reason) => Object.freeze({ ...reason })),
    ),
  });
}

function freezeScore(score: SelectionScore): SelectionScore {
  return Object.freeze({ ...score });
}
