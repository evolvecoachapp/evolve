import type { AIProviderId } from "../../ai-provider/models/AIProviderId";
import type { StreamStatus } from "./StreamStatus";

/**
 * Compact immutable summary of a stream run.
 */
export interface StreamSummary {
  readonly streamId: string;
  readonly requestId: string;
  readonly providerId: AIProviderId | null;
  readonly status: StreamStatus;
  readonly completed: boolean;
  readonly cancelled: boolean;
  readonly failed: boolean;
  readonly chunkCount: number;
  readonly tokenCount: number;
  readonly contentLength: number;
  readonly durationMs: number | null;
  readonly errorCode: string | null;
  readonly message: string | null;
}
