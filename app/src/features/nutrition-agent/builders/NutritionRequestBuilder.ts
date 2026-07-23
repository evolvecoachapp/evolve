import { EMPTY_NUTRITION_AGENT_METADATA } from "../models/NutritionMetadata";
import type { NutritionAgentRequest } from "../models/NutritionAgentRequest";
import type { NutritionRequest } from "../models/NutritionRequest";
import { freezeRequest } from "../utils/FreezeNutritionState";

export interface NutritionRequestBuilderInput {
  readonly id: string;
  readonly message: string;
  readonly createdAt: string;
  readonly athleteId?: string | null;
  readonly conversationId?: string | null;
  readonly intentHint?: NutritionRequest["intentHint"];
  readonly goalHint?: NutritionRequest["goalHint"];
  readonly bodyWeightKg?: number | null;
  readonly activityLevel?: NutritionRequest["activityLevel"];
  readonly constraints?: readonly string[];
  readonly preferences?: NutritionRequest["preferences"];
  readonly metadata?: NutritionRequest["metadata"];
}

/**
 * Builds an immutable NutritionAgentRequest / NutritionRequest.
 * No domain calculations.
 */
export class NutritionRequestBuilder {
  build(input: NutritionRequestBuilderInput): NutritionAgentRequest {
    return freezeRequest({
      id: input.id,
      athleteId: input.athleteId ?? null,
      conversationId: input.conversationId ?? null,
      message: input.message,
      intentHint: input.intentHint ?? null,
      goalHint: input.goalHint ?? null,
      bodyWeightKg: input.bodyWeightKg ?? null,
      activityLevel: input.activityLevel ?? null,
      constraints: Object.freeze([...(input.constraints ?? [])]),
      preferences: input.preferences ?? null,
      metadata: input.metadata ?? EMPTY_NUTRITION_AGENT_METADATA,
      createdAt: input.createdAt,
    });
  }
}

export function buildNutritionRequest(
  input: NutritionRequestBuilderInput,
): NutritionAgentRequest {
  return new NutritionRequestBuilder().build(input);
}
