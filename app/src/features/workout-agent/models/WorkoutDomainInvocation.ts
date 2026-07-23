import type { WorkoutDomainCapability } from "./WorkoutDomainCapability";

/**
 * Immutable record of a domain capability selected and/or invoked by the agent.
 * Holds orchestration metadata only — never embeds domain business results.
 */
export interface WorkoutDomainInvocation {
  readonly id: string;
  readonly capability: WorkoutDomainCapability;
  readonly status: WorkoutDomainInvocationStatus;
  readonly summary: string | null;
  readonly resultRef: string | null;
  readonly attributes: Readonly<Record<string, string>>;
  readonly invokedAt: string;
}

export type WorkoutDomainInvocationStatus =
  | "selected"
  | "invoked"
  | "skipped"
  | "failed";

export const WorkoutDomainInvocationStatuses = Object.freeze({
  SELECTED: "selected" as const,
  INVOKED: "invoked" as const,
  SKIPPED: "skipped" as const,
  FAILED: "failed" as const,
});
