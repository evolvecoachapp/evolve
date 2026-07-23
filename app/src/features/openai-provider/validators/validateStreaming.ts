import type { OpenAIStreamChunk } from "../models/OpenAIStreamChunk";

/**
 * Validate streaming configuration / chunk integrity.
 */
export function validateStreamingEnabled(
  streamingEnabled: boolean,
): readonly string[] {
  if (!streamingEnabled) {
    return Object.freeze(["openai_streaming_not_enabled"]);
  }
  return Object.freeze([]);
}

export function validateStreamChunk(
  chunk: OpenAIStreamChunk | null | undefined,
): readonly string[] {
  const issues: string[] = [];

  if (!chunk) {
    issues.push("openai_stream_chunk_missing");
    return issues;
  }

  if (!chunk.id || chunk.id.trim().length === 0) {
    issues.push("openai_stream_chunk_id_missing");
  }

  if (chunk.index < 0) {
    issues.push("openai_stream_chunk_index_invalid");
  }

  if (typeof chunk.delta !== "string") {
    issues.push("openai_stream_chunk_delta_invalid");
  }

  return issues;
}
