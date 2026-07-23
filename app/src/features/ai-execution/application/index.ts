import type { AIExecutionOptions } from "../../ai-provider/models/AIExecutionOptions";
import type { AIProviderId } from "../../ai-provider/models/AIProviderId";
import type { PromptPackage } from "../../prompt-composition/models/PromptPackage";
import type { IAIProviderExecutorResolver } from "../contracts/IAIProviderExecutor";
import type { AIExecutionCancellation } from "../models/AIExecutionCancellation";
import type { AIExecutionContext } from "../models/AIExecutionContext";
import type { AIExecutionMetadata } from "../models/AIExecutionMetadata";
import type { AIExecutionPolicy } from "../models/AIExecutionPolicy";
import type { AIExecutionRequest } from "../models/AIExecutionRequest";
import type { AIExecutionResult } from "../models/AIExecutionResult";
import type { AIExecutionSummary } from "../models/AIExecutionSummary";
import type { AIExecutionTimeout } from "../models/AIExecutionTimeout";
import type { AIExecutionPipelineDeps } from "../pipeline/AIExecutionPipeline";
import {
  createAIExecutionService,
  type AIExecutionService,
} from "../services/AIExecutionService";

function resolveService(
  service?: AIExecutionService,
  deps?: AIExecutionPipelineDeps,
): AIExecutionService {
  if (service) {
    return service;
  }
  if (!deps?.executorResolver) {
    throw new Error(
      "executeAI requires an AIExecutionService or executorResolver",
    );
  }
  return createAIExecutionService(deps);
}

/**
 * Public API — execute PromptPackage through the AI Execution Pipeline.
 *
 * Does not expose pipeline / stage internals.
 */
export async function executeAI(options: {
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
  readonly service?: AIExecutionService;
  readonly executorResolver?: IAIProviderExecutorResolver;
  readonly registry?: AIExecutionPipelineDeps["registry"];
  readonly clock?: AIExecutionPipelineDeps["clock"];
}): Promise<AIExecutionResult> {
  const {
    service,
    executorResolver,
    registry,
    clock,
    ...input
  } = options;

  const resolved = resolveService(
    service,
    executorResolver
      ? { executorResolver, registry, clock }
      : undefined,
  );

  return resolved.executeAI(input);
}

/**
 * Public API — create immutable pipeline execution context (no execution).
 */
export function createExecutionContext(options: {
  readonly request: AIExecutionRequest;
  readonly contextId?: string;
  readonly preparedAt?: string;
  readonly service?: AIExecutionService;
  readonly executorResolver?: IAIProviderExecutorResolver;
  readonly registry?: AIExecutionPipelineDeps["registry"];
}): AIExecutionContext {
  const { service, executorResolver, registry, ...rest } = options;
  const resolved = resolveService(
    service,
    executorResolver ? { executorResolver, registry } : undefined,
  );
  return resolved.createExecutionContext(rest);
}

/**
 * Public API — summarize an execution result.
 */
export function summarizeExecution(options: {
  readonly result: AIExecutionResult;
  readonly service?: AIExecutionService;
  readonly executorResolver?: IAIProviderExecutorResolver;
  readonly registry?: AIExecutionPipelineDeps["registry"];
}): AIExecutionSummary {
  const { service, executorResolver, registry, result } = options;
  const resolved = resolveService(
    service,
    executorResolver ? { executorResolver, registry } : undefined,
  );
  return resolved.summarizeExecution(result);
}
