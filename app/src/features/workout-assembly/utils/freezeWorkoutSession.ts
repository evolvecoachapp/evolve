import type { WorkoutAssemblyContext } from "../models/WorkoutAssemblyContext";
import type { WorkoutAssemblyExplanation } from "../models/WorkoutAssemblyExplanation";
import type { WorkoutAssemblyResult } from "../models/WorkoutAssemblyResult";
import type { WorkoutAssemblyScore } from "../models/WorkoutAssemblyScore";
import type { WorkoutBlock } from "../models/WorkoutBlock";
import type { WorkoutExercise, WorkoutSet } from "../models/WorkoutExercise";
import type { WorkoutSession } from "../models/WorkoutSession";
import { normalizeSession } from "./normalizeSession";

/**
 * Deep-freeze a WorkoutSession for immutability guarantees.
 */
export function freezeWorkoutSession(session: WorkoutSession): WorkoutSession {
  return normalizeSession(session);
}

/**
 * Deep-freeze a WorkoutAssemblyResult for immutability guarantees.
 */
export function freezeWorkoutAssemblyResult(
  result: WorkoutAssemblyResult,
): WorkoutAssemblyResult {
  return Object.freeze({
    requestId: result.requestId,
    context: freezeContext(result.context),
    session: freezeWorkoutSession(result.session),
    explanations: Object.freeze(result.explanations.map(freezeExplanation)),
    validationIssues: Object.freeze([...result.validationIssues]),
    score: freezeScore(result.score),
    assembledAt: result.assembledAt,
  });
}

function freezeContext(context: WorkoutAssemblyContext): WorkoutAssemblyContext {
  return Object.freeze({
    ...context,
    focus: Object.freeze({ ...context.focus }),
    priority: Object.freeze({ ...context.priority }),
    constraints: Object.freeze(
      context.constraints.map((constraint) => Object.freeze({ ...constraint })),
    ),
  });
}

function freezeExplanation(
  explanation: WorkoutAssemblyExplanation,
): WorkoutAssemblyExplanation {
  return Object.freeze({
    ...explanation,
    score: freezeScore(explanation.score),
    reasons: Object.freeze(
      explanation.reasons.map((reason) => Object.freeze({ ...reason })),
    ),
  });
}

function freezeScore(score: WorkoutAssemblyScore): WorkoutAssemblyScore {
  return Object.freeze({ ...score });
}

export function freezeExercise(exercise: WorkoutExercise): WorkoutExercise {
  return Object.freeze({
    ...exercise,
    sets: Object.freeze(exercise.sets.map((set): WorkoutSet => Object.freeze({ ...set }))),
    notes: Object.freeze([...exercise.notes]),
    cues: Object.freeze([...exercise.cues]),
    appliedRecommendationIds: Object.freeze([
      ...exercise.appliedRecommendationIds,
    ]),
    tempo: exercise.tempo ? Object.freeze({ ...exercise.tempo }) : null,
  });
}

export function freezeBlock(block: WorkoutBlock): WorkoutBlock {
  return Object.freeze({
    ...block,
    exerciseIds: Object.freeze([...block.exerciseIds]),
  });
}
