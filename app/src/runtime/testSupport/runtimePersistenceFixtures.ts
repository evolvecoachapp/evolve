import { createAthleteIdentityService } from "../../features/athlete-identity/services/AthleteIdentityService";
import { createMinimalIdentityInput } from "../../features/athlete-identity/testSupport/fixtures";
import { createAthleteSnapshotService } from "../../features/athlete-snapshot/services/AthleteSnapshotService";
import { createCoachTimelineService } from "../../features/coach-timeline/services/CoachTimelineService";
import { createTestCoachConversationService } from "../../features/coach-conversation/testSupport/fixtures";
import type { CoachConversationService } from "../../features/coach-conversation/services/CoachConversationService";
import { createTimelineEntryRequest } from "../../features/coach-timeline/testSupport/fixtures";
import { createRuntimeEnvironmentService } from "../../features/runtime-environment/services/RuntimeEnvironmentService";
import { createMinimalRuntimeInput } from "../../features/runtime-environment/testSupport/fixtures";
import { createUnifiedWorkspaceService } from "../../features/unified-workspace/services/UnifiedWorkspaceService";
import { composeTestWorkspaceForAthlete } from "../../integrations/dashboard-projection/testSupport/fixtures";
import { createStubAthleteSnapshot } from "../../features/unified-workspace/testSupport/fixtures";
import {
  createNutritionRuntimePersistenceService,
  createRecoveryRuntimePersistenceService,
  createWorkoutRuntimePersistenceService,
} from "../domain-persistence/services";
import type { RepositoryHydrationDeps } from "../hydration/RepositoryHydrationPipeline";
import type { RuntimeWriteThroughDeps } from "../write-through/RuntimeWriteThroughPipeline";
import {
  createMockIdentityRepository,
  createMockRuntimeRepository,
  createMockSnapshotRepository,
  createMockTimelineRepository,
  createMockWorkspaceRepository,
  createPayloadRecord,
} from "../write-through/testSupport/mockRepositories";
import {
  createMockNutritionRepository,
  createMockRecoveryRepository,
  createMockWorkoutRepository,
} from "../write-through/testSupport/mockDomainRepositories";

const FIXED_CLOCK = () => "2026-08-10T10:00:01.000Z";

export function createTestRuntimeServices(clock = FIXED_CLOCK) {
  const athleteIdentityService = createAthleteIdentityService({ clock });
  const runtimeEnvironmentService = createRuntimeEnvironmentService({ clock });
  const coachTimelineService = createCoachTimelineService({ clock });
  const coachConversationService: CoachConversationService =
    createTestCoachConversationService({
      clock,
      coachTimeline: coachTimelineService,
    });
  const athleteSnapshotService = createAthleteSnapshotService({
    clock,
    coachTimeline: coachTimelineService,
  });
  const unifiedWorkspaceService = createUnifiedWorkspaceService({
    clock,
    coachTimeline: coachTimelineService,
    athleteSnapshot: athleteSnapshotService,
  });
  const workoutRuntimePersistenceService = createWorkoutRuntimePersistenceService();
  const nutritionRuntimePersistenceService = createNutritionRuntimePersistenceService();
  const recoveryRuntimePersistenceService = createRecoveryRuntimePersistenceService();

  return {
    athleteIdentityService,
    runtimeEnvironmentService,
    unifiedWorkspaceService,
    athleteSnapshotService,
    coachTimelineService,
    coachConversationService,
    workoutRuntimePersistenceService,
    nutritionRuntimePersistenceService,
    recoveryRuntimePersistenceService,
  };
}

export function seedTestRuntimeDomainState(
  services: ReturnType<typeof createTestRuntimeServices>,
  athleteId = "athlete:1",
  clock = FIXED_CLOCK,
) {
  const identityResult = services.athleteIdentityService.build(
    createMinimalIdentityInput({
      athleteId,
      requestId: `test:identity:${athleteId}`,
      generatedAt: clock(),
    }),
  );
  const runtimeResult = services.runtimeEnvironmentService.build(
    createMinimalRuntimeInput({
      requestId: "test:runtime:1",
      generatedAt: clock(),
    }),
  );
  composeTestWorkspaceForAthlete(
    services.unifiedWorkspaceService,
    athleteId,
  );
  coachTimelineServiceAppend(services.coachTimelineService, athleteId, clock);

  return {
    identity: identityResult.identity,
    runtime: runtimeResult.runtime,
    workspace: services.unifiedWorkspaceService.getWorkspace(athleteId),
    snapshot: services.athleteSnapshotService.getCurrentSnapshot(athleteId),
    timeline: services.coachTimelineService.getTimeline(athleteId),
  };
}

