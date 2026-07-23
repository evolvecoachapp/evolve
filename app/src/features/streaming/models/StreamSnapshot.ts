import type { AIProviderId } from "../../ai-provider/models/AIProviderId";
import type { StreamResponse } from "./StreamResponse";
import type { StreamState } from "./StreamState";
import type { StreamSummary } from "./StreamSummary";

/**
 * Immutable point-in-time snapshot of a stream (state + response + summary).
 */
export interface StreamSnapshot {
  readonly id: string;
  readonly streamId: string;
  readonly requestId: string;
  readonly providerId: AIProviderId | null;
  readonly state: StreamState;
  readonly response: StreamResponse;
  readonly summary: StreamSummary;
  readonly capturedAt: string;
}
