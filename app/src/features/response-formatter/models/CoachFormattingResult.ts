import type { CoachOutputFormat } from "./CoachFormatting";
import type { CoachResponse } from "./CoachResponse";

/**
 * Immutable result of formatting a CoachResponse for a target medium.
 * Contains text / structured payload only — no UI components.
 */
export interface CoachFormattingResult {
  readonly responseId: string;
  readonly format: CoachOutputFormat;
  readonly content: string;
  readonly sections: Readonly<Record<string, string>>;
  readonly response: CoachResponse;
  readonly formattedAt: string;
}
