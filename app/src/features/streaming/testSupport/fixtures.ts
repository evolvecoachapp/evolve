import type { AIProviderId } from "../../ai-provider/models/AIProviderId";
import { StreamRequestBuilder } from "../builders/StreamRequestBuilder";
import type {
  IStreamSource,
  IStreamSourceResolver,
} from "../contracts/IStreamSource";
import { createStreamingEngine } from "../engine/StreamingEngine";
import { StreamingService } from "../services/StreamingService";
import type { StreamChunk } from "../models/StreamChunk";
import type { StreamRequest } from "../models/StreamRequest";
import { EMPTY_STREAM_METADATA } from "../models/StreamMetadata";
import { NO_STREAM_CANCELLATION } from "../models/StreamCancellation";
import { freezeChunk } from "../utils/freezeObjects";

export const FIXED_TIMESTAMP = "2026-07-23T12:00:00.000Z";

export function createStreamChunkFixture(
  overrides: Partial<StreamChunk> = {},
): StreamChunk {
  return freezeChunk({
    id: overrides.id ?? "stream-chunk:fixture:0",
    streamId: overrides.streamId ?? "stream:fixture",
    index: overrides.index ?? 0,
    delta: overrides.delta ?? "Hello",
    isFinal: overrides.isFinal ?? false,
    finishReason: overrides.finishReason ?? null,
    createdAt: overrides.createdAt ?? FIXED_TIMESTAMP,
  });
}

export function createStreamRequestFixture(
  overrides: Partial<StreamRequest> & {
    readonly providerId?: AIProviderId;
  } = {},
): StreamRequest {
  return new StreamRequestBuilder()
    .withId(overrides.id ?? "stream-req:fixture")
    .withExecutionRequestId(overrides.executionRequestId ?? "ai-exec-req:fixture")
    .withProviderId(overrides.providerId ?? "test-provider")
    .withModelId(overrides.modelId ?? "test-model")
    .withMetadata(overrides.metadata ?? EMPTY_STREAM_METADATA)
    .withCancellation(overrides.cancellation ?? NO_STREAM_CANCELLATION)
    .withCreatedAt(overrides.createdAt ?? FIXED_TIMESTAMP)
    .build();
}

export function createStubStreamSource(options: {
  readonly providerId?: AIProviderId;
  readonly chunks?: readonly StreamChunk[];
  readonly error?: Error;
  readonly delayMs?: number;
  readonly onChunk?: (chunk: StreamChunk, index: number) => void;
} = {}): IStreamSource {
  const providerId = options.providerId ?? "test-provider";
  const chunks =
    options.chunks ??
    Object.freeze([
      createStreamChunkFixture({
        id: "stream-chunk:0",
        index: 0,
        delta: "Hello",
        isFinal: false,
      }),
      createStreamChunkFixture({
        id: "stream-chunk:1",
        index: 1,
        delta: " world",
        isFinal: true,
        finishReason: "stop",
      }),
    ]);

  return {
    providerId,
    async *stream(request: StreamRequest): AsyncIterable<StreamChunk> {
      if (options.error) {
        throw options.error;
      }
      for (let i = 0; i < chunks.length; i += 1) {
        const chunk = freezeChunk({
          ...chunks[i]!,
          streamId: `stream:${request.id}`,
        });
        options.onChunk?.(chunk, i);
        if (options.delayMs && options.delayMs > 0) {
          await new Promise((resolve) =>
            setTimeout(resolve, options.delayMs),
          );
        }
        yield chunk;
      }
    },
  };
}

export function createStreamSourceResolver(
  sources: readonly IStreamSource[],
): IStreamSourceResolver {
  const map = new Map(
    sources.map((source) => [source.providerId, source]),
  );
  return {
    resolve(providerId) {
      return map.get(providerId) ?? null;
    },
  };
}

export function createTestStreamingHarness(options: {
  readonly providerId?: AIProviderId;
  readonly chunks?: readonly StreamChunk[];
  readonly error?: Error;
  readonly delayMs?: number;
  readonly onChunk?: (chunk: StreamChunk, index: number) => void;
} = {}) {
  const providerId = options.providerId ?? "test-provider";
  const source = createStubStreamSource({
    providerId,
    chunks: options.chunks,
    error: options.error,
    delayMs: options.delayMs,
    onChunk: options.onChunk,
  });
  const sourceResolver = createStreamSourceResolver([source]);
  const clock = (() => {
    let tick = 0;
    return () => {
      const base = Date.parse(FIXED_TIMESTAMP);
      const iso = new Date(base + tick * 100).toISOString();
      tick += 1;
      return iso;
    };
  })();

  const engine = createStreamingEngine({ sourceResolver, clock });
  const service = new StreamingService(engine);

  return {
    providerId,
    source,
    sourceResolver,
    engine,
    service,
    clock,
  };
}
