import {
  WorkoutModificationKinds,
  type WorkoutModificationKind,
} from "../models/WorkoutModificationKind";

interface ModificationRule {
  readonly kind: WorkoutModificationKind;
  readonly patterns: readonly RegExp[];
}

/**
 * More specific contextual adaptations are evaluated before generic
 * volume/intensity/duration rules.
 */
const MODIFICATION_RULES: readonly ModificationRule[] = Object.freeze([
  {
    kind: WorkoutModificationKinds.REPLACE_EXERCISE,
    patterns: Object.freeze([
      /\b(replace|swap|switch|substitute)\b.{0,40}\b(exercise|movement|lift)\b/i,
      /\b(replace|swap|switch)\b.{0,60}\b(with|for)\b/i,
    ]),
  },
  {
    kind: WorkoutModificationKinds.REMOVE_EXERCISE,
    patterns: Object.freeze([
      /\b(remove|drop|delete|skip|cut)\b.{0,40}\b(exercise|movement|lift|set)\b/i,
      /\b(take out|leave out)\b.{0,40}\b(exercise|movement)\b/i,
    ]),
  },
  {
    kind: WorkoutModificationKinds.ADD_EXERCISE,
    patterns: Object.freeze([
      /\b(add|include|insert)\b.{0,40}\b(exercise|movement|lift)\b/i,
      /\b(add|include)\b.{0,40}\b(accessory|finisher)\b/i,
    ]),
  },
  {
    kind: WorkoutModificationKinds.EQUIPMENT_UNAVAILABLE,
    patterns: Object.freeze([
      /\b(equipment|machine|barbell|dumbbell|cable|bench)\b.{0,40}\b(unavailable|missing|broken|no access)\b/i,
      /\b(don'?t have|do not have|no)\b.{0,30}\b(equipment|gym|barbell|dumbbell|machine)\b/i,
      /\b(without|no)\b.{0,20}\b(equipment|machines?)\b/i,
    ]),
  },
  {
    kind: WorkoutModificationKinds.INJURY_LIMITATION,
    patterns: Object.freeze([
      /\b(injur(y|ed)|hurt|pain|sore shoulder|bad knee|tweak)\b/i,
      /\b(avoid|protect|limit)\b.{0,30}\b(shoulder|knee|back|wrist|elbow|hip)\b/i,
    ]),
  },
  {
    kind: WorkoutModificationKinds.FATIGUE_ADJUSTMENT,
    patterns: Object.freeze([
      /\b(fatigued?|exhausted|wiped)\b/i,
      /\b(adjust|adapt|modify)\b.{0,40}\b(for |due to )?(fatigue|exhaustion)\b/i,
      /\bi('?m| am) (too )?(tired|fatigued|exhausted)\b/i,
    ]),
  },
  {
    kind: WorkoutModificationKinds.RECOVERY_ADJUSTMENT,
    patterns: Object.freeze([
      /\b(recovery|deload)\b.{0,40}\b(adjust|adapt|modify|change)\b/i,
      /\b(adjust|adapt|modify)\b.{0,40}\b(for |due to )?recovery\b/i,
      /\b(need|needs)\b.{0,20}\b(recovery|deload)\b/i,
    ]),
  },
  {
    kind: WorkoutModificationKinds.FOCUS_MUSCLE_GROUP,
    patterns: Object.freeze([
      /\b(focus|emphasize|prioriti[sz]e)\b.{0,40}\b(chest|back|legs?|shoulders?|arms?|glutes?|core|push|pull|upper|lower)\b/i,
      /\b(more)\b.{0,20}\b(chest|back|legs?|shoulders?|arms?|glutes?|core)\b/i,
    ]),
  },
  {
    kind: WorkoutModificationKinds.REDUCE_DURATION,
    patterns: Object.freeze([
      /\b(reduce|shorten|decrease|cut)\b.{0,40}\b(duration|time|length|minutes?)\b/i,
      /\b(shorter|quicker|faster)\b.{0,20}\b(workout|session)\b/i,
      /\b(less time|make .{0,20} shorter)\b/i,
    ]),
  },
  {
    kind: WorkoutModificationKinds.INCREASE_DURATION,
    patterns: Object.freeze([
      /\b(increase|extend|lengthen)\b.{0,40}\b(duration|time|length|minutes?)\b/i,
      /\b(longer|more time)\b.{0,20}\b(workout|session)\b/i,
    ]),
  },
  {
    kind: WorkoutModificationKinds.REDUCE_INTENSITY,
    patterns: Object.freeze([
      /\b(reduce|lower|decrease|ease)\b.{0,40}\b(intensity|effort|rpe|load)\b/i,
      /\b(easier|lighter)\b.{0,20}\b(workout|session|sets?)\b/i,
    ]),
  },
  {
    kind: WorkoutModificationKinds.INCREASE_INTENSITY,
    patterns: Object.freeze([
      /\b(increase|raise|boost)\b.{0,40}\b(intensity|effort|rpe|load)\b/i,
      /\b(harder|heavier)\b.{0,20}\b(workout|session|sets?)\b/i,
    ]),
  },
  {
    kind: WorkoutModificationKinds.MODIFY_VOLUME,
    patterns: Object.freeze([
      /\b(modify|adjust|change|reduce|increase)\b.{0,40}\b(volume|sets?|reps?)\b/i,
      /\b(more|fewer|less)\b.{0,20}\b(sets?|reps?|volume)\b/i,
    ]),
  },
]);

/**
 * Deterministic keyword router for adaptive workout modification requests.
 */
export function routeWorkoutModificationKind(
  message: string,
  hint: WorkoutModificationKind | null = null,
): WorkoutModificationKind {
  if (hint && hint !== WorkoutModificationKinds.UNKNOWN) {
    return hint;
  }

  const trimmed = message.trim();
  if (!trimmed) {
    return WorkoutModificationKinds.UNKNOWN;
  }

  for (const rule of MODIFICATION_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(trimmed))) {
      return rule.kind;
    }
  }

  return WorkoutModificationKinds.UNKNOWN;
}

/**
 * True when the message looks like an adaptive modification request.
 */
export function isWorkoutModificationMessage(message: string): boolean {
  return (
    routeWorkoutModificationKind(message) !== WorkoutModificationKinds.UNKNOWN
  );
}
