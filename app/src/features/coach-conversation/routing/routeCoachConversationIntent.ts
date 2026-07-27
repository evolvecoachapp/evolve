import { isWorkoutModificationMessage } from "../../workout-generation-pipeline/modification";
import {
  CoachConversationIntents,
  type CoachConversationIntent,
} from "../models/CoachConversationIntent";

interface IntentRule {
  readonly intent: CoachConversationIntent;
  readonly patterns: readonly RegExp[];
}

const INTENT_RULES: readonly IntentRule[] = Object.freeze([
  {
    intent: CoachConversationIntents.WORKOUT_SUMMARY,
    patterns: Object.freeze([
      /\b(summar(y|ize)|overview|recap|tl;?dr)\b/i,
      /\bwhat('?s| is) (my |the )?(workout|plan)\b/i,
    ]),
  },
  {
    intent: CoachConversationIntents.EXERCISE_EXPLANATION,
    patterns: Object.freeze([
      /\bwhy (this|that|these) (exercise|movement|lift)/i,
      /\bexplain .{0,40}\b(squat|bench|deadlift|press|row|pull|curl)\b/i,
      /\b(explain|why).{0,40}\b(exercise|movement|lift)\b/i,
    ]),
  },
  {
    intent: CoachConversationIntents.PROGRESSION_EXPLANATION,
    patterns: Object.freeze([
      /\b(explain|why).{0,40}\b(progress(ion|ing)?|overload|deload)\b/i,
      /\bhow (do i|should i) progress\b/i,
    ]),
  },
  {
    intent: CoachConversationIntents.RECOVERY_EXPLANATION,
    patterns: Object.freeze([
      /\b(explain|why).{0,40}\b(recover(y|ing)?|rest day|readiness)\b/i,
      /\bwhy .{0,30}\b(rest|recover)\b/i,
    ]),
  },
  {
    intent: CoachConversationIntents.RECOMMENDATION_EXPLANATION,
    patterns: Object.freeze([
      /\b(recommend(ation|ed|s)?|suggest(ion|ed|s)?|advice)\b/i,
      /\bwhy (did|do) you recommend\b/i,
    ]),
  },
  {
    intent: CoachConversationIntents.WORKOUT_EXPLANATION,
    patterns: Object.freeze([
      /\b(explain|why|rationale|reason).{0,40}\b(workout|plan|session|today)\b/i,
      /\btoday'?s workout\b/i,
      /\bexplain (my |the )?workout\b/i,
    ]),
  },
  {
    intent: CoachConversationIntents.GENERAL_COACHING,
    patterns: Object.freeze([
      /\b(coach(ing)?|guide|help|tips?|how should i|what should i)\b/i,
      /\btraining advice\b/i,
    ]),
  },
]);

/**
 * Deterministic keyword intent router for coaching conversation.
 * Adaptive modification requests are detected first (Sprint 24.3).
 * Reuses Supervisor Routing downstream for capability planning.
 */
export function routeCoachConversationIntent(
  message: string,
  hint: CoachConversationIntent | null = null,
): CoachConversationIntent {
  if (hint && hint !== CoachConversationIntents.UNKNOWN) {
    return hint;
  }

  const trimmed = message.trim();
  if (!trimmed) {
    return CoachConversationIntents.UNKNOWN;
  }

  // Adaptive modification takes precedence over explain/summary intents.
  if (isWorkoutModificationMessage(trimmed)) {
    return CoachConversationIntents.WORKOUT_MODIFICATION;
  }

  for (const rule of INTENT_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(trimmed))) {
      return rule.intent;
    }
  }

  return CoachConversationIntents.UNKNOWN;
}
