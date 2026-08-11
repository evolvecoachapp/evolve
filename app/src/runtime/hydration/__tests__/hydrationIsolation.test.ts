import { resetCompositionRoot } from "../../../core/composition/createCompositionRoot";
import { RuntimeBootstrap, resetRuntimeBootstrap } from "../../bootstrap/RuntimeBootstrap";
import { RepositoryHydrationPipeline, resetRepositoryHydration } from "../RepositoryHydrationPipeline";
import {
  createMockRuntimeRepositories,
  createSeededHydrationRecords,
  createTestRuntimeServices,
  seedTestRuntimeDomainState,
} from "../../testSupport/runtimePersistenceFixtures";

const ATHLETE_A = "athlete:sprint36:userA";
const ATHLETE_B = "athlete:sprint36:userB";
const FIXED_CLOCK = () => "2026-08-11T10:00:00.000Z";

/**
 * Sprint 36.1 — Repository Hydration must never restore a previous
 * authenticated athlete's records into a different athlete's runtime
 * session, even though both athletes' rows physically remain in the shared
 * repository/SQLite store (retention, not deletion).
 */
describe("RepositoryHydrationPipeline — cross-athlete isolation (Sprint 36.1)", () => {
  afterEach(() => {
    resetRepositoryHydration();
    resetRuntimeBootstrap();
    resetCompositionRoot();
  });

  function seedTwoAthletesIntoRepositories() {
    const seedingServices = createTestRuntimeServices(FIXED_CLOCK);
    seedTestRuntimeDomainState(seedingServices, ATHLETE_A, FIXED_CLOCK);
    seedTestRuntimeDomainState(seedingServices, ATHLETE_B, FIXED_CLOCK);

    const recordsA = createSeededHydrationRecords(seedingServices, ATHLETE_A);
    const recordsB = createSeededHydrationRecords(seedingServices, ATHLETE_B);
    if (!recordsA || !recordsB) {
      throw new Error("Expected seeded hydration records for both athletes");
    }

    return createMockRuntimeRepositories({
      identity: Object.freeze([
        ...(recordsA.identity ?? []),
        ...(recordsB.identity ?? []),
      ]),
      runtime: recordsA.runtime,
      workspace: Object.freeze([
        ...(recordsA.workspace ?? []),
        ...(recordsB.workspace ?? []),
      ]),
      snapshot: Object.freeze([
        ...(recordsA.snapshot ?? []),
        ...(recordsB.snapshot ?? []),
      ]),
      timeline: Object.freeze([
        ...(recordsA.timeline ?? []),
        ...(recordsB.timeline ?? []),
      ]),
    });
  }

  it("restores only the requested athlete's records when both athletes are persisted", async () => {
    RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });

    const combinedRepositories = seedTwoAthletesIntoRepositories();
    const sessionServices = createTestRuntimeServices(FIXED_CLOCK);

    const result = await RepositoryHydrationPipeline.hydrate({
      athleteIds: [ATHLETE_A],
      deps: {
        ...combinedRepositories,
        ...sessionServices,
        clock: FIXED_CLOCK,
      },
    });

    expect(result.status).toBe("ready");
    expect(result.identityRecordCount).toBe(1);
    expect(result.workspaceRecordCount).toBe(1);

    expect(
      sessionServices.athleteIdentityService.getAthleteIdentity(ATHLETE_A),
    ).not.toBeNull();
    expect(
      sessionServices.athleteIdentityService.getAthleteIdentity(ATHLETE_B),
    ).toBeNull();
    expect(
      sessionServices.unifiedWorkspaceService.getWorkspace(ATHLETE_A),
    ).not.toBeNull();
    expect(
      sessionServices.unifiedWorkspaceService.getWorkspace(ATHLETE_B),
    ).toBeNull();
    expect(
      sessionServices.coachTimelineService.getTimeline(ATHLETE_B),
    ).toBeNull();
  });

  it("restores nothing for a brand-new athlete id even when other athletes have persisted history", async () => {
    RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });

    const combinedRepositories = seedTwoAthletesIntoRepositories();
    const sessionServices = createTestRuntimeServices(FIXED_CLOCK);

    const result = await RepositoryHydrationPipeline.hydrate({
      athleteIds: ["athlete:sprint36:brandNewUser"],
      deps: {
        ...combinedRepositories,
        ...sessionServices,
        clock: FIXED_CLOCK,
      },
    });

    expect(result.identityRecordCount).toBe(0);
    expect(result.workspaceRecordCount).toBe(0);
    expect(
      sessionServices.athleteIdentityService.getAthleteIdentity(
        "athlete:sprint36:brandNewUser",
      ),
    ).toBeNull();
    expect(
      sessionServices.athleteIdentityService.getAthleteIdentity(ATHLETE_A),
    ).toBeNull();
    expect(
      sessionServices.athleteIdentityService.getAthleteIdentity(ATHLETE_B),
    ).toBeNull();
  });

  it("restores nothing when athleteIds is an empty array (fail-safe default)", async () => {
    RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });

    const combinedRepositories = seedTwoAthletesIntoRepositories();
    const sessionServices = createTestRuntimeServices(FIXED_CLOCK);

    const result = await RepositoryHydrationPipeline.hydrate({
      athleteIds: [],
      deps: {
        ...combinedRepositories,
        ...sessionServices,
        clock: FIXED_CLOCK,
      },
    });

    expect(result.identityRecordCount).toBe(0);
    expect(result.workspaceRecordCount).toBe(0);
  });

  it("still restores device-level runtime environment record regardless of athlete scope", async () => {
    RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });

    const combinedRepositories = seedTwoAthletesIntoRepositories();
    const sessionServices = createTestRuntimeServices(FIXED_CLOCK);

    const result = await RepositoryHydrationPipeline.hydrate({
      athleteIds: [ATHLETE_B],
      deps: {
        ...combinedRepositories,
        ...sessionServices,
        clock: FIXED_CLOCK,
      },
    });

    expect(result.runtimeRecordCount).toBe(1);
    expect(
      sessionServices.runtimeEnvironmentService.getRuntimeEnvironment(),
    ).not.toBeNull();
  });

  it("preserves legacy unrestricted hydration for direct callers that omit athleteIds", async () => {
    RuntimeBootstrap.bootstrap({ clock: FIXED_CLOCK });

    const combinedRepositories = seedTwoAthletesIntoRepositories();
    const sessionServices = createTestRuntimeServices(FIXED_CLOCK);

    const result = await RepositoryHydrationPipeline.hydrate({
      deps: {
        ...combinedRepositories,
        ...sessionServices,
        clock: FIXED_CLOCK,
      },
    });

    expect(result.identityRecordCount).toBe(2);
    expect(
      sessionServices.athleteIdentityService.getAthleteIdentity(ATHLETE_A),
    ).not.toBeNull();
    expect(
      sessionServices.athleteIdentityService.getAthleteIdentity(ATHLETE_B),
    ).not.toBeNull();
  });
});
