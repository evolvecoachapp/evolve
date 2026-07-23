import type { AIProviderId } from "../../ai-provider/models/AIProviderId";
import type { StreamCompletion } from "./StreamCompletion";
import type { StreamErrorSnapshot } from "./StreamError";
import type { StreamMetrics } from "./StreamMetrics";
import type { StreamStatus } from "./StreamStatus";

/**
 * Immutable aggregated stream response.
 */
export interface StreamResponse {
  readonly id: string;
  readonly streamId: string;
  readonly requestId: string;
  readonly providerId: AIProviderId | null;
  readonly status: StreamStatus;
  readonly content: string;
  readonly chunkCount: number;
  readonly tokenCount: number;
  readonly completion: StreamCompletion;
  readonly error: StreamErrorSnapshot | null;
  readonly metrics: StreamMetrics;
  readonly completedAt: string | null;
}
