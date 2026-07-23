import type { ToolExecutionStep } from "../models/ToolExecutionStep";

export interface TimeoutPolicy {
  readonly id: string;
  timeoutMs(step: ToolExecutionStep): number | null;
}

export class DefaultTimeoutPolicy implements TimeoutPolicy {
  readonly id = "policy:timeout:default";

  timeoutMs(_step: ToolExecutionStep): number | null {
    return null;
  }
}
