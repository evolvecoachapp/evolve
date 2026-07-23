import type { StreamRequest } from "../models/StreamRequest";

/**
 * Validate a stream request (soft issues).
 */
export function validateStreamRequest(
  request: StreamRequest,
): readonly string[] {
  const issues: string[] = [];

  if (!request) {
    return Object.freeze(["stream_request_missing"]);
  }

  if (!request.id) {
    issues.push("stream_request_id_missing");
  }

  if (!request.providerId) {
    issues.push("stream_request_provider_id_missing");
  }

  if (!request.createdAt) {
    issues.push("stream_request_created_at_missing");
  }

  if (!request.metadata) {
    issues.push("stream_request_metadata_missing");
  }

  if (!request.cancellation) {
    issues.push("stream_request_cancellation_missing");
  }

  return Object.freeze(issues);
}
