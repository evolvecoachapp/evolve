import type { AIExecutionStage } from "../models/AIExecutionStage";
import type { AIExecutionStatus } from "../models/AIExecutionStatus";

export function formatStage(stage: AIExecutionStage | null): string {
  return stage ?? "none";
}

export function formatStatus(status: AIExecutionStatus): string {
  return status;
}

export function formatDurationMs(durationMs: number | null): string {
  if (durationMs === null || Number.isNaN(durationMs)) {
    return "n/a";
  }
  return `${Math.round(durationMs)}ms`;
}

export function formatExecutionLabel(options: {
  readonly executionId: string;
  readonly status: AIExecutionStatus;
  readonly providerId?: string | null;
}): string {
  const provider = options.providerId ?? "unresolved";
  return `${options.executionId} [${options.status}] provider=${provider}`;
}
