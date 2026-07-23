import type { StreamEventType } from "./StreamEventType";
import type { StreamStatus } from "./StreamStatus";

/**
 * Immutable stream lifecycle / progress event.
 */
export interface StreamEvent {
  readonly id: string;
  readonly streamId: string;
  readonly type: StreamEventType;
  readonly status: StreamStatus | null;
  readonly message: string | null;
  readonly chunkIndex: number | null;
  readonly occurredAt: string;
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
}
