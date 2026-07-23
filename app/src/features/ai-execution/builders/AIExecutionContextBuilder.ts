import type { AIExecutionOptions } from "../../ai-provider/models/AIExecutionOptions";
import { DEFAULT_EXECUTION_OPTIONS } from "../../ai-provider/models/AIExecutionOptions";
import type { AIProvider } from "../../ai-provider/models/AIProvider";
import type { AIProviderId } from "../../ai-provider/models/AIProviderId";
import type { AIExecutionContext } from "../models/AIExecutionContext";
import type { AIExecutionLifecycle } from "../models/AIExecutionLifecycle";
import { EMPTY_LIFECYCLE } from "../models/AIExecutionLifecycle";
import type { AIExecutionMetadata } from "../models/AIExecutionMetadata";
import { EMPTY_EXECUTION_METADATA } from "../models/AIExecutionMetadata";
import type { AIExecutionPolicy } from "../models/AIExecutionPolicy";
import { DEFAULT_AI_EXECUTION_POLICY } from "../models/AIExecutionPolicy";
import type { AIExecutionState } from "../models/AIExecutionState";
import { INITIAL_EXECUTION_STATE } from "../models/AIExecutionState";
import { freezeContext } from "../utils/freezeObjects";

/**
 * Fluent builder for immutable pipeline AIExecutionContext.
 */
export class AIExecutionContextBuilder {
  private id = "";
  private requestId = "";
  private providerId: AIProviderId | null = null;
  private promptPackageId = "";
  private modelId: string | null = null;
  private options: AIExecutionOptions = DEFAULT_EXECUTION_OPTIONS;
  private state: AIExecutionState = INITIAL_EXECUTION_STATE;
  private lifecycle: AIExecutionLifecycle = EMPTY_LIFECYCLE;
  private policy: AIExecutionPolicy = DEFAULT_AI_EXECUTION_POLICY;
  private metadata: AIExecutionMetadata = EMPTY_EXECUTION_METADATA;
  private provider: AIProvider | null = null;
  private preparedAt = "";
  private validationIssues: readonly string[] = [];

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withRequestId(requestId: string): this {
    this.requestId = requestId;
    return this;
  }

  withProviderId(providerId: AIProviderId): this {
    this.providerId = providerId;
    return this;
  }

  withPromptPackageId(promptPackageId: string): this {
    this.promptPackageId = promptPackageId;
    return this;
  }

  withModelId(modelId: string | null): this {
    this.modelId = modelId;
    return this;
  }

  withOptions(options: AIExecutionOptions): this {
    this.options = options;
    return this;
  }

  withState(state: AIExecutionState): this {
    this.state = state;
    return this;
  }

  withLifecycle(lifecycle: AIExecutionLifecycle): this {
    this.lifecycle = lifecycle;
    return this;
  }

  withPolicy(policy: AIExecutionPolicy): this {
    this.policy = policy;
    return this;
  }

  withMetadata(metadata: AIExecutionMetadata): this {
    this.metadata = metadata;
    return this;
  }

  withProvider(provider: AIProvider | null): this {
    this.provider = provider;
    return this;
  }

  withPreparedAt(preparedAt: string): this {
    this.preparedAt = preparedAt;
    return this;
  }

  withValidationIssues(issues: readonly string[]): this {
    this.validationIssues = issues;
    return this;
  }

  build(): AIExecutionContext {
    if (
      !this.id ||
      !this.requestId ||
      !this.providerId ||
      !this.promptPackageId ||
      !this.preparedAt
    ) {
      throw new Error("AIExecutionContextBuilder missing required fields");
    }

    return freezeContext({
      id: this.id,
      requestId: this.requestId,
      providerId: this.providerId,
      promptPackageId: this.promptPackageId,
      modelId: this.modelId,
      options: this.options,
      state: this.state,
      lifecycle: this.lifecycle,
      policy: this.policy,
      metadata: this.metadata,
      provider: this.provider,
      preparedAt: this.preparedAt,
      validationIssues: Object.freeze([...this.validationIssues]),
    });
  }
}
