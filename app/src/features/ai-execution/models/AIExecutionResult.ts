import type { AIResponse } from "../../ai-provider/models/AIResponse";
import type { AIProviderId } from "../../ai-provider/models/AIProviderId";
import type { AIExecutionErrorSnapshot } from "./AIExecutionError";
import type { AIExecutionLifecycle } from "./AIExecutionLifecycle";
import type { AIExecutionMetadata } from "./AIExecutionMetadata";
import type { AIExecutionMetrics } from "./AIExecutionMetrics";
import type { AIExecutionStatus } from "./AIExecutionStatus";
import type { AIExecutionSummary } from "./AIExecutionSummary";
import type { AIExecutionTrace } from "./AIExecutionTrace";

/**
 * Immutable pipeline execution result.
 */
export interface AIExecutionResult {
  readonly id: string;
  readonly requestId: string;
  readonly contextId: string;
  readonly providerId: AIProviderId | null;
  readonly status: AIExecutionStatus;
  readonly response: AIResponse | null;
  readonly error: AIExecutionErrorSnapshot | null;
  readonly metrics: AIExecutionMetrics;
  readonly trace: AIExecutionTrace;
  readonly lifecycle: AIExecutionLifecycle;
  readonly summary: AIExecutionSummary;
  readonly metadata: AIExecutionMetadata;
  readonly completedAt: string;
  readonly validationIssues: readonly string[];
}
