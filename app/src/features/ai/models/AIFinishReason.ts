/**
 * Provider-agnostic generation completion reason.
 *
 * Mapped from vendor-specific finish reasons inside each provider.
 */
export type AIFinishReason =
  | "stop"
  | "length"
  | "content_filter"
  | "error"
  | "unknown";
