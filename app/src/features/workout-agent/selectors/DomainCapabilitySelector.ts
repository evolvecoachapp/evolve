import type { WorkoutIntent } from "../models/WorkoutIntent";
import { WorkoutIntents } from "../models/WorkoutIntent";
import type { WorkoutDomainCapability } from "../models/WorkoutDomainCapability";
import { WorkoutDomainCapabilities } from "../models/WorkoutDomainCapability";

/**
 * Deterministic domain capability selection from agent intent.
 * No business logic — maps intent → domain orchestration targets only.
 */
export class DomainCapabilitySelector {
  select(intent: WorkoutIntent): readonly WorkoutDomainCapability[] {
    switch (intent) {
      case WorkoutIntents.PLAN_WORKOUT:
        return Object.freeze([
          WorkoutDomainCapabilities.PROGRAM_GENERATION,
          WorkoutDomainCapabilities.PROGRAMMING,
          WorkoutDomainCapabilities.PROGRESSION,
          WorkoutDomainCapabilities.WORKOUT_ASSEMBLY,
          WorkoutDomainCapabilities.DECISION_INTELLIGENCE,
        ]);
      case WorkoutIntents.ADJUST_PROGRESSION:
        return Object.freeze([
          WorkoutDomainCapabilities.PROGRESSION,
          WorkoutDomainCapabilities.TRAINING_ADAPTATION,
          WorkoutDomainCapabilities.DECISION_INTELLIGENCE,
        ]);
      case WorkoutIntents.SELECT_EXERCISES:
        return Object.freeze([
          WorkoutDomainCapabilities.EXERCISE_KNOWLEDGE,
          WorkoutDomainCapabilities.PROGRAMMING,
        ]);
      case WorkoutIntents.DESIGN_SPLIT:
        return Object.freeze([
          WorkoutDomainCapabilities.PROGRAM_GENERATION,
          WorkoutDomainCapabilities.DECISION_INTELLIGENCE,
        ]);
      case WorkoutIntents.EVALUATE_PLAN:
        return Object.freeze([
          WorkoutDomainCapabilities.DECISION_INTELLIGENCE,
          WorkoutDomainCapabilities.TRAINING_ADAPTATION,
        ]);
      case WorkoutIntents.RECOVERY_ADVICE:
        return Object.freeze([
          WorkoutDomainCapabilities.TRAINING_ADAPTATION,
        ]);
      case WorkoutIntents.ADAPT_WORKOUT:
        return Object.freeze([
          WorkoutDomainCapabilities.TRAINING_ADAPTATION,
          WorkoutDomainCapabilities.PROGRESSION,
          WorkoutDomainCapabilities.DECISION_INTELLIGENCE,
        ]);
      case WorkoutIntents.GENERAL_TRAINING:
      default:
        return Object.freeze([
          WorkoutDomainCapabilities.EXERCISE_KNOWLEDGE,
          WorkoutDomainCapabilities.DECISION_INTELLIGENCE,
        ]);
    }
  }
}
