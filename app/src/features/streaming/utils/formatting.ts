import type { StreamStatus } from "../models/StreamStatus";
import type { StreamEventType } from "../models/StreamEventType";

export function formatStreamStatus(status: StreamStatus): string {
  return status.replace(/_/g, " ");
}

export function formatStreamEventType(type: StreamEventType): string {
  return type.replace(/_/g, " ");
}

export function formatDurationMs(durationMs: number | null): string {
  if (durationMs === null || Number.isNaN(durationMs)) {
    return "n/a";
  }
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  }
  return `${(durationMs / 1000).toFixed(2)}s`;
}

export function formatStreamLabel(
  streamId: string,
  status: StreamStatus,
): string {
  return `stream:${streamId} [${formatStreamStatus(status)}]`;
}
