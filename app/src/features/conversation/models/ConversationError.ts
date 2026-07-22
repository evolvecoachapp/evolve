/** Structured error codes at the Conversation domain boundary. */
export type ConversationErrorCode =
  | "not_found"
  | "invalid_conversation"
  | "invalid_message"
  | "conversation_closed"
  | "message_not_retryable"
  | "provider_failed"
  | "generation_failed"
  | "stream_cancelled"
  | "stream_in_progress"
  | "tool_execution_unavailable";

/**
 * Single error type for the Conversation engine.
 *
 * Callers never need repository- or provider-specific failure knowledge.
 */
export class ConversationError extends Error {
  readonly code: ConversationErrorCode;
  readonly conversationId?: string;
  readonly messageId?: string;

  constructor(
    code: ConversationErrorCode,
    message: string,
    options: {
      readonly conversationId?: string;
      readonly messageId?: string;
    } = {},
  ) {
    super(message);
    this.name = "ConversationError";
    this.code = code;
    this.conversationId = options.conversationId;
    this.messageId = options.messageId;
  }
}
