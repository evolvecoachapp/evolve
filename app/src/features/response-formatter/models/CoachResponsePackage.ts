import type { CoachFormattingResult } from "./CoachFormattingResult";
import type { CoachParsingResult } from "./CoachParsingResult";
import type { CoachResponse } from "./CoachResponse";
import type { CoachResponseSnapshot } from "./CoachResponseSnapshot";
import type { CoachValidationIssue } from "./CoachValidationIssue";

/**
 * Full immutable package from AIResponse → CoachResponse formatting pipeline.
 */
export interface CoachResponsePackage {
  readonly response: CoachResponse;
  readonly parsing: CoachParsingResult;
  readonly snapshot: CoachResponseSnapshot;
  readonly formatting: CoachFormattingResult | null;
  readonly validationIssues: readonly CoachValidationIssue[];
  readonly createdAt: string;
}
