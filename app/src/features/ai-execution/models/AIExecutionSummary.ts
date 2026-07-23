import type { AIExecutionStage } from "./AIExecutionStage";
import type { AIExecutionStatus } from "./AIExecutionStatus";
import type { AIProviderId } from "../../ai-provider/models/AIProviderId";

/**
 * Compact immutable summary of an execution result.
 */
export interface AIExecutionSummary {
  readonly executionId: string;
  readonly requestId: string;
  readonly providerId: AIProviderId | null;
  readonly status: AIExecutionStatus;
  readonly succeeded: boolean;
  readonly stageCount: number;
  readonly completedStages: readonly AIExecutionStage[];
  readonly durationMs: number | null;
  readonly hasResponse: boolean;
  readonly errorCode: string | null;
  readonly message: string | null;
}
