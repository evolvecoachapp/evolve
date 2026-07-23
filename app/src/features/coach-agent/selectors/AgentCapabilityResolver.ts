import type { CoachIntent } from "../models/CoachIntent";
import { CoachIntents } from "../models/CoachIntent";
import type { SpecialistAgentKind } from "../models/SpecialistAgentKind";
import {
  IMPLEMENTED_SPECIALIST_AGENTS,
  SpecialistAgentKinds,
} from "../models/SpecialistAgentKind";

/**
 * Deterministic specialist agent selection for the Coach meta-agent.
 * No business logic — maps intent / hints → agent kinds only.
 * Future agents (sleep / mobility / injury / planning) are recognized
 * but not selected until implemented.
 */
export class AgentCapabilityResolver {
  resolve(input: {
    readonly intent: CoachIntent;
    readonly agentHints?: readonly SpecialistAgentKind[];
  }): readonly SpecialistAgentKind[] {
    const hints = input.agentHints ?? [];
    if (hints.length > 0) {
      return Object.freeze(
        hints.filter((kind) =>
          (IMPLEMENTED_SPECIALIST_AGENTS as readonly string[]).includes(kind),
        ),
      );
    }

    switch (input.intent) {
      case CoachIntents.WORKOUT_FOCUS:
        return Object.freeze([SpecialistAgentKinds.WORKOUT]);
      case CoachIntents.RECOVERY_FOCUS:
        return Object.freeze([SpecialistAgentKinds.RECOVERY]);
      case CoachIntents.NUTRITION_FOCUS:
        return Object.freeze([SpecialistAgentKinds.NUTRITION]);
      case CoachIntents.MULTI_DOMAIN:
      case CoachIntents.HOLISTIC:
        return Object.freeze([...IMPLEMENTED_SPECIALIST_AGENTS]);
      case CoachIntents.EDUCATION:
        return Object.freeze([
          SpecialistAgentKinds.WORKOUT,
          SpecialistAgentKinds.NUTRITION,
        ]);
      case CoachIntents.UNKNOWN:
      default:
        return Object.freeze([SpecialistAgentKinds.WORKOUT]);
    }
  }

  /**
   * Resolve intent from free-text message when no explicit hint is provided.
   * Keyword routing only — not domain reasoning.
   */
  inferIntent(message: string, hint: CoachIntent | null): CoachIntent {
    if (hint) {
      return hint;
    }
    const lower = message.toLowerCase();
    const mentionsWorkout =
      /workout|train|lift|strength|hypertrophy|program/.test(lower);
    const mentionsRecovery =
      /recover|sleep|fatigue|soreness|deload|readiness|stress/.test(lower);
    const mentionsNutrition =
      /nutrition|macro|calorie|meal|protein|diet|hydration/.test(lower);

    const count =
      Number(mentionsWorkout) +
      Number(mentionsRecovery) +
      Number(mentionsNutrition);

    if (count >= 2) {
      return CoachIntents.MULTI_DOMAIN;
    }
    if (mentionsRecovery) {
      return CoachIntents.RECOVERY_FOCUS;
    }
    if (mentionsNutrition) {
      return CoachIntents.NUTRITION_FOCUS;
    }
    if (mentionsWorkout) {
      return CoachIntents.WORKOUT_FOCUS;
    }
    return CoachIntents.UNKNOWN;
  }
}

export function createAgentCapabilityResolver(): AgentCapabilityResolver {
  return new AgentCapabilityResolver();
}
