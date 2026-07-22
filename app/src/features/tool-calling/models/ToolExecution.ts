import type { ToolStatus } from "./ToolStatus";

/** Mutable-lifecycle record for one tool run. */
export interface ToolExecution {
  readonly id: string;
  readonly requestId: string;
  readonly toolName: string;
  readonly status: ToolStatus;
  /** ISO-8601 timestamp. */
  readonly startedAt: string;
  /** ISO-8601 timestamp when finished, else null. */
  readonly completedAt: string | null;
}
