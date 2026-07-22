/**
 * Deterministic reason attribution for conversation context items.
 */
export interface ConversationReason {
  readonly code: string;
  readonly statement: string;
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
}
