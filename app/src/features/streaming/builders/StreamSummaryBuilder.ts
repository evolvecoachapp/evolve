import type { AIProviderId } from "../../ai-provider/models/AIProviderId";
import type { StreamStatus } from "../models/StreamStatus";
import { StreamStatuses } from "../models/StreamStatus";
import type { StreamSummary } from "../models/StreamSummary";
import { freezeSummary } from "../utils/freezeObjects";

/**
 * Fluent builder for immutable StreamSummary.
 */
export class StreamSummaryBuilder {
  private streamId = "";
  private requestId = "";
  private providerId: AIProviderId | null = null;
  private status: StreamStatus = StreamStatuses.PENDING;
  private chunkCount = 0;
  private tokenCount = 0;
  private contentLength = 0;
  private durationMs: number | null = null;
  private errorCode: string | null = null;
  private message: string | null = null;

  withStreamId(streamId: string): this {
    this.streamId = streamId;
    return this;
  }

  withRequestId(requestId: string): this {
    this.requestId = requestId;
    return this;
  }

  withProviderId(providerId: AIProviderId | null): this {
    this.providerId = providerId;
    return this;
  }

  withStatus(status: StreamStatus): this {
    this.status = status;
    return this;
  }

  withChunkCount(chunkCount: number): this {
    this.chunkCount = chunkCount;
    return this;
  }

  withTokenCount(tokenCount: number): this {
    this.tokenCount = tokenCount;
    return this;
  }

  withContentLength(contentLength: number): this {
    this.contentLength = contentLength;
    return this;
  }

  withDurationMs(durationMs: number | null): this {
    this.durationMs = durationMs;
    return this;
  }

  withErrorCode(errorCode: string | null): this {
    this.errorCode = errorCode;
    return this;
  }

  withMessage(message: string | null): this {
    this.message = message;
    return this;
  }

  build(): StreamSummary {
    if (!this.streamId || !this.requestId) {
      throw new Error("StreamSummaryBuilder missing required fields");
    }

    return freezeSummary({
      streamId: this.streamId,
      requestId: this.requestId,
      providerId: this.providerId,
      status: this.status,
      completed: this.status === StreamStatuses.COMPLETED,
      cancelled: this.status === StreamStatuses.CANCELLED,
      failed: this.status === StreamStatuses.FAILED,
      chunkCount: this.chunkCount,
      tokenCount: this.tokenCount,
      contentLength: this.contentLength,
      durationMs: this.durationMs,
      errorCode: this.errorCode,
      message: this.message,
    });
  }
}
