import type { ToolFailure } from "./ToolFailure";
import type { ToolSuccess } from "./ToolSuccess";

/**
 * Immutable discriminated result for one ActionStep tool invocation.
 */
export type ToolResult =
  | {
      readonly kind: "success";
      readonly success: ToolSuccess;
      readonly failure: null;
    }
  | {
      readonly kind: "failure";
      readonly success: null;
      readonly failure: ToolFailure;
    }
  | {
      readonly kind: "skipped";
      readonly success: null;
      readonly failure: null;
      readonly stepId: string;
      readonly reason: string;
    };

export const ToolResultKinds = Object.freeze({
  SUCCESS: "success" as const,
  FAILURE: "failure" as const,
  SKIPPED: "skipped" as const,
});
