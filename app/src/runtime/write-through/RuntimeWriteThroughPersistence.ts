import type { PersistenceRecord } from "../../core/persistence/contracts/PersistenceRecord";
import type { IdentityRepository } from "../../core/persistence/repositories/IdentityRepository";
import type { RuntimeRepository } from "../../core/persistence/repositories/RuntimeRepository";
import type { SnapshotRepository } from "../../core/persistence/repositories/SnapshotRepository";
import type { TimelineRepository } from "../../core/persistence/repositories/TimelineRepository";
import type { WorkspaceRepository } from "../../core/persistence/repositories/WorkspaceRepository";
import type { AthleteIdentityService } from "../../features/athlete-identity/services/AthleteIdentityService";
import type { AthleteSnapshotService } from "../../features/athlete-snapshot/services/AthleteSnapshotService";
import type { CoachTimelineService } from "../../features/coach-timeline/services/CoachTimelineService";
import type { RuntimeEnvironmentService } from "../../features/runtime-environment/services/RuntimeEnvironmentService";
import type { UnifiedWorkspaceService } from "../../features/unified-workspace/services/UnifiedWorkspaceService";
import { createPayloadRecord } from "../persistence/DomainRecord";
import { RuntimeWriteThroughError } from "./RuntimeWriteThroughError";

/**
 * Structural observation from runtime composition services into persistence records.
 * Attaches immutable domain payloads for repository-layer serialization.
 */
export function observeIdentityRecords(
  service: AthleteIdentityService,
  athleteIds: readonly string[],
): readonly PersistenceRecord[] {
  const records: PersistenceRecord[] = [];

  for (const athleteId of athleteIds) {
    const identity = service.getAthleteIdentity(athleteId);
    if (identity) {
      records.push(createPayloadRecord(identity.athleteId, identity));
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

  return createPayloadRecord(runtime.id, runtime);
}

export function observeWorkspaceRecords(
  service: UnifiedWorkspaceService,
  athleteIds: readonly string[],
): readonly PersistenceRecord[] {
  const records: PersistenceRecord[] = [];

  for (const athleteId of athleteIds) {
    const workspace = service.getWorkspace(athleteId);
    if (workspace) {
      records.push(createPayloadRecord(workspace.athleteId, workspace));
    }
  }

  return Object.freeze(records);
}

export function observeSnapshotRecords(
  service: AthleteSnapshotService,
  athleteIds: readonly string[],
): readonly PersistenceRecord[] {
  const records: PersistenceRecord[] = [];

  for (const athleteId of athleteIds) {
    const snapshot = service.getCurrentSnapshot(athleteId);
    if (snapshot) {
      records.push(createPayloadRecord(snapshot.id, snapshot));
    }
  }

  return Object.freeze(records);
}

export function observeTimelineRecords(
  service: CoachTimelineService,
  athleteIds: readonly string[],
): readonly PersistenceRecord[] {
  const records: PersistenceRecord[] = [];

  for (const athleteId of athleteIds) {
    const timeline = service.getTimeline(athleteId);
    if (timeline) {
      records.push(createPayloadRecord(timeline.athleteId, timeline));
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
  readonly snapshotRepository: SnapshotRepository;
  readonly timelineRepository: TimelineRepository;
  readonly identityRecords: readonly PersistenceRecord[];
  readonly runtimeRecord: PersistenceRecord | null;
  readonly workspaceRecords: readonly PersistenceRecord[];
  readonly snapshotRecords: readonly PersistenceRecord[];
  readonly timelineRecords: readonly PersistenceRecord[];
}

export interface PersistRuntimeRecordsResult {
  readonly identityRecordCount: number;
  readonly runtimeRecordCount: number;
  readonly workspaceRecordCount: number;
  readonly snapshotRecordCount: number;
  readonly timelineRecordCount: number;
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

    for (const record of input.snapshotRecords) {
      await invokeRepositorySave(
        (next) => input.snapshotRepository.save(next),
        record,
      );
    }

    for (const record of input.timelineRecords) {
      await invokeRepositorySave(
        (next) => input.timelineRepository.save(next),
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
    snapshotRecordCount: input.snapshotRecords.length,
    timelineRecordCount: input.timelineRecords.length,
  };
}
