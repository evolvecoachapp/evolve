import type { AIStreamingChunk } from "../../ai-provider/models/AIStreamingChunk";
import type { OpenAIRequest } from "../models/OpenAIRequest";
import type { OpenAIStreamChunk } from "../models/OpenAIStreamChunk";
import { OpenAIStreamAggregator } from "./OpenAIStreamAggregator";
import { OpenAIStreamChunkMapper } from "./OpenAIStreamChunkMapper";

export type OpenAIStreamSource = {
  createChatCompletionStream(
    request: OpenAIRequest,
  ): AsyncIterable<OpenAIStreamChunk>;
};

/**
 * Streaming abstraction over an OpenAI stream transport.
 *
 * Yields standardized AIStreamingChunk values. No UI. No rendering.
 */
export class OpenAIStreamingSession {
  private readonly source: OpenAIStreamSource;
  private readonly requestId: string;
  private readonly createdAt: string;
  private readonly aggregator = new OpenAIStreamAggregator();

  constructor(options: {
    readonly source: OpenAIStreamSource;
    readonly requestId: string;
    readonly createdAt?: string;
  }) {
    this.source = options.source;
    this.requestId = options.requestId;
    this.createdAt = options.createdAt ?? new Date().toISOString();
  }

  getAggregator(): OpenAIStreamAggregator {
    return this.aggregator;
  }

  async *stream(request: OpenAIRequest): AsyncIterable<AIStreamingChunk> {
    for await (const chunk of this.source.createChatCompletionStream(request)) {
      this.aggregator.push(chunk);
      yield OpenAIStreamChunkMapper.toStreamingChunk(chunk, {
        requestId: this.requestId,
        createdAt: this.createdAt,
      });
    }
  }
}
