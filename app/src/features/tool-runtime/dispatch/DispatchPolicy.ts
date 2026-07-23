import type { DispatchContext } from "./DispatchContext";

/**
 * Dispatch routing policy — accept / reject only. No execution.
 */
export interface DispatchPolicy {
  readonly id: string;
  canDispatch(context: DispatchContext): boolean;
  rejectReason(context: DispatchContext): string | null;
}

export class DefaultDispatchPolicy implements DispatchPolicy {
  readonly id = "policy:dispatch:default";

  canDispatch(context: DispatchContext): boolean {
    return (
      context.step.toolId != null &&
      context.step.adapterId != null &&
      context.step.status !== "blocked" &&
      context.step.status !== "cancelled"
    );
  }

  rejectReason(context: DispatchContext): string | null {
    if (context.step.toolId == null) return "tool_unresolved";
    if (context.step.adapterId == null) return "adapter_unavailable";
    if (context.step.status === "blocked") return "step_blocked";
    if (context.step.status === "cancelled") return "step_cancelled";
    return null;
  }
}
