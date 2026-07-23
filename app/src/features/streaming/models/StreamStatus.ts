/**
 * Stream lifecycle status values.
 */
export const StreamStatuses = {
  PENDING: "pending",
  STARTING: "starting",
  STREAMING: "streaming",
  COMPLETING: "completing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  FAILED: "failed",
} as const;

export type StreamStatus =
  (typeof StreamStatuses)[keyof typeof StreamStatuses];

export const TERMINAL_STREAM_STATUSES: readonly StreamStatus[] = Object.freeze([
  StreamStatuses.COMPLETED,
  StreamStatuses.CANCELLED,
  StreamStatuses.FAILED,
]);

export function isTerminalStreamStatus(status: StreamStatus): boolean {
  return (TERMINAL_STREAM_STATUSES as readonly string[]).includes(status);
}