function coachTimelineServiceAppend(
  service: ReturnType<typeof createTestRuntimeServices>["coachTimelineService"],
  athleteId: string,
  clock: () => string,
) {
  service.appendEntry(
    createTimelineEntryRequest({
      id: `timeline:${athleteId}:1`,
      athleteId,
      createdAt: clock(),
    }),
  );
}

export function createSeededHydrationRecords(
  services: ReturnType<typeof createTestRuntimeServices>,
  athleteId = "athlete:1",
): Parameters<typeof createMockRuntimeRepositories>[0] {
  const identity = services.athleteIdentityService.getAthleteIdentity(athleteId);
  const runtime = services.runtimeEnvironmentService.getRuntimeEnvironment();
  const workspace = services.unifiedWorkspaceService.getWorkspace(athleteId);
  const snapshot = services.athleteSnapshotService.getCurrentSnapshot(athleteId);
  const timeline = services.coachTimelineService.getTimeline(athleteId);

  return {
    identity: identity
      ? Object.freeze([createPayloadRecord(identity.athleteId, identity)])
      : Object.freeze([]),
    runtime: runtime
      ? Object.freeze([createPayloadRecord(runtime.id, runtime)])
      : Object.freeze([]),
    workspace: workspace
      ? Object.freeze([createPayloadRecord(workspace.athleteId, workspace)])
      : Object.freeze([]),
    snapshot: snapshot
      ? Object.freeze([createPayloadRecord(snapshot.id, snapshot)])
      : Object.freeze([]),
    timeline: timeline
      ? Object.freeze([createPayloadRecord(timeline.athleteId, timeline)])
      : Object.freeze([]),
  };
}

export function createMockRuntimeRepositories(
  records: {
    readonly identity?: readonly import("../../core/persistence/contracts/PersistenceRecord").PersistenceRecord[];
    readonly runtime?: readonly import("../../core/persistence/contracts/PersistenceRecord").PersistenceRecord[];
    readonly workspace?: readonly import("../../core/persistence/contracts/PersistenceRecord").PersistenceRecord[];
    readonly snapshot?: readonly import("../../core/persistence/contracts/PersistenceRecord").PersistenceRecord[];
    readonly timeline?: readonly import("../../core/persistence/contracts/PersistenceRecord").PersistenceRecord[];
    readonly workout?: readonly import("../../core/persistence/contracts/PersistenceRecord").PersistenceRecord[];
    readonly nutrition?: readonly import("../../core/persistence/contracts/PersistenceRecord").PersistenceRecord[];
    readonly recovery?: readonly import("../../core/persistence/contracts/PersistenceRecord").PersistenceRecord[];
  } = {},
) {
  return {
    identityRepository: createMockIdentityRepository(records.identity ?? []),
    runtimeRepository: createMockRuntimeRepository(records.runtime ?? []),
    workspaceRepository: createMockWorkspaceRepository(records.workspace ?? []),
    snapshotRepository: createMockSnapshotRepository(records.snapshot ?? []),
    timelineRepository: createMockTimelineRepository(records.timeline ?? []),
    workoutRepository: createMockWorkoutRepository(records.workout ?? []),
    nutritionRepository: createMockNutritionRepository(records.nutrition ?? []),
    recoveryRepository: createMockRecoveryRepository(records.recovery ?? []),
  };
}

export function createHydrationTestDeps(
  records: Parameters<typeof createMockRuntimeRepositories>[0] = {},
  clock = FIXED_CLOCK,
): RepositoryHydrationDeps {
  const services = createTestRuntimeServices(clock);
  return {
    ...createMockRuntimeRepositories(records),
    ...services,
    clock,
  };
}

export function createWriteThroughTestDeps(
  clock = FIXED_CLOCK,
): RuntimeWriteThroughDeps {
  const services = createTestRuntimeServices(clock);
  return {
    ...createMockRuntimeRepositories(),
    ...services,
    clock,
  };
}

export { createStubAthleteSnapshot };
