import type { ExplanationMetadata } from "./ExplanationMetadata";
import type { ExplanationSummary } from "./ExplanationSummary";

/**
 * Structure-only handoff for LLM Response Formatter — no NL prose.
 */
export interface LLMFormatterInput {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly explanationIds: readonly string[];
  readonly sectionKeys: readonly string[];
  readonly reasonCodes: readonly string[];
  readonly evidenceKeys: readonly string[];
  readonly summary: ExplanationSummary | null;
  readonly metadata: ExplanationMetadata;
  readonly createdAt: string;
}
