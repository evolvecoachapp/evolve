/**
 * Immutable response format preference.
 */
export type AIResponseFormatKind = "text" | "json" | "markdown";

export interface AIResponseFormat {
  readonly kind: AIResponseFormatKind;
  readonly schemaHint: string | null;
}

export const TEXT_RESPONSE_FORMAT: AIResponseFormat = Object.freeze({
  kind: "text",
  schemaHint: null,
});
