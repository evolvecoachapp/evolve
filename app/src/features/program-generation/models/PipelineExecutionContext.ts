/**
 * Immutable execution context built once at the start of orchestration
 * and updated with engine output identifiers as steps complete.
 */
export interface PipelineExecutionContext {
  readonly generationId: string;
  readonly athleteId: string;
  readonly conversationId: string | null;
  /** ISO-8601 from WorkflowContext.now when provided. */
  readonly workflowNow: string | null;
  readonly dayId: string | null;
  readonly weekNumber: number | null;
  readonly includeExplanations: boolean;
  readonly blueprintId: string | null;
  readonly selectionRequestId: string | null;
  readonly programmingRequestId: string | null;
  readonly progressionRequestId: string | null;
  readonly adaptationRequestId: string | null;
  readonly assemblyRequestId: string | null;
  readonly sessionId: string | null;
}
