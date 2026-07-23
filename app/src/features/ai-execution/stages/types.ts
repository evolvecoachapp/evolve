import type { IAIProvider } from "../../ai-provider/contracts/IAIProvider";
import type { IAIProviderRegistry } from "../../ai-provider/contracts/IAIProviderRegistry";
import type { AIResponse } from "../../ai-provider/models/AIResponse";
import type { IAIProviderExecutor } from "../contracts/IAIProviderExecutor";
import type { IAIProviderExecutorResolver } from "../contracts/IAIProviderExecutor";
import type { AIExecutionContext } from "../models/AIExecutionContext";
import type { AIExecutionLifecycle } from "../models/AIExecutionLifecycle";
import type { AIExecutionMetrics } from "../models/AIExecutionMetrics";
import type { AIExecutionRequest } from "../models/AIExecutionRequest";
import type { AIExecutionResult } from "../models/AIExecutionResult";
import type { AIExecutionStage } from "../models/AIExecutionStage";
import type { AIExecutionTrace } from "../models/AIExecutionTrace";
import type { AIExecutionErrorSnapshot } from "../models/AIExecutionError";

/**
 * Mutable working state for a single pipeline run.
 * Frozen into immutable models at stage boundaries / result build.
 */
export interface PipelineWorkingState {
  request: AIExecutionRequest;
  context: AIExecutionContext | null;
  provider: IAIProvider | null;
  executor: IAIProviderExecutor | null;
  response: AIResponse | null;
  result: AIExecutionResult | null;
  trace: AIExecutionTrace;
  lifecycle: AIExecutionLifecycle;
  metrics: AIExecutionMetrics;
  validationIssues: string[];
  error: AIExecutionErrorSnapshot | null;
  startedAt: string;
  now: string;
  stageStartedAt: Record<string, string>;
}

export interface StageDependencies {
  readonly registry: IAIProviderRegistry;
  readonly executorResolver: IAIProviderExecutorResolver;
}

export interface AIExecutionStageHandler {
  readonly name: AIExecutionStage;
  run(
    state: PipelineWorkingState,
    deps: StageDependencies,
  ): Promise<PipelineWorkingState> | PipelineWorkingState;
}
