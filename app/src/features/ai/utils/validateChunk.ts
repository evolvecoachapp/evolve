import type { AIStreamChunk } from "../models/AIStreamChunk";

/** Structured validation issue codes — never prose. */
export type AIStreamChunkValidationCode =
  | "invalid_id"
  | "invalid_delta"
  | "invalid_index"
  | "invalid_created_at";

/**
 * Validate structural integrity of an AIStreamChunk.
 *
 * Returns frozen issue codes; an empty array means the chunk is valid.
 */
export function validateChunk(
  chunk: AIStreamChunk,
): readonly AIStreamChunkValidationCode[] {
  const issues: AIStreamChunkValidationCode[] = [];

  if (!chunk.id) {
    issues.push("invalid_id");
  }

  if (typeof chunk.delta !== "string") {
    issues.push("invalid_delta");
  }

  if (!Number.isInteger(chunk.index) || chunk.index < 0) {
    issues.push("invalid_index");
  }

  if (!chunk.createdAt) {
    issues.push("invalid_created_at");
  }

  return Object.freeze(issues);
}
