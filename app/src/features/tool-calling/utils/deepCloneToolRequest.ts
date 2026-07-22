import type { ToolRequest } from "../models/ToolRequest";
import { normalizeArguments } from "./normalizeArguments";

/**
 * Deep-clone a ToolRequest into a frozen copy.
 */
export function deepCloneToolRequest(request: ToolRequest): ToolRequest {
  return Object.freeze({
    id: request.id,
    toolName: request.toolName,
    arguments: normalizeArguments(request.arguments),
    requestedAt: request.requestedAt,
  });
}
