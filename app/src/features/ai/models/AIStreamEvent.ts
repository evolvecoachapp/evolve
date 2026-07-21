import type { AIFinishReason } from "./AIFinishReason";
import type { AIStreamChunk } from "./AIStreamChunk";
import type { AIStreamStatus } from "./AIStreamStatus";
import type { TokenUsage } from "./TokenUsage";

/**
 * Provider-agnostic streaming events.
 *
 * Emitted by AIProvider.streamResponse and consumed by AIService.
 */
export type AIStreamEvent =
  | {
      readonly type: "start";
      readonly sessionId: string;
      readonly messageId: string;
      readonly createdAt: string;
    }
  | {
      readonly type: "chunk";
      readonly sessionId: string;
      readonly chunk: AIStreamChunk;
    }
  | {
      readonly type: "status";
      readonly sessionId: string;
      readonly status: AIStreamStatus;
    }
  | {
      readonly type: "error";
      readonly sessionId: string;
      readonly code: string;
      readonly message: string;
    }
  | {
      readonly type: "done";
      readonly sessionId: string;
      readonly finishReason: AIFinishReason;
      readonly usage: TokenUsage;
      readonly createdAt: string;
    };
