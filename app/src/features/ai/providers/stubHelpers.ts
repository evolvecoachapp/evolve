import type { AIModel } from "../models/AIModel";
import type { AIProviderInfo } from "../models/AIProviderInfo";
import type { AIProviderType } from "../models/AIProviderType";
import type { AIRequest } from "../models/AIRequest";
import type { AIResponse } from "../models/AIResponse";
import type { AIStreamEvent } from "../models/AIStreamEvent";
import type { ChatMessage } from "../models/ChatMessage";
import type { AIProviderStreamOptions } from "./AIProvider";

export interface StubProviderConfig {
  readonly type: AIProviderType;
  readonly name: string;
  readonly model: AIModel;
  readonly sampleContent: string;
}

export interface StubStreamOptions extends AIProviderStreamOptions {
  /** Delay between simulated chunks — defaults to 0 for deterministic tests. */
  readonly delayMs?: number;
}

/**
 * Build a deterministic stub AIResponse for testing.
 *
 * No networking — fixed identity fields with usage derived from request size.
 */
export function createStubResponse(
  config: StubProviderConfig,
  request: AIRequest,
): AIResponse {
  const generatedAt = request.promptGeneratedAt;
  const message: ChatMessage = Object.freeze({
    id: `msg-stub-${config.type}`,
    role: "assistant",
    content: config.sampleContent,
    createdAt: generatedAt,
  });

  const promptTokens = Math.max(1, request.messages.length) * 12;
  const completionTokens = 24;

  return Object.freeze({
    message,
    model: config.model,
    usage: Object.freeze({
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    }),
    provider: config.type,
    finishReason: "stop" as const,
    generatedAt,
  });
}

export function createStubProviderInfo(
  config: StubProviderConfig,
): AIProviderInfo {
  return Object.freeze({
    type: config.type,
    name: config.name,
    model: config.model,
  });
}

/**
 * Simulate provider streaming by emitting word-level deltas.
 *
 * Deterministic offline path — no networking.
 */
export async function* createStubStream(
  config: StubProviderConfig,
  request: AIRequest,
  options: StubStreamOptions = {},
): AsyncIterable<AIStreamEvent> {
  const generatedAt = request.promptGeneratedAt;
  const sessionId = `stream-stub-${config.type}`;
  const messageId = `msg-stub-${config.type}`;
  const promptTokens = Math.max(1, request.messages.length) * 12;
  const completionTokens = 24;
  const delayMs = options.delayMs ?? 0;
  const signal = options.signal;

  yield Object.freeze({
    type: "start" as const,
    sessionId,
    messageId,
    createdAt: generatedAt,
  });

  if (signal?.aborted) {
    yield Object.freeze({
      type: "status" as const,
      sessionId,
      status: "cancelled" as const,
    });
    return;
  }

  yield Object.freeze({
    type: "status" as const,
    sessionId,
    status: "streaming" as const,
  });

  const parts = splitStubContent(config.sampleContent);
  let index = 0;

  for (const delta of parts) {
    if (signal?.aborted) {
      yield Object.freeze({
        type: "status" as const,
        sessionId,
        status: "cancelled" as const,
      });
      return;
    }

    yield Object.freeze({
      type: "chunk" as const,
      sessionId,
      chunk: Object.freeze({
        id: `${sessionId}-chunk-${index}`,
        delta,
        index,
        createdAt: generatedAt,
      }),
    });

    index += 1;

    if (delayMs > 0) {
      await sleep(delayMs, signal);
      if (signal?.aborted) {
        yield Object.freeze({
          type: "status" as const,
          sessionId,
          status: "cancelled" as const,
        });
        return;
      }
    }
  }

  yield Object.freeze({
    type: "done" as const,
    sessionId,
    finishReason: "stop" as const,
    usage: Object.freeze({
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    }),
    createdAt: generatedAt,
  });

  yield Object.freeze({
    type: "status" as const,
    sessionId,
    status: "completed" as const,
  });
}

function splitStubContent(content: string): readonly string[] {
  const parts = content.split(/(\s+)/).filter((part) => part.length > 0);
  return parts.length > 0 ? parts : [content];
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      resolve();
    };

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
