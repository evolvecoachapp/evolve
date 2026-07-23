import type { AIExecutionResult } from "../models/AIExecutionResult";
import type { AIExecutionSummary } from "../models/AIExecutionSummary";
import { freezeSummary } from "./freezeObjects";
import { formatDurationMs, formatExecutionLabel } from "./formatting";

export function summarizeExecution(
  result: AIExecutionResult,
): AIExecutionSummary {
  return freezeSummary({
    executionId: result.id,
    requestId: result.requestId,
    providerId: result.providerId,
    status: result.status,
    succeeded: result.status === "succeeded",
    stageCount: result.trace.steps.length,
    completedStages: Object.freeze(
      result.lifecycle.completedStages.slice(),
    ),
    durationMs: result.metrics.durationMs,
    hasResponse: result.response !== null,
    errorCode: result.error?.code ?? null,
    message:
      result.error?.message ??
      formatExecutionLabel({
        executionId: result.id,
        status: result.status,
        providerId: result.providerId,
      }),
  });
}

export function formatExecutionSummary(summary: AIExecutionSummary): string {
  const duration = formatDurationMs(summary.durationMs);
  const outcome = summary.succeeded ? "ok" : summary.errorCode ?? "failed";
  return `${summary.executionId} ${outcome} stages=${summary.stageCount} duration=${duration}`;
}
