/**
 * Provenance and count metadata for a prompt context.
 *
 * Structured evidence only — never natural language or serialized prompt text.
 */
export interface PromptMetadata {
  /** ISO-8601 timestamp when this prompt context was built. */
  readonly generatedAt: string;
  /** ISO-8601 timestamp from the source coach summary. */
  readonly sourceGeneratedAt: string;
  readonly insightCount: number;
  readonly riskCount: number;
  readonly recommendationCount: number;
  /** Prompt context schema version for future providers. */
  readonly schemaVersion: number;
}
