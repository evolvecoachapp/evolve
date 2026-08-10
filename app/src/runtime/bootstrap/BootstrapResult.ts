import type { RuntimeInitializationPhase } from "./RuntimeInitialization";

export interface BootstrapResult {
  readonly status: "ready";
  readonly serviceTokenCount: number;
  readonly validatedAt: string;
  readonly phases: readonly RuntimeInitializationPhase[];
}

export interface CreateBootstrapResultInput {
  readonly serviceTokenCount: number;
  readonly validatedAt: string;
  readonly phases: readonly RuntimeInitializationPhase[];
}

export function createBootstrapResult(
  input: CreateBootstrapResultInput,
): BootstrapResult {
  return Object.freeze({
    status: "ready",
    serviceTokenCount: input.serviceTokenCount,
    validatedAt: input.validatedAt,
    phases: Object.freeze([...input.phases]),
  });
}
