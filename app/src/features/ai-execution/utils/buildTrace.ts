import type { AIExecutionStage } from "../models/AIExecutionStage";
import type { AIExecutionStatus } from "../models/AIExecutionStatus";
import type {
  AIExecutionTrace,
  AIExecutionTraceStep,
} from "../models/AIExecutionTrace";
import { freezeTrace, freezeTraceStep } from "./freezeObjects";

export function createTraceStep(options: {
  readonly stage: AIExecutionStage;
  readonly status: AIExecutionStatus;
  readonly startedAt: string;
  readonly completedAt?: string | null;
  readonly durationMs?: number | null;
  readonly validationIssues?: readonly string[];
  readonly message?: string | null;
}): AIExecutionTraceStep {
  return freezeTraceStep({
    stage: options.stage,
    status: options.status,
    startedAt: options.startedAt,
    completedAt: options.completedAt ?? null,
    durationMs: options.durationMs ?? null,
    validationIssues: Object.freeze([...(options.validationIssues ?? [])]),
    message: options.message ?? null,
  });
}

export function appendTraceStep(
  trace: AIExecutionTrace,
  step: AIExecutionTraceStep,
): AIExecutionTrace {
  return freezeTrace({
    executionId: trace.executionId,
    steps: Object.freeze([...trace.steps, freezeTraceStep(step)]),
  });
}

export function buildTrace(
  executionId: string,
  steps: readonly AIExecutionTraceStep[],
): AIExecutionTrace {
  return freezeTrace({
    executionId,
    steps: Object.freeze(steps.map(freezeTraceStep)),
  });
}
