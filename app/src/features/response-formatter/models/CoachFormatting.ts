/**
 * Immutable formatting hints for a coach response (no UI rendering).
 */
export interface CoachFormatting {
  readonly preferredFormat: CoachOutputFormat;
  readonly includeSections: boolean;
  readonly includeCitations: boolean;
  readonly includeActions: boolean;
  readonly tone: CoachTone;
}

export type CoachOutputFormat =
  | "plain"
  | "markdown"
  | "rich"
  | "card"
  | "json";

export type CoachTone =
  | "neutral"
  | "supportive"
  | "directive"
  | "cautionary";

export const CoachOutputFormats = Object.freeze({
  PLAIN: "plain" as const,
  MARKDOWN: "markdown" as const,
  RICH: "rich" as const,
  CARD: "card" as const,
  JSON: "json" as const,
});

export const CoachTones = Object.freeze({
  NEUTRAL: "neutral" as const,
  SUPPORTIVE: "supportive" as const,
  DIRECTIVE: "directive" as const,
  CAUTIONARY: "cautionary" as const,
});

export const DEFAULT_COACH_FORMATTING: CoachFormatting = Object.freeze({
  preferredFormat: CoachOutputFormats.MARKDOWN,
  includeSections: true,
  includeCitations: true,
  includeActions: true,
  tone: CoachTones.NEUTRAL,
});
