import type { AIStreamStatus } from "./AIStreamStatus";
import type { StreamingMetadata } from "./StreamingMetadata";

/** In-flight or completed streaming generation session. */
export interface StreamingSession {
  readonly id: string;
  readonly conversationId: string | null;
  readonly messageId: string;
  readonly status: AIStreamStatus;
  /** Aggregated assistant content so far. */
  readonly content: string;
  readonly metadata: StreamingMetadata;
}
