import { WellKnownCapabilityIds } from "../../agent-capability/models/CapabilityId";
import {
  CoachConversationIntents,
  type CoachConversationIntent,
} from "../models/CoachConversationIntent";

/**
 * Maps coaching conversation intents to Supervisor capability requirements.
 */
export function mapIntentToCapabilities(
  intent: CoachConversationIntent,
): readonly string[] {
  switch (intent) {
    case CoachConversationIntents.WORKOUT_EXPLANATION:
    case CoachConversationIntents.WORKOUT_SUMMARY:
    case CoachConversationIntents.EXERCISE_EXPLANATION:
    case CoachConversationIntents.PROGRESSION_EXPLANATION:
      return Object.freeze([WellKnownCapabilityIds.GENERATE_WORKOUT]);
    case CoachConversationIntents.RECOVERY_EXPLANATION:
      return Object.freeze([WellKnownCapabilityIds.EVALUATE_RECOVERY]);
    case CoachConversationIntents.RECOMMENDATION_EXPLANATION:
      return Object.freeze([
        WellKnownCapabilityIds.GENERATE_WORKOUT,
        WellKnownCapabilityIds.EVALUATE_RECOVERY,
      ]);
    case CoachConversationIntents.GENERAL_COACHING:
      return Object.freeze([
        WellKnownCapabilityIds.GENERATE_WORKOUT,
        WellKnownCapabilityIds.EVALUATE_RECOVERY,
      ]);
    case CoachConversationIntents.UNKNOWN:
    default:
      return Object.freeze([WellKnownCapabilityIds.GENERATE_WORKOUT]);
  }
}
