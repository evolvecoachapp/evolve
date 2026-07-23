import type { NutritionCapability } from "./NutritionCapability";

/**
 * Immutable record of a domain capability selected and/or invoked by the agent.
 * Holds orchestration metadata only — never embeds domain business results.
 */
export interface NutritionDomainInvocation {
  readonly id: string;
  readonly capability: NutritionCapability;
  readonly status: NutritionDomainInvocationStatus;
  readonly summary: string | null;
  readonly resultRef: string | null;
  readonly attributes: Readonly<Record<string, string>>;
  readonly invokedAt: string;
}

export type NutritionDomainInvocationStatus =
  | "selected"
  | "invoked"
  | "skipped"
  | "failed";

export const NutritionDomainInvocationStatuses = Object.freeze({
  SELECTED: "selected" as const,
  INVOKED: "invoked" as const,
  SKIPPED: "skipped" as const,
  FAILED: "failed" as const,
});
