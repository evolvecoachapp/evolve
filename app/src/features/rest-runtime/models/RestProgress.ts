/**
 * Timing progress for an active rest runtime.
 */
export interface RestProgress {
  readonly targetDurationMs: number;
  readonly elapsedMs: number;
  readonly remainingMs: number;
  readonly overtimeMs: number;
  /** 0–100 of target consumed (may reach 100 while still Running in overtime). */
  readonly completionPercent: number;
  readonly isOvertime: boolean;
}
