import type { ToolExecutionMetadata } from "./ToolExecutionMetadata";

/**
 * Immutable Tool Runtime execution context (orchestration only).
 *
 * Distinct from tool-calling `ToolExecutionContext`.
 */
export interface ToolExecutionContext {
  readonly id: string;
  readonly planId: string;
  readonly actionPlanId: string;
  readonly sourceResponseId: string;
  readonly conversationId: string | null;
  readonly athleteId: string | null;
  readonly requestedAt: string;
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
  readonly metadata: ToolExecutionMetadata;
}

export const EMPTY_RUNTIME_ATTRIBUTES: Readonly<
  Record<string, string | number | boolean | null>
> = Object.freeze({});
