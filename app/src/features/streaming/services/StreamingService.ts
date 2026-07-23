import type { AIProviderId } from "../../ai-provider/models/AIProviderId";
import { StreamRequestBuilder } from "../builders/StreamRequestBuilder";
import type { IStreamSourceResolver } from "../contracts/IStreamSource";
import {
  createStreamingEngine,
  type StreamingEngine,
  type StreamingEngineDeps,
} from "../engine/StreamingEngine";
import type { StreamCancellation } from "../models/StreamCancellation";
import { NO_STREAM_CANCELLATION } from "../models/StreamCancellation";
import type { StreamMetadata } from "../models/StreamMetadata";
import { EMPTY_STREAM_METADATA } from "../models/StreamMetadata";
import type { StreamRequest } from "../models/StreamRequest";
import type { StreamSnapshot } from "../models/StreamSnapshot";
import type { StreamState } from "../models/StreamState";
import type { StreamSummary } from "../models/StreamSummary";
import { summarizeStreamState } from "../utils/summarizeStream";

export interface StartStreamInput {
  readonly providerId: AIProviderId;
  readonly modelId?: string | null;
  readonly executionRequestId?: string | null;
  readonly metadata?: StreamMetadata;
  readonly cancellation?: StreamCancellation;
  readonly requestId?: string;
  readonly createdAt?: string;
}

/**
 * Service facade over StreamingEngine.
 * Hides engine / handler internals from application consumers.
 */
export class StreamingService {
  private readonly engine: StreamingEngine;

  constructor(engine: StreamingEngine) {
    this.engine = engine;
  }

  getEngine(): StreamingEngine {
    return this.engine;
  }

  async startStream(input: StartStreamInput): Promise<StreamSnapshot> {
    const request = this.buildRequest(input);
    return this.engine.start(request);
  }

  cancelStream(
    streamId: string,
    reason: string | null = null,
  ): boolean {
    return this.engine.cancel(streamId, reason);
  }

  summarizeStream(
    stateOrSnapshot: StreamState | StreamSnapshot,
    providerId: AIProviderId | null = null,
  ): StreamSummary {
    if ("state" in stateOrSnapshot && "summary" in stateOrSnapshot) {
      return stateOrSnapshot.summary;
    }
    return summarizeStreamState(
      stateOrSnapshot,
      providerId,
    );
  }

  private buildRequest(input: StartStreamInput): StreamRequest {
    const createdAt = input.createdAt ?? new Date().toISOString();
    const requestId =
      input.requestId ??
      `stream-req:${input.providerId}:${createdAt}`;

    return new StreamRequestBuilder()
      .withId(requestId)
      .withExecutionRequestId(input.executionRequestId ?? null)
      .withProviderId(input.providerId)
      .withModelId(input.modelId ?? null)
      .withMetadata(input.metadata ?? EMPTY_STREAM_METADATA)
      .withCancellation(input.cancellation ?? NO_STREAM_CANCELLATION)
      .withCreatedAt(createdAt)
      .build();
  }
}

export function createStreamingService(
  deps: StreamingEngineDeps,
): StreamingService {
  return new StreamingService(createStreamingEngine(deps));
}

export type { IStreamSourceResolver };
