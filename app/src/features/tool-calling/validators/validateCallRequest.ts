import type { ToolCallRequest } from "../models/ToolCallRequest";
import { validateExecutionContext } from "./validateExecutionContext";
import { validateToolId } from "./validateToolId";

export type CallRequestValidationCode =
  | "missing_request_id"
  | "missing_call_id"
  | "missing_created_at"
  | "missing_tool_id"
  | "invalid_tool_id_format"
  | "invalid_input_shape"
  | "missing_now"
  | "invalid_attributes";

/**
 * Validate a ToolCallRequest for the Tool Calling Engine.
 */
export function validateCallRequest(
  request: ToolCallRequest,
): readonly CallRequestValidationCode[] {
  const issues: CallRequestValidationCode[] = [];

  if (typeof request.id !== "string" || request.id.trim().length === 0) {
    issues.push("missing_request_id");
  }

  if (
    typeof request.call?.id !== "string" ||
    request.call.id.trim().length === 0
  ) {
    issues.push("missing_call_id");
  }

  if (
    typeof request.createdAt !== "string" ||
    request.createdAt.trim().length === 0
  ) {
    issues.push("missing_created_at");
  }

  const toolIdIssues = validateToolId(request.call?.toolId ?? "");
  for (const code of toolIdIssues) {
    issues.push(code);
  }

  if (
    !request.call?.input ||
    typeof request.call.input.parameters !== "object" ||
    request.call.input.parameters === null
  ) {
    issues.push("invalid_input_shape");
  }

  const contextIssues = validateExecutionContext(request.context);
  for (const code of contextIssues) {
    issues.push(code);
  }

  return Object.freeze([...new Set(issues)]);
}
