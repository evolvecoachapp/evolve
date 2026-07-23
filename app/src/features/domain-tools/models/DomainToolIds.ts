/**
 * Stable tool ids for Domain Tool Adapters.
 *
 * Naming: `domain.<family>.<operation>`
 */
export const DomainToolIds = Object.freeze({
  WORKOUT_GENERATE: "domain.workout.generate",
  WORKOUT_ANALYZE_PERFORMANCE: "domain.workout.analyze_performance",
  ATHLETE_BUILD_HISTORY: "domain.athlete.build_history",
  ATHLETE_SUMMARIZE_HISTORY: "domain.athlete.summarize_history",
  ATHLETE_EVALUATE_ACHIEVEMENTS: "domain.athlete.evaluate_achievements",
  RECOVERY_ANALYZE: "domain.recovery.analyze",
  RECOVERY_SUMMARIZE: "domain.recovery.summarize",
  COACH_PREPARE_CONTEXT: "domain.coach.prepare_context",
  COACH_GENERATE_INSIGHTS: "domain.coach.generate_insights",
  COACH_SUMMARIZE: "domain.coach.summarize",
} as const);

export type DomainToolId =
  (typeof DomainToolIds)[keyof typeof DomainToolIds];

export const ALL_DOMAIN_TOOL_IDS = Object.freeze(
  Object.values(DomainToolIds),
) as readonly DomainToolId[];
