import type { ToolExecutionContext } from "../../tool-calling/models/ToolExecutionContext";
import { validateExecutionContext } from "../../tool-calling/validators/validateExecutionContext";

export type AdapterExecutionContextValidationCode =
  | "missing_now"
  | "invalid_attributes";

/**
 * Validate ToolExecutionContext for adapter execution.
 * Reuses Tool Calling Foundation structural rules.
 */
export function validateAdapterExecutionContext(
  context: ToolExecutionContext,
): readonly AdapterExecutionContextValidationCode[] {
  return validateExecutionContext(context);
}
