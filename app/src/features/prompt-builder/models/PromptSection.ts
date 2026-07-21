/** Ordered section identifiers for a structured prompt context. */
export type PromptSectionId =
  | "athlete"
  | "training_summary"
  | "volume_trend"
  | "frequency_trend"
  | "personal_records"
  | "risk_flags"
  | "recommendations"
  | "metadata";

/**
 * Descriptor for a prompt section.
 *
 * Identifies which structured blocks are present — never contains prose.
 */
export interface PromptSection {
  readonly id: PromptSectionId;
  /** Whether this section is included in the prompt context. */
  readonly included: boolean;
}
