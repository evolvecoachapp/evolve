import type { HydrationPhase } from "./HydrationInitialization";

export interface HydrationResult {
  readonly status: "ready";
  readonly identityRecordCount: number;
  readonly runtimeRecordCount: number;
  readonly workspaceRecordCount: number;
  readonly restoredAt: string;
  readonly phases: readonly HydrationPhase[];
}

export interface CreateHydrationResultInput {
  readonly identityRecordCount: number;
  readonly runtimeRecordCount: number;
  readonly workspaceRecordCount: number;
  readonly restoredAt: string;
  readonly phases: readonly HydrationPhase[];
}

export function createHydrationResult(
  input: CreateHydrationResultInput,
): HydrationResult {
  return Object.freeze({
    status: "ready",
    identityRecordCount: input.identityRecordCount,
    runtimeRecordCount: input.runtimeRecordCount,
    workspaceRecordCount: input.workspaceRecordCount,
    restoredAt: input.restoredAt,
    phases: Object.freeze([...input.phases]),
  });
}
