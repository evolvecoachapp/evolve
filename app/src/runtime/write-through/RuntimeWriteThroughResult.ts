import type { RuntimeWriteThroughPhase } from "./RuntimeWriteThroughInitialization";

export interface RuntimeWriteThroughResult {
  readonly status: "ready";
  readonly identityRecordCount: number;
  readonly runtimeRecordCount: number;
  readonly workspaceRecordCount: number;
  readonly persistedAt: string;
  readonly phases: readonly RuntimeWriteThroughPhase[];
}

export interface CreateRuntimeWriteThroughResultInput {
  readonly identityRecordCount: number;
  readonly runtimeRecordCount: number;
  readonly workspaceRecordCount: number;
  readonly persistedAt: string;
  readonly phases: readonly RuntimeWriteThroughPhase[];
}

export function createRuntimeWriteThroughResult(
  input: CreateRuntimeWriteThroughResultInput,
): RuntimeWriteThroughResult {
  return Object.freeze({
    status: "ready",
    identityRecordCount: input.identityRecordCount,
    runtimeRecordCount: input.runtimeRecordCount,
    workspaceRecordCount: input.workspaceRecordCount,
    persistedAt: input.persistedAt,
    phases: Object.freeze([...input.phases]),
  });
}
