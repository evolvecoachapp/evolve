import type { ExerciseProgression } from "../models/ExerciseProgression";
import type { ProgressionContext } from "../models/ProgressionContext";
import type { ProgressionExplanation } from "../models/ProgressionExplanation";
import type { ProgressionPlan } from "../models/ProgressionPlan";
import type { ProgressionScore } from "../models/ProgressionScore";
import type { ProgressionStep } from "../models/ProgressionStep";
import type { ProgressionTarget } from "../models/ProgressionTarget";
import type { ProgressionWindow } from "../models/ProgressionWindow";

/**
 * Deep-freeze a ProgressionPlan for immutability guarantees.
 */
export function freezeProgressionPlan(plan: ProgressionPlan): ProgressionPlan {
  return Object.freeze({
    requestId: plan.requestId,
    context: freezeContext(plan.context),
    exerciseProgressions: Object.freeze(
      plan.exerciseProgressions.map(freezeExerciseProgression),
    ),
    timeline: Object.freeze(plan.timeline.map(freezeProgressionStep)),
    explanations: Object.freeze(plan.explanations.map(freezeExplanation)),
    validationIssues: Object.freeze([...plan.validationIssues]),
    score: freezeScore(plan.score),
    progressedAt: plan.progressedAt,
  });
}

/**
 * Deep-freeze a single ExerciseProgression.
 */
export function freezeExerciseProgression(
  progression: ExerciseProgression,
): ExerciseProgression {
  return Object.freeze({
    ...progression,
    steps: Object.freeze(progression.steps.map(freezeProgressionStep)),
    score: freezeScore(progression.score),
    reasons: Object.freeze(
      progression.reasons.map((reason) => Object.freeze({ ...reason })),
    ),
  });
}

/**
 * Deep-freeze a single ProgressionStep.
 */
export function freezeProgressionStep(step: ProgressionStep): ProgressionStep {
  return Object.freeze({
    ...step,
    target: freezeTarget(step.target),
    notes: Object.freeze([...step.notes]),
    score: freezeScore(step.score),
    reasons: Object.freeze(
      step.reasons.map((reason) => Object.freeze({ ...reason })),
    ),
  });
}

function freezeContext(context: ProgressionContext): ProgressionContext {
  return Object.freeze({
    ...context,
    focus: Object.freeze({ ...context.focus }),
    priority: Object.freeze({ ...context.priority }),
    window: freezeWindow(context.window),
    constraints: Object.freeze(
      context.constraints.map((constraint) => Object.freeze({ ...constraint })),
    ),
  });
}

function freezeWindow(window: ProgressionWindow): ProgressionWindow {
  return Object.freeze({ ...window });
}

function freezeTarget(target: ProgressionTarget): ProgressionTarget {
  return Object.freeze({ ...target });
}

function freezeExplanation(
  explanation: ProgressionExplanation,
): ProgressionExplanation {
  return Object.freeze({
    ...explanation,
    score: freezeScore(explanation.score),
    reasons: Object.freeze(
      explanation.reasons.map((reason) => Object.freeze({ ...reason })),
    ),
  });
}

function freezeScore(score: ProgressionScore): ProgressionScore {
  return Object.freeze({ ...score });
}
