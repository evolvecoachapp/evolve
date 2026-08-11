import { resetCompositionRoot } from "../../../core/composition/createCompositionRoot";
import { FIXED_DASHBOARD_ATHLETE_ID } from "../../../integrations/dashboard-projection/testSupport/fixtures";
import { RuntimeBootstrap, resetRuntimeBootstrap } from "../../bootstrap/RuntimeBootstrap";
import { resetRepositoryHydration } from "../../hydration/RepositoryHydrationPipeline";
import { resetDashboardRestore } from "../../dashboard-restore/DashboardRestorePipeline";
import {
  createTestRuntimeServices,
} from "../../testSupport/runtimePersistenceFixtures";
import { getWriteThroughStatus } from "../application";
import { RUNTIME_WRITE_THROUGH_STATUS } from "../RuntimeWriteThroughStatus";
import {
  RuntimeWriteThroughPipeline,
  resetRuntimeWriteThrough,
} from "../RuntimeWriteThroughPipeline";
import { RuntimeWriteThroughError } from "../RuntimeWriteThroughError";
import {
  createMockIdentityRepository,
  createMockRuntimeRepository,
  createMockSnapshotRepository,
  createMockTimelineRepository,
  createMockWorkspaceRepository,
} from "../testSupport/mockRepositories";
import {
  createMockNutritionRepository,
  createMockRecoveryRepository,
  createMockWorkoutRepository,
} from "../testSupport/mockDomainRepositories";
import {
  getAppliedWriteThroughSequence,
  getCurrentRuntimeMutationSequence,
  isStaleWriteThroughSequence,
  markWriteThroughSequenceApplied,
  nextRuntimeMutationSequence,
  resetRuntimeMutationSequence,
} from "../RuntimeWriteThroughSequence";

const FIXED_CLOCK = () => "2026-08-11T10:00:00.000Z";
const ATHLETE_ID = FIXED_DASHBOARD_ATHLETE_ID;

function createPersistDepsFromServices(
  services: ReturnType<typeof createTestRuntimeServices>,
) {
  return {
    ...services,
    identityRepository: createMockIdentityRepository(),
    runtimeRepository: createMockRuntimeRepository(),
    workspaceRepository: createMockWorkspaceRepository(),
    snapshotRepository: createMockSnapshotRepository(),
    timelineRepository: createMockTimelineRepository(),
    workoutRepository: createMockWorkoutRepository(),
    nutritionRepository: createMockNutritionRepository(),
    recoveryRepository: createMockRecoveryRepository(),
    clock: FIXED_CLOCK,
  };
}

/**
 * Sprint 36.5 — Persistence Consistency Guard: monotonic mutation sequence.
 * Verifies the "latest mutation always wins" guard in isolation (pure
 * counter semantics) and end-to-end through `RuntimeWriteThroughPipeline`.
 */
