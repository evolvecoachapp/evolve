import type { CoachSummary } from "../../coach-intelligence/models/CoachSummary";
import type { PromptMetadata } from "../models/PromptMetadata";

/** Current prompt context schema version. */
export const PROMPT_SCHEMA_VERSION = 1;

export interface BuildMetadataInput {
  readonly summary: CoachSummary;
  readonly generatedAt: string;
}

/** Build prompt provenance metadata from a coach summary. */
export function buildMetadata(input: BuildMetadataInput): PromptMetadata {
  return Object.freeze({
    generatedAt: input.generatedAt,
    sourceGeneratedAt: input.summary.generatedAt,
    insightCount: input.summary.insightCount,
    riskCount: input.summary.riskCount,
    recommendationCount: input.summary.recommendationCount,
    schemaVersion: PROMPT_SCHEMA_VERSION,
  });
}
