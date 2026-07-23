import type { StreamEvent } from "../models/StreamEvent";
import type { StreamEventType } from "../models/StreamEventType";
import type { StreamStatus } from "../models/StreamStatus";
import { freezeEvent } from "../utils/freezeObjects";

let eventCounter = 0;

export function createStreamEvent(options: {
  readonly streamId: string;
  readonly type: StreamEventType;
  readonly occurredAt: string;
  readonly status?: StreamStatus | null;
  readonly message?: string | null;
  readonly chunkIndex?: number | null;
  readonly attributes?: Readonly<
    Record<string, string | number | boolean | null>
  >;
  readonly id?: string;
}): StreamEvent {
  eventCounter += 1;
  return freezeEvent({
    id: options.id ?? `stream-evt:${options.streamId}:${eventCounter}`,
    streamId: options.streamId,
    type: options.type,
    status: options.status ?? null,
    message: options.message ?? null,
    chunkIndex: options.chunkIndex ?? null,
    occurredAt: options.occurredAt,
    attributes: Object.freeze({ ...(options.attributes ?? {}) }),
  });
}

/** Test helper — reset id counter. */
export function resetStreamEventCounter(): void {
  eventCounter = 0;
}
