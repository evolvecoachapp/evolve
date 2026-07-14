import type { CoachConversation } from "./coachConversation";
import type { CoachMessage } from "./coachMessage";

export type { CoachConversation } from "./coachConversation";

export type CoachProviderId = "mock" | "openai" | "anthropic" | "local";

export interface CoachSendMessageRequest {
  conversationId: string;
  message: string;
  /** Prior turns for context — consumed when conversation memory is enabled. */
  history?: CoachMessage[];
}

export interface CoachSendMessageResponse {
  conversationId: string;
  message: CoachMessage;
}

/** Incremental token/chunk emitted during a streamed reply. */
export interface CoachStreamChunk {
  conversationId: string;
  messageId: string;
  delta: string;
  done: boolean;
}

export type CoachStreamHandler = (chunk: CoachStreamChunk) => void;

/** Contract for Coach AI backends — UI and hooks depend on this interface only. */
export interface CoachService {
  readonly providerId: CoachProviderId;

  createConversation(): Promise<CoachConversation>;

  sendMessage(request: CoachSendMessageRequest): Promise<CoachSendMessageResponse>;

  /**
   * Optional streaming entry point. When implemented, hooks may render partial
   * coach replies as chunks arrive instead of waiting for the full response.
   */
  sendMessageStream?(
    request: CoachSendMessageRequest,
    onChunk: CoachStreamHandler,
  ): Promise<CoachSendMessageResponse>;
}

export class CoachServiceError extends Error {
  constructor(
    message: string,
    readonly providerId?: CoachProviderId,
  ) {
    super(message);
    this.name = "CoachServiceError";
  }
}
