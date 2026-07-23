import type { AIExecutionOptions } from "../../ai-provider/models/AIExecutionOptions";
import { DEFAULT_EXECUTION_OPTIONS } from "../../ai-provider/models/AIExecutionOptions";
import type { AIProviderId } from "../../ai-provider/models/AIProviderId";
import type { PromptPackage } from "../../prompt-composition/models/PromptPackage";
import { AIExecutionContextBuilder } from "../builders/AIExecutionContextBuilder";
import { AIExecutionRequestBuilder } from "../builders/AIExecutionRequestBuilder";
import type { IAIProviderExecutorResolver } from "../contracts/IAIProviderExecutor";
import type { AIExecutionCancellation } from "../models/AIExecutionCancellation";
import { NO_CANCELLATION } from "../models/AIExecutionCancellation";
import type { AIExecutionContext } from "../models/AIExecutionContext";
import type { AIExecutionMetadata } from "../models/AIExecutionMetadata";
import { EMPTY_EXECUTION_METADATA } from "../models/AIExecutionMetadata";
import type { AIExecutionPolicy } from "../models/AIExecutionPolicy";
import { DEFAULT_AI_EXECUTION_POLICY } from "../models/AIExecutionPolicy";
import type { AIExecutionRequest } from "../models/AIExecutionRequest";
import type { AIExecutionResult } from "../models/AIExecutionResult";
import type { AIExecutionSummary } from "../models/AIExecutionSummary";
import type { AIExecutionTimeout } from "../models/AIExecutionTimeout";
import { NO_TIMEOUT } from "../models/AIExecutionTimeout";
import { INITIAL_EXECUTION_STATE } from "../models/AIExecutionState";
import { EMPTY_LIFECYCLE } from "../models/AIExecutionLifecycle";
import {
  createAIExecutionPipeline,
  type AIExecutionPipeline,
  type AIExecutionPipelineDeps,
} from "../pipeline/AIExecutionPipeline";
import { summarizeExecution } from "../utils/summarizeExecution";

export interface ExecuteAIInput {
  readonly promptPackage: PromptPackage;
  readonly providerId: AIProviderId;
  readonly modelId?: string | null;
  readonly options?: AIExecutionOptions | null;
  readonly metadata?: AIExecutionMetadata;
  readonly policy?: AIExecutionPolicy;
  readonly cancellation?: AIExecutionCancellation;
  readonly timeout?: AIExecutionTimeout;
  readonly requestId?: string;
  readonly createdAt?: string;
}

/**
 * Service facade over AIExecutionPipeline.
 * Hides stage / pipeline internals from application consumers.
 */
export class AIExecutionService {
  private readonly pipeline: AIExecutionPipeline;

  constructor(pipeline: AIExecutionPipeline) {
    this.pipeline = pipeline;
  }

  getPipeline(): AIExecutionPipeline {
    return this.pipeline;
  }

  async executeAI(input: ExecuteAIInput): Promise<AIExecutionResult> {
    const request = this.buildRequest(input);
    return this.pipeline.execute(request);
  }

  createExecutionContext(options: {
    readonly request: AIExecutionRequest;
    readonly contextId?: string;
    readonly preparedAt?: string;
  }): AIExecutionContext {
    const preparedAt = options.preparedAt ?? options.request.createdAt;
    const contextId =
      options.contextId ?? `ai-exec-ctx:${options.request.id}`;

    return new AIExecutionContextBuilder()
      .withId(contextId)
      .withRequestId(options.request.id)
      .withProviderId(options.request.providerId)
      .withPromptPackageId(options.request.promptPackage.id)
      .withModelId(options.request.modelId)
      .withOptions(options.request.options)
      .withState(INITIAL_EXECUTION_STATE)
      .withLifecycle(EMPTY_LIFECYCLE)
      .withPolicy(options.request.policy)
      .withMetadata(options.request.metadata)
      .withPreparedAt(preparedAt)
      .withValidationIssues([])
      .build();
  }

  summarizeExecution(result: AIExecutionResult): AIExecutionSummary {
    return summarizeExecution(result);
  }

  private buildRequest(input: ExecuteAIInput): AIExecutionRequest {
    const createdAt = input.createdAt ?? new Date().toISOString();
    const requestId =
      input.requestId ??
      `ai-exec-req:${input.promptPackage.id}:${createdAt}`;

    return new AIExecutionRequestBuilder()
      .withId(requestId)
      .withPromptPackage(input.promptPackage)
      .withProviderId(input.providerId)
      .withModelId(input.modelId ?? null)
      .withOptions(input.options ?? DEFAULT_EXECUTION_OPTIONS)
      .withMetadata(input.metadata ?? EMPTY_EXECUTION_METADATA)
      .withPolicy(input.policy ?? DEFAULT_AI_EXECUTION_POLICY)
      .withCancellation(input.cancellation ?? NO_CANCELLATION)
      .withTimeout(input.timeout ?? NO_TIMEOUT)
      .withCreatedAt(createdAt)
      .build();
  }
}

export function createAIExecutionService(
  deps: AIExecutionPipelineDeps,
): AIExecutionService {
  return new AIExecutionService(createAIExecutionPipeline(deps));
}

export type { IAIProviderExecutorResolver };
