import {
  getCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import { resetNativeSQLiteTestState } from "../../../infrastructure/sqlite/testSupport/resetNativeSQLiteTestState";
import { composeTestWorkspaceForAthlete } from "../../../integrations/dashboard-projection/testSupport/fixtures";
import { resetRuntimeBootstrap } from "../../bootstrap/RuntimeBootstrap";
import { resetDashboardRestore } from "../../dashboard-restore/DashboardRestorePipeline";
import { resetRepositoryHydration } from "../../hydration/RepositoryHydrationPipeline";
import { observeRuntime } from "../../runtime-observer/application/observeRuntime";
import { getRuntimeObserverStatus } from "../../runtime-observer/application/getRuntimeObserverStatus";
import { RUNTIME_OBSERVER_STATUS } from "../../runtime-observer/RuntimeObserverStatus";
import { resetRuntimeObserver } from "../../runtime-observer/RuntimeObserver";
import {
  getRuntimeWriteThroughPromise,
  resetRuntimeWriteThrough,
} from "../../write-through/RuntimeWriteThroughPipeline";
import { getWriteThroughStatus } from "../../write-through/application/getWriteThroughStatus";
import { RUNTIME_WRITE_THROUGH_STATUS } from "../../write-through/RuntimeWriteThroughStatus";
import { resetRuntimeSession } from "../RuntimeSessionOrchestrator";
import { startRuntimeSession } from "../application/startRuntimeSession";
import { resetRuntimeSessionForTests } from "../RuntimeSessionContext";
import { RUNTIME_SESSION_STATUS } from "../RuntimeSessionStatus";
import { getRuntimeSessionStatus } from "../application/getRuntimeSessionStatus";

const ATHLETE_A = "athlete:sprint36:userA";
const ATHLETE_B = "athlete:sprint36:userB";
const FIXED_CLOCK = () => "2026-08-11T10:00:00.000Z";

/**
 * Mirrors `RuntimeSessionProvider`'s deterministic logout sequence exactly
 * (stop observer → reset session/hydration/dashboard-restore → reset
 * Composition Root) without touching the underlying SQLite file — this is
 * the real-world equivalent of a user logging out on-device: the app's
 * in-memory runtime is fully torn down, but persisted data is retained.
 */
function simulateLogout(): void {
  resetRuntimeSessionForTests();
}

/** Full device wipe — only used at the very end of a test for cleanliness. */
function resetEverythingIncludingDatabase(): void {
  resetRuntimeObserver();
  resetRuntimeSession();
  resetRepositoryHydration();
  resetDashboardRestore();
  resetRuntimeWriteThrough();
  resetRuntimeBootstrap();
  resetCompositionRoot();
  resetNativeSQLiteTestState();
}

async function flushMicrotasks(count = 5): Promise<void> {
  for (let index = 0; index < count; index += 1) {
    await Promise.resolve();
  }
}

async function waitForWriteThrough(): Promise<void> {
  for (let index = 0; index < 50; index += 1) {
    const inFlight = getRuntimeWriteThroughPromise();
    if (inFlight) {
      await inFlight.catch(() => undefined);
    }
    if (getWriteThroughStatus() === RUNTIME_WRITE_THROUGH_STATUS.ready) {
      return;
    }
    await Promise.resolve();
  }
  throw new Error("Write-through did not reach ready state");
}

async function loginAndPersistIdentity(
  athleteId: string,
  displayName: string,
) {
  const session = await startRuntimeSession({
    athleteIds: [athleteId],
    clock: FIXED_CLOCK,
  });
  observeRuntime({ athleteIds: [athleteId], clock: FIXED_CLOCK });

  const root = getCompositionRoot();
  root.resolve("AthleteIdentityService").build({
    athleteId,
    requestId: `isolation:identity:${athleteId}`,
    profile: {
      displayName,
      givenName: displayName,
      familyName: "Athlete",
      sex: "unspecified",
      birthYear: 1990,
      experienceLevel: "intermediate",
    },
    locale: { languageTag: "en-US" },
    units: { system: "metric" },
    timeZone: { iana: "Etc/UTC", displayName: "UTC" },
  });
  await flushMicrotasks();

  root.resolve("UnifiedWorkspaceService").build({
    athleteId,
    requestId: `isolation:workspace:${athleteId}`,
  });
  composeTestWorkspaceForAthlete(root.resolve("UnifiedWorkspaceService"), athleteId);
  await flushMicrotasks();

  await waitForWriteThrough();

  return session;
}

describe("Cross-athlete SQLite persistence isolation (Sprint 36.1)", () => {
  afterEach(() => {
    resetEverythingIncludingDatabase();
  });

  it("persists User A's data, then hides it from User B after logout while retaining the row on disk", async () => {
    await loginAndPersistIdentity(ATHLETE_A, "Alex");

    const rootA = getCompositionRoot();
    expect(
      rootA.resolve("AthleteIdentityService").getAthleteIdentity(ATHLETE_A)
        ?.profile.displayName,
    ).toBe("Alex");

    const adaptersBeforeLogout = rootA.resolve("RepositoryAdapters");
    expect(
      adaptersBeforeLogout.identity
        .list()
        .some((record) => record.id === ATHLETE_A),
    ).toBe(true);

    // ── Logout ──────────────────────────────────────────────────────────
    simulateLogout();
    expect(getRuntimeSessionStatus()).toBe(RUNTIME_SESSION_STATUS.idle);
    expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.idle);

    // ── User B logs in ──────────────────────────────────────────────────
    const sessionB = await startRuntimeSession({
      athleteIds: [ATHLETE_B],
      clock: FIXED_CLOCK,
    });

    expect(sessionB.status).toBe("ready");
    expect(sessionB.hydration.identityRecordCount).toBe(0);

    const rootB = getCompositionRoot();
    expect(rootB).not.toBe(rootA);
    expect(
      rootB.resolve("AthleteIdentityService").getAthleteIdentity(ATHLETE_A),
    ).toBeNull();
    expect(
      rootB.resolve("AthleteIdentityService").getAthleteIdentity(ATHLETE_B),
    ).toBeNull();
    expect(
      rootB.resolve("UnifiedWorkspaceService").getWorkspace(ATHLETE_A),
    ).toBeNull();

    // Retention policy: the previous athlete's row is still on disk — logout
    // does not destroy persisted data — it simply is never hydrated into a
    // different athlete's session.
    const adaptersAfterLogin = rootB.resolve("RepositoryAdapters");
    expect(
      adaptersAfterLogin.identity
        .list()
        .some((record) => record.id === ATHLETE_A),
    ).toBe(true);
  });

  it("keeps User B's own persisted data isolated from User A's session data", async () => {
    await loginAndPersistIdentity(ATHLETE_A, "Alex");
    simulateLogout();

    await loginAndPersistIdentity(ATHLETE_B, "Bailey");
    const rootB = getCompositionRoot();
    expect(
      rootB.resolve("AthleteIdentityService").getAthleteIdentity(ATHLETE_B)
        ?.profile.displayName,
    ).toBe("Bailey");
    expect(
      rootB.resolve("AthleteIdentityService").getAthleteIdentity(ATHLETE_A),
    ).toBeNull();
  });

  it("restores only User A's own data when User A logs back in after User B has used the device", async () => {
    await loginAndPersistIdentity(ATHLETE_A, "Alex");
    simulateLogout();

    await loginAndPersistIdentity(ATHLETE_B, "Bailey");
    simulateLogout();

    const sessionA = await startRuntimeSession({
      athleteIds: [ATHLETE_A],
      clock: FIXED_CLOCK,
    });

    expect(sessionA.hydration.identityRecordCount).toBe(1);

    const rootA2 = getCompositionRoot();
    expect(
      rootA2.resolve("AthleteIdentityService").getAthleteIdentity(ATHLETE_A)
        ?.profile.displayName,
    ).toBe("Alex");
    expect(
      rootA2.resolve("AthleteIdentityService").getAthleteIdentity(ATHLETE_B),
    ).toBeNull();
    expect(
      rootA2.resolve("UnifiedWorkspaceService").getWorkspace(ATHLETE_B),
    ).toBeNull();
  });

  it("stops the runtime observer on logout so no further writes occur under the previous athlete", async () => {
    await loginAndPersistIdentity(ATHLETE_A, "Alex");
    expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.ready);

    simulateLogout();

    expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.idle);
  });

  it("returns an empty runtime for a brand-new athlete id even though other athletes have persisted history", async () => {
    await loginAndPersistIdentity(ATHLETE_A, "Alex");
    simulateLogout();

    const brandNewAthleteId = "athlete:sprint36:brandNewUser";
    const sessionNew = await startRuntimeSession({
      athleteIds: [brandNewAthleteId],
      clock: FIXED_CLOCK,
    });

    expect(sessionNew.hydration.identityRecordCount).toBe(0);
    const root = getCompositionRoot();
    expect(
      root.resolve("AthleteIdentityService").getAthleteIdentity(brandNewAthleteId),
    ).toBeNull();
    expect(
      root.resolve("AthleteIdentityService").getAthleteIdentity(ATHLETE_A),
    ).toBeNull();
  });

  it("does not reuse a stale athlete id across a logout/login cycle", async () => {
    const sessionA = await loginAndPersistIdentity(ATHLETE_A, "Alex");
    expect(sessionA.dashboardRestore.athleteCount).toBe(1);

    simulateLogout();

    const sessionB = await startRuntimeSession({
      athleteIds: [ATHLETE_B],
      clock: FIXED_CLOCK,
    });

    // Dashboard restore for User B must reflect only User B's athlete id —
    // never a stale reference to User A's id from the prior session.
    expect(sessionB.dashboardRestore.athleteCount).toBe(1);
    const rootB = getCompositionRoot();
    expect(
      rootB.resolve("UnifiedWorkspaceService").getWorkspace(ATHLETE_B),
    ).toBeNull();
  });
});
