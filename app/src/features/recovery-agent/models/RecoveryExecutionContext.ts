export interface RecoveryExecutionContext {
  readonly requestId: string;
  readonly contextId: string;
  readonly planId: string | null;
  readonly startedAt: string;
}
