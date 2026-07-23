import type { CoachRequest } from "../models/CoachRequest";
import type { CoachIntent } from "../models/CoachIntent";
import type { CoachMetadata } from "../models/CoachMetadata";
import { EMPTY_COACH_METADATA } from "../models/CoachMetadata";
import type { SpecialistAgentKind } from "../models/SpecialistAgentKind";
import type { NutritionRequest } from "../../nutrition-agent/models/NutritionRequest";
import type { RecoveryRequest } from "../../recovery-agent/models/RecoveryRequest";
import type { WorkoutRequest } from "../../workout-agent/models/WorkoutRequest";
import { freezeRequest } from "../utils/FreezeCoachState";

export interface CoachRequestBuilderInput {
  readonly id: string;
  readonly message: string;
  readonly createdAt: string;
  readonly athleteId?: string | null;
  readonly conversationId?: string | null;
  readonly intentHint?: CoachIntent | null;
  readonly agentHints?: readonly SpecialistAgentKind[];
  readonly workoutRequest?: WorkoutRequest | null;
  readonly recoveryRequest?: RecoveryRequest | null;
  readonly nutritionRequest?: NutritionRequest | null;
  readonly constraints?: readonly string[];
  readonly metadata?: CoachMetadata;
}

/**
 * Builds an immutable CoachRequest. No domain calculations.
 */
export class CoachRequestBuilder {
  build(input: CoachRequestBuilderInput): CoachRequest {
    return freezeRequest({
      id: input.id,
      athleteId: input.athleteId ?? null,
      conversationId: input.conversationId ?? null,
      message: input.message,
      intentHint: input.intentHint ?? null,
      agentHints: Object.freeze([...(input.agentHints ?? [])]),
      workoutRequest: input.workoutRequest ?? null,
      recoveryRequest: input.recoveryRequest ?? null,
      nutritionRequest: input.nutritionRequest ?? null,
      constraints: Object.freeze([...(input.constraints ?? [])]),
      metadata: input.metadata ?? EMPTY_COACH_METADATA,
      createdAt: input.createdAt,
    });
  }
}

export function buildCoachRequest(
  input: CoachRequestBuilderInput,
): CoachRequest {
  return new CoachRequestBuilder().build(input);
}
