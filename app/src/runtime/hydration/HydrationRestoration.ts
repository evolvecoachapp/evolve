import { getLogger } from "../../infrastructure/logging";
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
import type { CoachConversationService } from "../../features/coach-conversation/services/CoachConversationService";
import type { NutritionRuntimePersistenceState } from "../domain-persistence/models/NutritionRuntimePersistenceState";
import type { RecoveryRuntimePersistenceState } from "../domain-persistence/models/RecoveryRuntimePersistenceState";
import type { WorkoutRuntimePersistenceState } from "../domain-persistence/models/WorkoutRuntimePersistenceState";
import type { NutritionRuntimePersistenceService } from "../domain-persistence/services/NutritionRuntimePersistenceService";
import type { RecoveryRuntimePersistenceService } from "../domain-persistence/services/RecoveryRuntimePersistenceService";
import type { WorkoutRuntimePersistenceService } from "../domain-persistence/services/WorkoutRuntimePersistenceService";
import { readRecordPayload } from "../persistence/DomainRecord";
import {
  isRecordOwnedByAthlete,
  type AthleteOwnedPayload,
} from "../persistence/AthleteRecordOwnership";

/**
 * Persistence Consistency Guard (Sprint 36.5): the Authenticated Athlete
 * Persistence Boundary (Sprint 36.1) already restricted `records` to keys
 * (`record.id`) belonging to the current session's athlete id(s). This is
 * the second, independent check — verifying the payload's own `athleteId`
 * field actually matches its record key — before that payload is ever
 * restored into a composition service. Without it, a record whose payload
 * internally disagreed with its own key would silently restore a
 * *different* athlete's data under the current session's identity. A
 * mismatch is skipped and logged rather than restored.
 */
function logHydrationOwnershipMismatch(
  domain: string,
  recordId: string,
  actualAthleteId: string,
): void {
  getLogger().warn(
    "Skipped hydration restore for a record owned by a mismatched athlete",
    {
      scope: "Application",
      reason: `${domain} record "${recordId}" carries payload athleteId "${actualAthleteId}" — refusing to restore under a different key`,
    },
  );
}

function verifiedOwnedRecordPayload<T extends AthleteOwnedPayload>(
  domain: string,
  record: PersistenceRecord,
  payload: T | null,
): T | null {
  if (!payload) {
    return null;
  }

  if (!isRecordOwnedByAthlete(record, payload)) {
    logHydrationOwnershipMismatch(domain, record.id, payload.athleteId);
    return null;
  }

  return payload;
}

/**
 * Structural restoration from repository contract records into composition services.
 * Uses deserialized immutable domain payloads restored by repository mappers.
 */
export function restoreIdentityRecords(
  service: AthleteIdentityService,
  records: readonly PersistenceRecord[],
): void {
  for (const record of records) {
    const identity = verifiedOwnedRecordPayload(
      "identity",
      record,
      readRecordPayload<AthleteIdentity>(record),
    );
    if (!identity) {
      continue;
    }

    // Sprint 36.6: restore the persisted identity verbatim via
    // `restorePersisted()` rather than `build()` — `build()` always
    // regenerates `id`/`createdAt`/`metadata` from a fresh hydration
    // `requestId`/clock reading, which previously discarded those fields
    // on every restart even though `profile`/`preferences`/`settings`/
    // `locale`/`units`/`timeZone` survived.
    service.restorePersisted(identity);
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
    const workspace = verifiedOwnedRecordPayload(
      "workspace",
      record,
      readRecordPayload<Workspace>(record),
    );
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
    const state = verifiedOwnedRecordPayload(
      "workout",
      record,
      readRecordPayload<WorkoutRuntimePersistenceState>(record),
    );
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
    const state = verifiedOwnedRecordPayload(
      "nutrition",
      record,
      readRecordPayload<NutritionRuntimePersistenceState>(record),
    );
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
    const state = verifiedOwnedRecordPayload(
      "recovery",
      record,
      readRecordPayload<RecoveryRuntimePersistenceState>(record),
    );
    if (state) {
      service.restorePersisted(state);
    }
  }
}

export function restoreSnapshotRecords(
  service: AthleteSnapshotService,
  records: readonly PersistenceRecord[],
): void {
  // Snapshot records are keyed by the snapshot's own composite `id`
  // (`athlete-snapshot:${athleteId}:${createdAt}`, see `buildIdentity.ts`),
  // not by `athleteId` directly (unlike every other athlete-scoped record
  // — see `observeSnapshotRecords`). The `record.id === payload.athleteId`
  // ownership check used elsewhere in this module does not apply to this
  // keying convention and is intentionally not used here.
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
    const timeline = verifiedOwnedRecordPayload(
      "timeline",
      record,
      readRecordPayload<CoachTimeline>(record),
    );
    if (timeline) {
      service.restorePersisted(timeline);
    }
  }
}

export function restoreCoachRuntimeOverlayFromWorkspace(
  coachConversationService: CoachConversationService,
  workspaceRecords: readonly PersistenceRecord[],
): void {
  for (const record of workspaceRecords) {
    const workspace = verifiedOwnedRecordPayload(
      "workspace",
      record,
      readRecordPayload<Workspace>(record),
    );
    const overlay = workspace?.coachRuntimeOverlay;
    if (!overlay || overlay.memoryEntries.length === 0) {
      continue;
    }

    coachConversationService
      .getMemory()
      .restorePersistedEntries(overlay.memoryEntries);
  }
}
