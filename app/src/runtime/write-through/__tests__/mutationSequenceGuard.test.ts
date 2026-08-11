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
