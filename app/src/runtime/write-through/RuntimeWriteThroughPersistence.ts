import { getLogger } from "../../infrastructure/logging";
import type { PersistenceRecord } from "../../core/persistence/contracts/PersistenceRecord";
import type { IdentityRepository } from "../../core/persistence/repositories/IdentityRepository";
import type { NutritionRepository } from "../../core/persistence/repositories/NutritionRepository";
import type { RecoveryRepository } from "../../core/persistence/repositories/RecoveryRepository";
import type { RuntimeRepository } from "../../core/persistence/repositories/RuntimeRepository";
import type { SnapshotRepository } from "../../core/persistence/repositories/SnapshotRepository";
import type { TimelineRepository } from "../../core/persistence/repositories/TimelineRepository";
import type { WorkoutRepository } from "../../core/persistence/repositories/WorkoutRepository";
import type { WorkspaceRepository } from "../../core/persistence/repositories/WorkspaceRepository";
import type { AthleteIdentityService } from "../../features/athlete-identity/services/AthleteIdentityService";
import type { AthleteSnapshotService } from "../../features/athlete-snapshot/services/AthleteSnapshotService";
import type { CoachTimelineService } from "../../features/coach-timeline/services/CoachTimelineService";
import type { RuntimeEnvironmentService } from "../../features/runtime-environment/services/RuntimeEnvironmentService";
import type { UnifiedWorkspaceService } from "../../features/unified-workspace/services/UnifiedWorkspaceService";
import type { NutritionRuntimePersistenceService } from "../domain-persistence/services/NutritionRuntimePersistenceService";
import type { RecoveryRuntimePersistenceService } from "../domain-persistence/services/RecoveryRuntimePersistenceService";
import type { WorkoutRuntimePersistenceService } from "../domain-persistence/services/WorkoutRuntimePersistenceService";
import { createPayloadRecord } from "../persistence/DomainRecord";
import {
  isOwnedByAthlete,
  type AthleteOwnedPayload,
} from "../persistence/AthleteRecordOwnership";
import { RuntimeWriteThroughError } from "./RuntimeWriteThroughError";

/**
 * Persistence Consistency Guard (Sprint 36.5): the authenticated athlete id
 * being persisted for (`expectedAthleteId`, always the loop variable over
 * `athleteIds` — never read back from the payload) must match the
 * payload's own `athleteId` field before it is ever written to a
 * persistence record. A mismatch is skipped and logged rather than
 * persisted under the wrong key.
 */
function logOwnershipMismatch(
  domain: string,
  expectedAthleteId: string,
  actualAthleteId: string,
): void {
  getLogger().warn(
    "Skipped write-through persistence for a record owned by a mismatched athlete",
    {
      scope: "Application",
      reason: `${domain} payload athleteId "${actualAthleteId}" does not match authenticated athlete "${expectedAthleteId}"`,
    },
  );
}

function verifiedOwnedPayload<T extends AthleteOwnedPayload>(
  domain: string,
  payload: T | null,
  expectedAthleteId: string,
): T | null {
  if (!payload) {
    return null;
  }

  if (!isOwnedByAthlete(payload, expectedAthleteId)) {
    logOwnershipMismatch(domain, expectedAthleteId, payload.athleteId);
    return null;
  }

  return payload;
}

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
    const identity = verifiedOwnedPayload(
      "identity",
      service.getAthleteIdentity(athleteId),
      athleteId,
    );
    if (identity) {
      records.push(createPayloadRecord(athleteId, identity));
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
    const workspace = verifiedOwnedPayload(
      "workspace",
      service.getWorkspace(athleteId),
      athleteId,
    );
    if (workspace) {
      records.push(createPayloadRecord(athleteId, workspace));
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
    const snapshot = verifiedOwnedPayload(
      "snapshot",
      service.getCurrentSnapshot(athleteId),
      athleteId,
    );
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
    const timeline = verifiedOwnedPayload(
      "timeline",
      service.getTimeline(athleteId),
      athleteId,
    );
    if (timeline) {
      records.push(createPayloadRecord(athleteId, timeline));
    }
  }

  return Object.freeze(records);
}

export function observeWorkoutRuntimeRecords(
  service: WorkoutRuntimePersistenceService,
  athleteIds: readonly string[],
): readonly PersistenceRecord[] {
  const records: PersistenceRecord[] = [];

  for (const athleteId of athleteIds) {
    const state = verifiedOwnedPayload(
      "workout",
      service.getState(athleteId),
      athleteId,
    );
    if (state) {
      records.push(createPayloadRecord(athleteId, state));
    }
  }

  return Object.freeze(records);
}

export function observeNutritionRuntimeRecords(
  service: NutritionRuntimePersistenceService,
  athleteIds: readonly string[],
): readonly PersistenceRecord[] {
  const records: PersistenceRecord[] = [];

  for (const athleteId of athleteIds) {
    const state = verifiedOwnedPayload(
      "nutrition",
      service.getState(athleteId),
      athleteId,
    );
    if (state) {
      records.push(createPayloadRecord(athleteId, state));
    }
  }

  return Object.freeze(records);
}

export function observeRecoveryRuntimeRecords(
  service: RecoveryRuntimePersistenceService,
  athleteIds: readonly string[],
): readonly PersistenceRecord[] {
  const records: PersistenceRecord[] = [];

  for (const athleteId of athleteIds) {
    const state = verifiedOwnedPayload(
      "recovery",
      service.getState(athleteId),
      athleteId,
    );
    if (state) {
      records.push(createPayloadRecord(athleteId, state));
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
  readonly workoutRepository: WorkoutRepository;
  readonly nutritionRepository: NutritionRepository;
  readonly recoveryRepository: RecoveryRepository;
  readonly identityRecords: readonly PersistenceRecord[];
  readonly runtimeRecord: PersistenceRecord | null;
  readonly workspaceRecords: readonly PersistenceRecord[];
  readonly snapshotRecords: readonly PersistenceRecord[];
  readonly timelineRecords: readonly PersistenceRecord[];
  readonly workoutRecords: readonly PersistenceRecord[];
  readonly nutritionRecords: readonly PersistenceRecord[];
  readonly recoveryRecords: readonly PersistenceRecord[];
}

export interface PersistRuntimeRecordsResult {
  readonly identityRecordCount: number;
  readonly runtimeRecordCount: number;
  readonly workspaceRecordCount: number;
  readonly snapshotRecordCount: number;
  readonly timelineRecordCount: number;
  readonly workoutRecordCount: number;
  readonly nutritionRecordCount: number;
  readonly recoveryRecordCount: number;
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

    for (const record of input.workoutRecords) {
      await invokeRepositorySave(
        (next) => input.workoutRepository.save(next),
        record,
      );
    }

    for (const record of input.nutritionRecords) {
      await invokeRepositorySave(
        (next) => input.nutritionRepository.save(next),
        record,
      );
    }

    for (const record of input.recoveryRecords) {
      await invokeRepositorySave(
        (next) => input.recoveryRepository.save(next),
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
    workoutRecordCount: input.workoutRecords.length,
    nutritionRecordCount: input.nutritionRecords.length,
    recoveryRecordCount: input.recoveryRecords.length,
  };
}
