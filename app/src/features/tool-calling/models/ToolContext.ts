/**
 * Execution context supplied by ConversationService.
 *
 * Tools never receive provider secrets or networking handles.
 */
export interface ToolContext {
  readonly conversationId?: string;
  readonly athleteId?: string;
  /** ISO-8601 timestamp. */
  readonly now: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}
