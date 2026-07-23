import type { CoachSection } from "./CoachSection";

/**
 * Intermediate immutable parse output before building CoachResponse.
 */
export interface CoachParsingResult {
  readonly messageText: string;
  readonly recommendationLines: readonly string[];
  readonly warningLines: readonly string[];
  readonly actionLines: readonly string[];
  readonly exerciseLines: readonly string[];
  readonly nutritionLines: readonly string[];
  readonly recoveryLines: readonly string[];
  readonly questionLines: readonly string[];
  readonly citationLines: readonly string[];
  readonly insightLines: readonly string[];
  readonly reasoningText: string | null;
  readonly confidenceRaw: string | null;
  readonly sections: readonly CoachSection[];
  readonly rawContent: string;
}
