/** Lifecycle state of a streaming generation session. */
export type AIStreamStatus =
  | "idle"
  | "starting"
  | "streaming"
  | "completed"
  | "cancelled"
  | "failed";

export const AI_STREAM_STATUSES: readonly AIStreamStatus[] = Object.freeze([
  "idle",
  "starting",
  "streaming",
  "completed",
  "cancelled",
  "failed",
]);
