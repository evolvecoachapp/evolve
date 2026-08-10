import type { PersistenceRecord } from "../../core/persistence/contracts/PersistenceRecord";
import type { IdentityRepository } from "../../core/persistence/repositories/IdentityRepository";
import type { RuntimeRepository } from "../../core/persistence/repositories/RuntimeRepository";
import type { WorkspaceRepository } from "../../core/persistence/repositories/WorkspaceRepository";
import type { AthleteIdentityService } from "../../features/athlete-identity/services/AthleteIdentityService";
import type { RuntimeEnvironmentService } from "../../features/runtime-environment/services/RuntimeEnvironmentService";
import type { UnifiedWorkspaceService } from "../../features/unified-workspace/services/UnifiedWorkspaceService";
import { RuntimeWriteThroughError } from "./RuntimeWriteThroughError";

/**
 * Structural observation from runtime composition services into persistence records.
 * Uses identifiers only — no domain interpretation.
 */
export function observeIdentityRecords(
  service: AthleteIdentityService,
  athleteIds: readonly string[],
): readonly PersistenceRecord[] {
  const records: PersistenceRecord[] = [];

  for (const athleteId of athleteIds) {
    const identity = service.getAthleteIdentity(athleteId);
    if (identity) {
      records.push(Object.freeze({ id: identity.athleteId }));
    }
  }

  return Object.freeze(records);
}

export function observeRuntimeRecord(
  service: RuntimeEnvironmentService,
): PersistenceRecord | null {
  const runtime = service.getRuntimeEnvironment();
  if (!runtime) {
    return null;
  }

  return Object.freeze({ id: runtime.id });
}

export function observeWorkspaceRecords(
  service: UnifiedWorkspaceService,
  athleteIds: readonly string[],
): readonly PersistenceRecord[] {
  const records: PersistenceRecord[] = [];

  for (const athleteId of athleteIds) {
    const workspace = service.getWorkspace(athleteId);
    if (workspace) {
      records.push(Object.freeze({ id: workspace.athleteId }));
    }
  }

  return Object.freeze(records);
}

async function invokeRepositorySave(
  save: (record: PersistenceRecord) => Promise<void> | void,
  record: PersistenceRecord,
): Promise<void> {
  await Promise.resolve(save(record));
}

export interface PersistRuntimeRecordsInput {
  readonly identityRepository: IdentityRepository;
  readonly runtimeRepository: RuntimeRepository;
  readonly workspaceRepository: WorkspaceRepository;
  readonly identityRecords: readonly PersistenceRecord[];
  readonly runtimeRecord: PersistenceRecord | null;
  readonly workspaceRecords: readonly PersistenceRecord[];
}

export interface PersistRuntimeRecordsResult {
  readonly identityRecordCount: number;
  readonly runtimeRecordCount: number;
  readonly workspaceRecordCount: number;
}

export async function persistRuntimeRecords(
  input: PersistRuntimeRecordsInput,
): Promise<PersistRuntimeRecordsResult> {
  try {
    for (const record of input.identityRecords) {
      await invokeRepositorySave(
        (next) => input.identityRepository.save(next),
        record,
      );
    }

    if (input.runtimeRecord) {
      await invokeRepositorySave(
        (next) => input.runtimeRepository.save(next),
        input.runtimeRecord,
      );
    }

    for (const record of input.workspaceRecords) {
      await invokeRepositorySave(
        (next) => input.workspaceRepository.save(next),
        record,
      );
    }
  } catch (error) {
    throw new RuntimeWriteThroughError(
      error instanceof Error
        ? error.message
        : "Repository contract rejected write-through persistence",
      "repository_contract_failed",
    );
  }

  return {
    identityRecordCount: input.identityRecords.length,
    runtimeRecordCount: input.runtimeRecord ? 1 : 0,
    workspaceRecordCount: input.workspaceRecords.length,
  };
}
