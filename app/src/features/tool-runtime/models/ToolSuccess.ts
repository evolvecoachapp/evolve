/**
 * Immutable success payload for a single tool invocation.
 */
export interface ToolSuccess {
  readonly stepId: string;
  readonly toolId: string;
  readonly adapterId: string;
  readonly data: unknown;
  readonly durationMs: number | null;
  readonly completedAt: string;
}
