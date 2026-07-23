import type { ToolResult } from "../models/ToolResult";

export type FailureAction = "abort" | "continue" | "skip_dependents";

export interface FailurePolicy {
  readonly id: string;
  onFailure(result: ToolResult): FailureAction;
}

export class DefaultFailurePolicy implements FailurePolicy {
  readonly id = "policy:failure:default";

  onFailure(result: ToolResult): FailureAction {
    if (result.kind === "failure") return "abort";
    return "continue";
  }
}