describe("RuntimeWriteThroughSequence — monotonic mutation sequence guard (Sprint 36.5)", () => {
  beforeEach(() => {
    resetRuntimeMutationSequence();
  });

  afterEach(() => {
    resetRuntimeMutationSequence();
    resetRuntimeWriteThrough();
    resetDashboardRestore();
    resetRepositoryHydration();
    resetRuntimeBootstrap();
    resetCompositionRoot();
  });

  describe("pure counter semantics", () => {
    it("starts at zero for both the mutation counter and the applied sequence", () => {
      expect(getCurrentRuntimeMutationSequence()).toBe(0);
      expect(getAppliedWriteThroughSequence()).toBe(0);
    });

    it("increments monotonically on every call", () => {
      expect(nextRuntimeMutationSequence()).toBe(1);
      expect(nextRuntimeMutationSequence()).toBe(2);
      expect(nextRuntimeMutationSequence()).toBe(3);
      expect(getCurrentRuntimeMutationSequence()).toBe(3);
    });

    it("treats any sequence below the applied sequence as stale", () => {
      markWriteThroughSequenceApplied(5);
      expect(isStaleWriteThroughSequence(4)).toBe(true);
      expect(isStaleWriteThroughSequence(5)).toBe(false);
      expect(isStaleWriteThroughSequence(6)).toBe(false);
    });

    it("never moves the applied sequence backwards", () => {
      markWriteThroughSequenceApplied(5);
      markWriteThroughSequenceApplied(2);
      expect(getAppliedWriteThroughSequence()).toBe(5);
    });

    it("resets both counters back to zero", () => {
      nextRuntimeMutationSequence();
      nextRuntimeMutationSequence();
      markWriteThroughSequenceApplied(2);

      resetRuntimeMutationSequence();

      expect(getCurrentRuntimeMutationSequence()).toBe(0);
      expect(getAppliedWriteThroughSequence()).toBe(0);
    });
  });

  describe("RuntimeWriteThroughPipeline.persist integration", () => {
    it("accepts sequential increasing mutation sequences", async () => {
      RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });
      const services = createTestRuntimeServices(FIXED_CLOCK);
      const deps = createPersistDepsFromServices(services);

      await RuntimeWriteThroughPipeline.persist({
        athleteIds: [ATHLETE_ID],
        mutationSequence: 1,
        deps,
      });
      resetRuntimeWriteThrough();

      await expect(
        RuntimeWriteThroughPipeline.persist({
          athleteIds: [ATHLETE_ID],
          mutationSequence: 2,
          deps,
        }),
      ).resolves.toBeDefined();

      expect(getAppliedWriteThroughSequence()).toBe(2);
    });

    it("rejects a stale mutation sequence before touching any repository (out-of-order B-then-A arrival)", async () => {
      RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });
      const services = createTestRuntimeServices(FIXED_CLOCK);
      const identityRepository = createMockIdentityRepository();
      const deps = {
        ...createPersistDepsFromServices(services),
        identityRepository,
      };

      // Mutation B (sequence 2) completes first and is applied.
      await RuntimeWriteThroughPipeline.persist({
        athleteIds: [ATHLETE_ID],
        mutationSequence: 2,
        deps,
      });
      resetRuntimeWriteThrough();

      // Mutation A (sequence 1) arrives late — must be rejected outright.
      await expect(
        RuntimeWriteThroughPipeline.persist({
          athleteIds: [ATHLETE_ID],
          mutationSequence: 1,
          deps,
        }),
      ).rejects.toMatchObject({ code: "stale_mutation_sequence" });

      await expect(
        RuntimeWriteThroughPipeline.persist({
          athleteIds: [ATHLETE_ID],
          mutationSequence: 1,
          deps,
        }),
      ).rejects.toThrow(RuntimeWriteThroughError);

      expect(getAppliedWriteThroughSequence()).toBe(2);
    });

    it("does not transition write-through status when rejecting a stale mutation sequence", async () => {
      RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });
      const services = createTestRuntimeServices(FIXED_CLOCK);
      const deps = createPersistDepsFromServices(services);

      await RuntimeWriteThroughPipeline.persist({
        athleteIds: [ATHLETE_ID],
        mutationSequence: 5,
        deps,
      });
      resetRuntimeWriteThrough();

      await expect(
        RuntimeWriteThroughPipeline.persist({
          athleteIds: [ATHLETE_ID],
          mutationSequence: 3,
          deps,
        }),
      ).rejects.toMatchObject({ code: "stale_mutation_sequence" });

      // The state holder was reset (idle) before the rejected call, and the
      // rejection short-circuits before any `persisting`/`failed` transition.
      expect(getWriteThroughStatus()).toBe(RUNTIME_WRITE_THROUGH_STATUS.idle);
    });

    it("treats an omitted mutationSequence as always acceptable (backward compatible)", async () => {
      RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });
      const services = createTestRuntimeServices(FIXED_CLOCK);
      const deps = createPersistDepsFromServices(services);

      await RuntimeWriteThroughPipeline.persist({
        athleteIds: [ATHLETE_ID],
        mutationSequence: 10,
        deps,
      });
      resetRuntimeWriteThrough();

      await expect(
        RuntimeWriteThroughPipeline.persist({
          athleteIds: [ATHLETE_ID],
          deps,
        }),
      ).resolves.toBeDefined();
    });

    it("rejects a mutation's own result when a later mutation completes first while both were concurrently in flight", async () => {
      // Reproduces the real `RuntimeObserver.triggerWriteThrough()` pattern:
      // every successful mutation resets write-through state and fires a
      // new fire-and-forget `persist()` call without waiting for a prior
      // call's repository I/O to finish, so two persist() calls can be
      // genuinely concurrent. The entry-only guard (checked once, before
      // either call has completed) cannot catch this — only a post-write
      // re-check can (Sprint 36.6).
      RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });
      const servicesA = createTestRuntimeServices(FIXED_CLOCK);
      const servicesB = createTestRuntimeServices(FIXED_CLOCK);

      // Both services need an identity record to observe/save so the
      // gated repository write below is actually exercised.
      for (const services of [servicesA, servicesB]) {
        services.athleteIdentityService.build({
          athleteId: ATHLETE_ID,
          requestId: `write-through:identity:${ATHLETE_ID}`,
          profile: {
            displayName: "Alex Rivera",
            givenName: "Alex",
            familyName: "Rivera",
            sex: "unspecified",
            birthYear: 1990,
            experienceLevel: "intermediate",
          },
          locale: { languageTag: "en-US" },
          units: { system: "metric" },
          timeZone: { iana: "Etc/UTC", displayName: "UTC" },
        });
      }

      let releaseA: () => void = () => {};
      const gateA = new Promise<void>((resolve) => {
        releaseA = resolve;
      });

      const baseIdentityRepository = createMockIdentityRepository();
      const gatedIdentityRepository = {
        ...baseIdentityRepository,
        save: async (record: Parameters<typeof baseIdentityRepository.save>[0]) => {
          await gateA;
          return baseIdentityRepository.save(record);
        },
      };

      const depsA = {
        ...createPersistDepsFromServices(servicesA),
        identityRepository: gatedIdentityRepository,
      };
      const depsB = createPersistDepsFromServices(servicesB);

      // Mutation A (sequence 1) starts first; its identity repository write
      // is gated and will not resolve until `releaseA()` is called below.
      const persistA = RuntimeWriteThroughPipeline.persist({
        athleteIds: [ATHLETE_ID],
        mutationSequence: 1,
        deps: depsA,
      });

      // Mutation B (sequence 2) starts second — mirroring
      // `triggerWriteThrough()`'s reset-before-every-persist call, which
      // reopens the pipeline's "already started" guard for an overlapping
      // call — and completes fully before A.
      resetRuntimeWriteThrough();
      await expect(
        RuntimeWriteThroughPipeline.persist({
          athleteIds: [ATHLETE_ID],
          mutationSequence: 2,
          deps: depsB,
        }),
      ).resolves.toBeDefined();

      expect(getAppliedWriteThroughSequence()).toBe(2);
      const readyStateAfterB = getWriteThroughStatus();
      expect(readyStateAfterB).toBe(RUNTIME_WRITE_THROUGH_STATUS.ready);

      // Now let A's write-through complete. Its captured mutation (1) is
      // now older than the already-applied sequence (2), so it must be
      // rejected instead of silently reporting stale data as successful.
      releaseA();
      await expect(persistA).rejects.toMatchObject({
        code: "stale_mutation_sequence",
      });

      // The applied sequence never regresses, and B's already-applied
      // "ready" result is never downgraded/overwritten by A's late,
      // stale completion.
      expect(getAppliedWriteThroughSequence()).toBe(2);
      expect(getWriteThroughStatus()).toBe(RUNTIME_WRITE_THROUGH_STATUS.ready);
    });

    it("rejects a call orphaned by a full session teardown (logout) mid-flight, even though the reset sequence counters make it look fresh", async () => {
      // The mutation-sequence guard alone cannot catch this: `RuntimeObserver
      // .stop()` (logout) calls `resetRuntimeMutationSequence()`, zeroing
      // both counters. An old in-flight call's captured sequence (e.g. 5)
      // would then look "fresh" against the new session's own low counters
      // (e.g. appliedSequence 0 or 1) even though it belongs to a torn-down
      // session for a different athlete entirely. Only the never-reset
      // session epoch (Sprint 36.6) can detect this.
      RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });
      const athleteAServices = createTestRuntimeServices(FIXED_CLOCK);
      athleteAServices.athleteIdentityService.build({
        athleteId: ATHLETE_ID,
        requestId: `write-through:identity:${ATHLETE_ID}`,
        profile: {
          displayName: "Alex Rivera",
          givenName: "Alex",
          familyName: "Rivera",
          sex: "unspecified",
          birthYear: 1990,
          experienceLevel: "intermediate",
        },
        locale: { languageTag: "en-US" },
        units: { system: "metric" },
        timeZone: { iana: "Etc/UTC", displayName: "UTC" },
      });

      let releaseOrphan: () => void = () => {};
      const gateOrphan = new Promise<void>((resolve) => {
        releaseOrphan = resolve;
      });

      const baseIdentityRepository = createMockIdentityRepository();
      const gatedIdentityRepository = {
        ...baseIdentityRepository,
        save: async (record: Parameters<typeof baseIdentityRepository.save>[0]) => {
          await gateOrphan;
          return baseIdentityRepository.save(record);
        },
      };

      const orphanDeps = {
        ...createPersistDepsFromServices(athleteAServices),
        identityRepository: gatedIdentityRepository,
      };

      // Athlete A's mutation (sequence 5, e.g. after several prior mutations
      // this session) starts persisting but is gated mid-flight.
      const orphanSequence = nextRuntimeMutationSequence();
      for (let i = 1; i < 5; i += 1) {
        nextRuntimeMutationSequence();
      }
      const orphanedPersist = RuntimeWriteThroughPipeline.persist({
        athleteIds: [ATHLETE_ID],
        mutationSequence: orphanSequence,
        deps: orphanDeps,
      });

      // Logout happens while the orphaned call is still in flight: the full
      // pipeline reset cascade runs, including the observer's session-only
      // sequence-counter reset.
      resetRuntimeWriteThrough();
      resetRuntimeMutationSequence();

      // Athlete B's new session runs its own mutation (sequence 1 again,
      // since the counters were just reset) and completes normally.
      const bServices = createTestRuntimeServices(FIXED_CLOCK);
      const bDeps = createPersistDepsFromServices(bServices);
      await expect(
        RuntimeWriteThroughPipeline.persist({
          athleteIds: ["athlete:b"],
          mutationSequence: nextRuntimeMutationSequence(),
          deps: bDeps,
        }),
      ).resolves.toBeDefined();

      expect(getAppliedWriteThroughSequence()).toBe(1);
      const readyStateAfterB = getWriteThroughStatus();
      expect(readyStateAfterB).toBe(RUNTIME_WRITE_THROUGH_STATUS.ready);

      // Now let the orphaned athlete-A call finish its I/O. Its captured
      // sequence (5) is numerically *greater* than B's freshly reset applied
      // sequence (1), so the sequence guard alone would accept it — the
      // epoch guard must reject it instead.
      releaseOrphan();
      await expect(orphanedPersist).rejects.toMatchObject({
        code: "stale_write_through_epoch",
      });

      // Athlete B's session state is completely undisturbed by the orphaned
      // athlete-A completion: no regression, no overwritten "ready" result.
      expect(getAppliedWriteThroughSequence()).toBe(1);
      expect(getWriteThroughStatus()).toBe(RUNTIME_WRITE_THROUGH_STATUS.ready);
    });

    it("advances the applied sequence only after a persist call actually succeeds", async () => {
      RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });
      const services = createTestRuntimeServices(FIXED_CLOCK);
      services.athleteIdentityService.build({
        athleteId: ATHLETE_ID,
        requestId: `write-through:identity:${ATHLETE_ID}`,
        profile: {
          displayName: "Alex Rivera",
          givenName: "Alex",
          familyName: "Rivera",
          sex: "unspecified",
          birthYear: 1990,
          experienceLevel: "intermediate",
        },
        locale: { languageTag: "en-US" },
        units: { system: "metric" },
        timeZone: { iana: "Etc/UTC", displayName: "UTC" },
      });

      await expect(
        RuntimeWriteThroughPipeline.persist({
          athleteIds: [ATHLETE_ID],
          mutationSequence: 7,
          deps: {
            ...createPersistDepsFromServices(services),
            identityRepository: createMockIdentityRepository([], {
              rejectSave: true,
            }),
          },
        }),
      ).rejects.toMatchObject({ code: "repository_contract_failed" });

      expect(getAppliedWriteThroughSequence()).toBe(0);
    });
  });
});
