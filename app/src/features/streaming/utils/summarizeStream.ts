import type { AIProviderId } from "../../ai-provider/models/AIProviderId";
import type { StreamSnapshot } from "../models/StreamSnapshot";
import type { StreamState } from "../models/StreamState";
import type { StreamSummary } from "../models/StreamSummary";
import { StreamStatuses } from "../models/StreamStatus";
import { freezeSummary } from "./freezeObjects";
import { formatDurationMs, formatStreamLabel } from "./formatting";

export function summarizeStreamState(
  state: StreamState,
  providerId: AIProviderId | null = null,
): StreamSummary {
  return freezeSummary({
    streamId: state.streamId,
    requestId: state.requestId,
    providerId,
    status: state.status,
    completed: state.status === StreamStatuses.COMPLETED,
    cancelled: state.status === StreamStatuses.CANCELLED,
    failed: state.status === StreamStatuses.FAILED,
    chunkCount: state.metrics.chunkCount,
    tokenCount: state.metrics.tokenCount,
    contentLength: state.metrics.contentLength,
    durationMs: state.metrics.durationMs,
    errorCode: state.error?.code ?? null,
    message: state.error?.message ?? null,
  });
}

export function summarizeStreamSnapshot(
  snapshot: StreamSnapshot,
): StreamSummary {
  return summarizeStreamState(snapshot.state, snapshot.providerId);
}

export function formatStreamSummary(summary: StreamSummary): string {
  return `${formatStreamLabel(summary.streamId, summary.status)} chunks=${summary.chunkCount} tokens=${summary.tokenCount} duration=${formatDurationMs(summary.durationMs)}`;
}
