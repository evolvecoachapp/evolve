import type { PersistenceRecord } from "../../core/persistence/contracts/PersistenceRecord";
import type { AthleteIdentity } from "../../features/athlete-identity/models/AthleteIdentity";
import type { AthleteIdentityService } from "../../features/athlete-identity/services/AthleteIdentityService";
import type { AthleteSnapshot } from "../../features/athlete-snapshot/models/AthleteSnapshot";
import type { AthleteSnapshotService } from "../../features/athlete-snapshot/services/AthleteSnapshotService";
import type { CoachTimeline } from "../../features/coach-timeline/models/CoachTimeline";
import type { CoachTimelineService } from "../../features/coach-timeline/services/CoachTimelineService";
import type { RuntimeEnvironment } from "../../features/runtime-environment/models/RuntimeEnvironment";
import type { RuntimeEnvironmentService } from "../../features/runtime-environment/services/RuntimeEnvironmentService";
import type { Workspace } from "../../features/unified-workspace/models/Workspace";
import type { UnifiedWorkspaceService } from "../../features/unified-workspace/services/UnifiedWorkspaceService";
import type { NutritionRuntimePersistenceState } from "../domain-persistence/models/NutritionRuntimePersistenceState";
import type { RecoveryRuntimePersistenceState } from "../domain-persistence/models/RecoveryRuntimePersistenceState";
import type { WorkoutRuntimePersistenceState } from "../domain-persistence/models/WorkoutRuntimePersistenceState";
import type { NutritionRuntimePersistenceService } from "../domain-persistence/services/NutritionRuntimePersistenceService";
import type { RecoveryRuntimePersistenceService } from "../domain-persistence/services/RecoveryRuntimePersistenceService";
import type { WorkoutRuntimePersistenceService } from "../domain-persistence/services/WorkoutRuntimePersistenceService";
import { readRecordPayload } from "../persistence/DomainRecord";

/**
 * Structural restoration from repository contract records into composition services.
 * Uses deserialized immutable domain payloads restored by repository mappers.
 */
export function restoreIdentityRecords(
  service: AthleteIdentityService,
  records: readonly PersistenceRecord[],
  generatedAt: string,
): void {
  for (const record of records) {
    const identity = readRecordPayload<AthleteIdentity>(record);
    if (!identity) {
      continue;
    }

    service.build({
      athleteId: identity.athleteId,
      requestId: `hydration:identity:${record.id}`,
      generatedAt,
      profile: identity.profile,
      preferences: identity.preferences,
      settings: identity.settings,
      locale: identity.locale,
      units: identity.units,
      timeZone: identity.timeZone,
    });
  }
}

export function restoreRuntimeRecords(
  service: RuntimeEnvironmentService,
  records: readonly PersistenceRecord[],
  generatedAt: string,
): void {
  if (records.length === 0) {
    return;
  }

  const record = records[0];
  const runtime = readRecordPayload<RuntimeEnvironment>(record);
  if (!runtime) {
    return;
  }

  service.build({
    requestId: `hydration:runtime:${record.id}`,
    generatedAt,
    device: runtime.device,
    platform: runtime.platform,
    application: runtime.application,
    capabilities: runtime.capabilities,
    featureSupport: runtime.featureSupport,
    locale: runtime.locale,
    connectivity: runtime.connectivity,
  });
}

export function restoreWorkspaceRecords(
  service: UnifiedWorkspaceService,
  records: readonly PersistenceRecord[],
): void {
  for (const record of records) {
    const workspace = readRecordPayload<Workspace>(record);
    if (workspace) {
      service.restorePersisted(workspace);
    }
  }
}

export function restoreWorkoutRuntimeRecords(
  service: WorkoutRuntimePersistenceService,
  records: readonly PersistenceRecord[],
): void {
  for (const record of records) {
    const state = readRecordPayload<WorkoutRuntimePersistenceState>(record);
    if (state) {
      service.restorePersisted(state);
    }
  }
}

export function restoreNutritionRuntimeRecords(
  service: NutritionRuntimePersistenceService,
  records: readonly PersistenceRecord[],
): void {
  for (const record of records) {
    const state = readRecordPayload<NutritionRuntimePersistenceState>(record);
    if (state) {
      service.restorePersisted(state);
    }
  }
}

export function restoreRecoveryRuntimeRecords(
  service: RecoveryRuntimePersistenceService,
  records: readonly PersistenceRecord[],
): void {
  for (const record of records) {
    const state = readRecordPayload<RecoveryRuntimePersistenceState>(record);
    if (state) {
      service.restorePersisted(state);
    }
  }
}

export function restoreSnapshotRecords(
  service: AthleteSnapshotService,
  records: readonly PersistenceRecord[],
): void {
  for (const record of records) {
    const snapshot = readRecordPayload<AthleteSnapshot>(record);
    if (snapshot) {
      service.restorePersisted(snapshot);
    }
  }
}

export function restoreTimelineRecords(
  service: CoachTimelineService,
  records: readonly PersistenceRecord[],
): void {
  for (const record of records) {
    const timeline = readRecordPayload<CoachTimeline>(record);
    if (timeline) {
      service.restorePersisted(timeline);
    }
  }
}
