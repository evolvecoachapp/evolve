import type { AIProviderId } from "../../ai-provider/models/AIProviderId";
import type { StreamCancellation } from "../models/StreamCancellation";
import { NO_STREAM_CANCELLATION } from "../models/StreamCancellation";
import type { StreamMetadata } from "../models/StreamMetadata";
import { EMPTY_STREAM_METADATA } from "../models/StreamMetadata";
import type { StreamRequest } from "../models/StreamRequest";
import { freezeRequest } from "../utils/freezeObjects";

/**
 * Fluent builder for immutable StreamRequest.
 */
export class StreamRequestBuilder {
  private id = "";
  private executionRequestId: string | null = null;
  private providerId: AIProviderId | null = null;
  private modelId: string | null = null;
  private metadata: StreamMetadata = EMPTY_STREAM_METADATA;
  private cancellation: StreamCancellation = NO_STREAM_CANCELLATION;
  private createdAt = "";

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withExecutionRequestId(executionRequestId: string | null): this {
    this.executionRequestId = executionRequestId;
    return this;
  }

  withProviderId(providerId: AIProviderId): this {
    this.providerId = providerId;
    return this;
  }

  withModelId(modelId: string | null): this {
    this.modelId = modelId;
    return this;
  }

  withMetadata(metadata: StreamMetadata): this {
    this.metadata = metadata;
    return this;
  }

  withCancellation(cancellation: StreamCancellation): this {
    this.cancellation = cancellation;
    return this;
  }

  withCreatedAt(createdAt: string): this {
    this.createdAt = createdAt;
    return this;
  }

  build(): StreamRequest {
    if (!this.id || !this.providerId || !this.createdAt) {
      throw new Error("StreamRequestBuilder missing required fields");
    }

    return freezeRequest({
      id: this.id,
      executionRequestId: this.executionRequestId,
      providerId: this.providerId,
      modelId: this.modelId,
      metadata: this.metadata,
      cancellation: this.cancellation,
      createdAt: this.createdAt,
    });
  }
}
