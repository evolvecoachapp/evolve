/**
 * Immutable execution result contract for future runtimes.
 * Action Engine does not produce real results — contract only.
 */
export interface ExecutionResult {
  readonly id: string;
  readonly requestId: string;
  readonly success: boolean;
  readonly completedStepIds: readonly string[];
  readonly skippedStepIds: readonly string[];
  readonly message: string | null;
  readonly completedAt: string;
}

export function createExecutionResult(
  partial: ExecutionResult,
): ExecutionResult {
  return Object.freeze({
    ...partial,
    completedStepIds: Object.freeze([...partial.completedStepIds]),
    skippedStepIds: Object.freeze([...partial.skippedStepIds]),
  });
}
