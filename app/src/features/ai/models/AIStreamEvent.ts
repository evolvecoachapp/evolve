import type { ToolRequest } from "../../tool-calling/models/ToolRequest";
import type { WorkflowRequest } from "../../workflow/models/WorkflowRequest";
import type { AIFinishReason } from "./AIFinishReason";
import type { AIStreamChunk } from "./AIStreamChunk";
import type { AIStreamStatus } from "./AIStreamStatus";
import type { TokenUsage } from "./TokenUsage";

/**
 * Provider-agnostic streaming events.
 *
 * Emitted by AIProvider.streamResponse and consumed by AIService.
 * tool_request / workflow_request events carry domain requests —
 * never executed here.
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
      readonly type: "tool_request";
      readonly sessionId: string;
      readonly request: ToolRequest;
    }
  | {
      readonly type: "workflow_request";
      readonly sessionId: string;
      readonly request: WorkflowRequest;
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
