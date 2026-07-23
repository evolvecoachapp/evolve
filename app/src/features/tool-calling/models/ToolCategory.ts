/**
 * Provider-agnostic tool category.
 *
 * Domain-specific grouping is reserved for future domain tool integration.
 */
export type ToolCategory =
  | "query"
  | "mutation"
  | "utility"
  | "system"
  | "domain"
  | "unknown";

export const TOOL_CATEGORIES = Object.freeze([
  "query",
  "mutation",
  "utility",
  "system",
  "domain",
  "unknown",
] as const satisfies readonly ToolCategory[]);
