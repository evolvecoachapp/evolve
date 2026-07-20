/**
 * Local session timing state for rest countdown + active-set focus.
 * In-memory only — no persistence, sync, or Training Engine coupling.
 */

export type SessionRestStatus = "idle" | "running" | "paused";

/** Snapshot of the local rest countdown. */
export interface SessionRestSnapshot {
  readonly status: SessionRestStatus;
  readonly secondsLeft: number;
  readonly totalSeconds: number;
  /** Set that triggered the rest (completed working set). */
  readonly sourceSetId: string | null;
  /** Next pending set the athlete will face after rest. */
  readonly upcomingSetId: string | null;
}

/** Ordered set reference used for active-set navigation. */
export interface SessionSetRef {
  readonly setId: string;
  readonly exerciseId: string;
  readonly exerciseName: string;
  readonly setOrder: number;
  readonly setType: string;
  readonly setTypeLabel: string;
  readonly restSeconds: number | null;
}
