import type { ToolExecutionPlan } from "../models/ToolExecutionPlan";
import type { ToolExecutionStep } from "../models/ToolExecutionStep";

export interface RetryPolicy {
  readonly id: string;
  maxAttempts(step: ToolExecutionStep): number;
  shouldRetry(step: ToolExecutionStep, attempt: number): boolean;
}

export class DefaultRetryPolicy implements RetryPolicy {
  readonly id = "policy:retry:default";

  maxAttempts(_step: ToolExecutionStep): number {
    return 1;
  }

  shouldRetry(_step: ToolExecutionStep, attempt: number): boolean {
    return attempt < 1;
  }
}
