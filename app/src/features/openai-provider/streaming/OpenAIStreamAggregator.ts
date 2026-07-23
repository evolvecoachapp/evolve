import type { OpenAIStreamChunk } from "../models/OpenAIStreamChunk";

/**
 * Aggregates incremental OpenAI stream chunks into final content + finish reason.
 *
 * No UI. No rendering.
 */
export class OpenAIStreamAggregator {
  private readonly deltas: string[] = [];
  private finishReason: string | null = null;
  private lastChunk: OpenAIStreamChunk | null = null;

  push(chunk: OpenAIStreamChunk): void {
    this.deltas.push(chunk.delta);
    if (chunk.finishReason) {
      this.finishReason = chunk.finishReason;
    }
    this.lastChunk = chunk;
  }

  getContent(): string {
    return this.deltas.join("");
  }

  getFinishReason(): string | null {
    return this.finishReason;
  }

  getLastChunk(): OpenAIStreamChunk | null {
    return this.lastChunk;
  }

  getIndex(): number {
    return this.deltas.length;
  }
}
