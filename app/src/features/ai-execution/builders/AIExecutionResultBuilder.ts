import type { AIResponse } from "../../ai-provider/models/AIResponse";
import type { AIProviderId } from "../../ai-provider/models/AIProviderId";
import type { AIExecutionErrorSnapshot } from "../models/AIExecutionError";
import type { AIExecutionLifecycle } from "../models/AIExecutionLifecycle";
import { EMPTY_LIFECYCLE } from "../models/AIExecutionLifecycle";
import type { AIExecutionMetadata } from "../models/AIExecutionMetadata";
import { EMPTY_EXECUTION_METADATA } from "../models/AIExecutionMetadata";
import type { AIExecutionMetrics } from "../models/AIExecutionMetrics";
import { EMPTY_EXECUTION_METRICS } from "../models/AIExecutionMetrics";
import type { AIExecutionResult } from "../models/AIExecutionResult";
import type { AIExecutionStatus } from "../models/AIExecutionStatus";
import { AIExecutionStatuses } from "../models/AIExecutionStatus";
import type { AIExecutionSummary } from "../models/AIExecutionSummary";
import type { AIExecutionTrace } from "../models/AIExecutionTrace";
import { createEmptyTrace } from "../models/AIExecutionTrace";
import { freezeResult } from "../utils/freezeObjects";
import { summarizeExecution } from "../utils/summarizeExecution";

/**
 * Fluent builder for immutable AIExecutionResult.
 */
export class AIExecutionResultBuilder {
  private id = "";
  private requestId = "";
  private contextId = "";
  private providerId: AIProviderId | null = null;
  private status: AIExecutionStatus = AIExecutionStatuses.PENDING;
  private response: AIResponse | null = null;
  private error: AIExecutionErrorSnapshot | null = null;
  private metrics: AIExecutionMetrics = EMPTY_EXECUTION_METRICS;
  private trace: AIExecutionTrace | null = null;
  private lifecycle: AIExecutionLifecycle = EMPTY_LIFECYCLE;
  private summary: AIExecutionSummary | null = null;
  private metadata: AIExecutionMetadata = EMPTY_EXECUTION_METADATA;
  private completedAt = "";
  private validationIssues: readonly string[] = [];

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withRequestId(requestId: string): this {
    this.requestId = requestId;
    return this;
  }

  withContextId(contextId: string): this {
    this.contextId = contextId;
    return this;
  }

  withProviderId(providerId: AIProviderId | null): this {
    this.providerId = providerId;
    return this;
  }

  withStatus(status: AIExecutionStatus): this {
    this.status = status;
    return this;
  }

  withResponse(response: AIResponse | null): this {
    this.response = response;
    return this;
  }

  withError(error: AIExecutionErrorSnapshot | null): this {
    this.error = error;
    return this;
  }

  withMetrics(metrics: AIExecutionMetrics): this {
    this.metrics = metrics;
    return this;
  }

  withTrace(trace: AIExecutionTrace): this {
    this.trace = trace;
    return this;
  }

  withLifecycle(lifecycle: AIExecutionLifecycle): this {
    this.lifecycle = lifecycle;
    return this;
  }

  withSummary(summary: AIExecutionSummary): this {
    this.summary = summary;
    return this;
  }

  withMetadata(metadata: AIExecutionMetadata): this {
    this.metadata = metadata;
    return this;
  }

  withCompletedAt(completedAt: string): this {
    this.completedAt = completedAt;
    return this;
  }

  withValidationIssues(issues: readonly string[]): this {
    this.validationIssues = issues;
    return this;
  }

  build(): AIExecutionResult {
    if (!this.id || !this.requestId || !this.contextId || !this.completedAt) {
      throw new Error("AIExecutionResultBuilder missing required fields");
    }

    const trace = this.trace ?? createEmptyTrace(this.id);
    const draft: AIExecutionResult = {
      id: this.id,
      requestId: this.requestId,
      contextId: this.contextId,
      providerId: this.providerId,
      status: this.status,
      response: this.response,
      error: this.error,
      metrics: this.metrics,
      trace,
      lifecycle: this.lifecycle,
      summary: this.summary ?? {
        executionId: this.id,
        requestId: this.requestId,
        providerId: this.providerId,
        status: this.status,
        succeeded: this.status === AIExecutionStatuses.SUCCEEDED,
        stageCount: trace.steps.length,
        completedStages: this.lifecycle.completedStages,
        durationMs: this.metrics.durationMs,
        hasResponse: this.response !== null,
        errorCode: this.error?.code ?? null,
        message: this.error?.message ?? null,
      },
      metadata: this.metadata,
      completedAt: this.completedAt,
      validationIssues: Object.freeze([...this.validationIssues]),
    };

    const withSummary = this.summary
      ? draft
      : { ...draft, summary: summarizeExecution(draft) };

    return freezeResult(withSummary);
  }
}
