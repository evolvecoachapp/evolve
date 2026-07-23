/**
 * Immutable execution context contract for future runtimes.
 */
export interface ExecutionContext {
  readonly id: string;
  readonly planId: string;
  readonly sourceResponseId: string;
  readonly requestedAt: string;
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
}

export function createExecutionContext(
  partial: ExecutionContext,
): ExecutionContext {
  return Object.freeze({
    ...partial,
    attributes: Object.freeze({ ...partial.attributes }),
  });
}
