import type { ToolDescriptor } from "../models/ToolDescriptor";
import type { ToolEngineResult } from "../models/ToolEngineResult";

/** Format a tool id for display (underscores → spaces, title case-ish). */
export function formatToolId(toolId: string): string {
  return toolId
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Compact one-line descriptor label. */
export function formatToolDescriptor(descriptor: ToolDescriptor): string {
  return `${descriptor.id} [${descriptor.category}] — ${descriptor.description}`;
}

/** Compact one-line engine result status. */
export function formatEngineResult(result: ToolEngineResult): string {
  return `${result.response.toolId}: ${result.response.status}`;
}
