/**
 * Domain families exposed through Domain Tool Adapters.
 *
 * Future adapters (nutrition, mobility, sleep, goal) extend this union.
 */
export type DomainToolDomain =
  | "workout"
  | "recovery"
  | "coach"
  | "athlete"
  | "nutrition"
  | "mobility"
  | "sleep"
  | "goal";

export const DOMAIN_TOOL_DOMAINS = Object.freeze([
  "workout",
  "recovery",
  "coach",
  "athlete",
  "nutrition",
  "mobility",
  "sleep",
  "goal",
] as const satisfies readonly DomainToolDomain[]);
