/**
 * Named stream event types for the event-driven streaming foundation.
 */
export const StreamEventTypes = {
  STREAM_STARTED: "stream_started",
  CHUNK_RECEIVED: "chunk_received",
  TOKEN_RECEIVED: "token_received",
  HEARTBEAT: "heartbeat",
  PROGRESS_UPDATED: "progress_updated",
  STREAM_COMPLETED: "stream_completed",
  STREAM_CANCELLED: "stream_cancelled",
  STREAM_FAILED: "stream_failed",
} as const;

export type StreamEventType =
  (typeof StreamEventTypes)[keyof typeof StreamEventTypes];
