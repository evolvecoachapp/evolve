/**
 * Hard failure from Conversation Orchestrator preparation.
 */
export class ConversationEngineError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ConversationEngineError";
    this.code = code;
  }
}
