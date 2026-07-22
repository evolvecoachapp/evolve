import type { RestState } from "./RestState";

export type RestEventType =
  | "rest_started"
  | "rest_paused"
  | "rest_resumed"
  | "rest_completed"
  | "rest_cancelled"
  | "rest_expired"
  | "elapsed_updated";

/**
 * Append-only in-memory rest event (not telemetry / analytics).
 */
export interface RestEvent {
  readonly id: string;
  readonly type: RestEventType;
  readonly sequence: number;
  readonly state: RestState;
  readonly elapsedMs: number;
  readonly message: string;
  readonly occurredAt: string;
}
