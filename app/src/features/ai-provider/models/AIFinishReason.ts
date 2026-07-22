/**
 * Standardized finish reason for AI responses (provider-agnostic).
 */
export type AIFinishReason =
  | "stop"
  | "length"
  | "content_filter"
  | "tool_calls"
  | "error"
  | "cancelled"
  | "unknown";

export const AIFinishReasons = Object.freeze({
  STOP: "stop",
  LENGTH: "length",
  CONTENT_FILTER: "content_filter",
  TOOL_CALLS: "tool_calls",
  ERROR: "error",
  CANCELLED: "cancelled",
  UNKNOWN: "unknown",
} as const satisfies Record<string, AIFinishReason>);

export const ALL_FINISH_REASONS: readonly AIFinishReason[] = Object.freeze([
  AIFinishReasons.STOP,
  AIFinishReasons.LENGTH,
  AIFinishReasons.CONTENT_FILTER,
  AIFinishReasons.TOOL_CALLS,
  AIFinishReasons.ERROR,
  AIFinishReasons.CANCELLED,
  AIFinishReasons.UNKNOWN,
]);
