import type { AIProviderId } from "../../ai-provider/models/AIProviderId";
import type { StreamCancellation } from "./StreamCancellation";
import type { StreamMetadata } from "./StreamMetadata";

/**
 * Immutable streaming request.
 *
 * Optionally links to an AI Execution Pipeline request id.
 * No provider-specific payload. No conversation history.
 */
export interface StreamRequest {
  readonly id: string;
  readonly executionRequestId: string | null;
  readonly providerId: AIProviderId;
  readonly modelId: string | null;
  readonly metadata: StreamMetadata;
  readonly cancellation: StreamCancellation;
  readonly createdAt: string;
}
