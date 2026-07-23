import type { StreamEventType } from "../models/StreamEventType";
import type { StreamStatus } from "../models/StreamStatus";
import type { StreamTrace, StreamTraceStep } from "../models/StreamTrace";
import { freezeTrace, freezeTraceStep } from "./freezeObjects";

export function createTraceStep(options: {
  readonly type: StreamEventType | "lifecycle";
  readonly status: StreamStatus;
  readonly occurredAt: string;
  readonly message?: string | null;
  readonly chunkIndex?: number | null;
  readonly validationIssues?: readonly string[];
}): StreamTraceStep {
  return freezeTraceStep({
    type: options.type,
    status: options.status,
    occurredAt: options.occurredAt,
    message: options.message ?? null,
    chunkIndex: options.chunkIndex ?? null,
    validationIssues: Object.freeze([...(options.validationIssues ?? [])]),
  });
}

export function appendTraceStep(
  trace: StreamTrace,
  step: StreamTraceStep,
): StreamTrace {
  return freezeTrace({
    streamId: trace.streamId,
    steps: Object.freeze([...trace.steps, freezeTraceStep(step)]),
  });
}
