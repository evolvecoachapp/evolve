import type { AdaptationMetadata } from "./AdaptationMetadata";

/**
 * Handoff input only — does NOT modify recovery plans.
 */
export interface RecoveryAdaptationInput {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisionIds: readonly string[];
  readonly signalKeys: readonly string[];
  readonly categoryKeys: readonly string[];
  readonly metadata: AdaptationMetadata;
  readonly createdAt: string;
}
