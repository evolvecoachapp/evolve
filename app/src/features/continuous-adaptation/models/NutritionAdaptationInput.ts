import type { AdaptationMetadata } from "./AdaptationMetadata";

/**
 * Handoff input only — does NOT modify nutrition plans.
 */
export interface NutritionAdaptationInput {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisionIds: readonly string[];
  readonly signalKeys: readonly string[];
  readonly categoryKeys: readonly string[];
  readonly metadata: AdaptationMetadata;
  readonly createdAt: string;
}
