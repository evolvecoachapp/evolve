import { act, render, waitFor } from "@testing-library/react-native";
import { Text, View } from "react-native";
import * as authApi from "../../../api/auth";
import type { UserPublic } from "../../../types/api";
import { AuthProvider } from "../../../auth/AuthContext";
import { useAuth } from "../../../auth/useAuth";
import * as secureStorage from "../../../auth/secureStorage";
import {
  getCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";

import { resetRuntimeBootstrap } from "../../bootstrap/RuntimeBootstrap";
import { getBootstrapStatus } from "../../bootstrap/application/getBootstrapStatus";
import { BOOTSTRAP_STATUS } from "../../bootstrap/BootstrapStatus";

import { resetRepositoryHydration } from "../../hydration/RepositoryHydrationPipeline";
import { getHydrationStatus } from "../../hydration/application/getHydrationStatus";
import { HYDRATION_STATUS } from "../../hydration/HydrationStatus";

import { resetDashboardRestore } from "../../dashboard-restore/DashboardRestorePipeline";
import { getDashboardRestoreStatus } from "../../dashboard-restore/application/getDashboardRestoreStatus";
import { DASHBOARD_RESTORE_STATUS } from "../../dashboard-restore/DashboardRestoreStatus";

import {
  getRuntimeWriteThroughPromise,
  resetRuntimeWriteThrough,
} from "../../write-through/RuntimeWriteThroughPipeline";
import { getWriteThroughStatus } from "../../write-through/application/getWriteThroughStatus";
import { RUNTIME_WRITE_THROUGH_STATUS } from "../../write-through/RuntimeWriteThroughStatus";

import { resetRuntimeObserver } from "../../runtime-observer/RuntimeObserver";
import { getRuntimeObserverStatus } from "../../runtime-observer/application/getRuntimeObserverStatus";
import { RUNTIME_OBSERVER_STATUS } from "../../runtime-observer/RuntimeObserverStatus";

import { RUNTIME_SESSION_STATUS } from "../RuntimeSessionStatus";
import { getRuntimeSessionStatus } from "../application/getRuntimeSessionStatus";
import {
  RuntimeSessionProvider,
  resetRuntimeSessionForTests,
  useRuntimeSession,
} from "../RuntimeSessionContext";

jest.mock("../../../api/auth");
jest.mock("../../../auth/secureStorage");

const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;
const mockedSecureStorage = secureStorage as jest.Mocked<typeof secureStorage>;

function makeUser(id: string): UserPublic {
  return {
    id,
    email: `${id}@example.com`,
    username: id,
    first_name: null,
    last_name: null,
    birth_date: null,
    gender: null,
    height_cm: null,
    current_weight_kg: null,
    target_weight_kg: null,
    activity_level: null,
    goal: null,
    is_active: true,
    is_verified: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };
}

const ATHLETE_A = makeUser("55555555-5555-5555-5555-555555555555");
const ATHLETE_B = makeUser("66666666-6666-6666-6666-666666666666");

function LogoutHarness() {
  const { isAuthenticated, isBootstrapping: isAuthBootstrapping, user, logout } =
    useAuth();
  const { isStarting, status } = useRuntimeSession();

  if (!isAuthBootstrapping && !isAuthenticated) {
    return <Text testID="onboarding">onboarding</Text>;
  }

  if (isAuthBootstrapping || isStarting) {
    return <Text testID="loading">loading</Text>;
  }

  if (status === RUNTIME_SESSION_STATUS.failed) {
    return <Text testID="failed">failed</Text>;
  }

  return (
    <View>
      <Text testID="authenticated-app">authenticated app</Text>
      <Text testID="athleteId">{user?.id ?? ""}</Text>
      <Text testID="logout" onPress={() => logout()}>
        logout
      </Text>
    </View>
  );
}

function renderHarness() {
  return render(
    <AuthProvider>
      <RuntimeSessionProvider>
        <LogoutHarness />
      </RuntimeSessionProvider>
    </AuthProvider>,
  );
}

function loginAs(user: UserPublic): void {
  mockedSecureStorage.getTokens.mockResolvedValue({
    accessToken: "a",
    refreshToken: "r",
  });
  mockedAuthApi.getCurrentUser.mockResolvedValue(user);
}

async function waitForWriteThroughStatus(
  target: (typeof RUNTIME_WRITE_THROUGH_STATUS)[keyof typeof RUNTIME_WRITE_THROUGH_STATUS],
): Promise<void> {
  for (let index = 0; index < 50; index += 1) {
    const inFlight = getRuntimeWriteThroughPromise();
    if (inFlight) {
      await inFlight.catch(() => undefined);
    }
    if (getWriteThroughStatus() === target) {
      return;
    }
    await Promise.resolve();
  }
  throw new Error(`Write-through did not reach status: ${target}`);
}

/** Triggers a real AthleteIdentityService.build() mutation, forcing the next
 * identity repository save to throw so write-through fails deterministically. */
async function triggerFailingMutation(athleteId: string): Promise<void> {
  const root = getCompositionRoot();
  const adapters = root.resolve("RepositoryAdapters");
  jest.spyOn(adapters.identity, "save").mockImplementationOnce(() => {
    throw new Error("simulated repository failure");
  });

  await act(async () => {
    root.resolve("AthleteIdentityService").build({
      athleteId,
      requestId: `persistence-failure-logout:${athleteId}`,
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
    await waitForWriteThroughStatus(RUNTIME_WRITE_THROUGH_STATUS.failed);
  });
}

describe("Sprint 36.4 — persistence failure does not interfere with logout", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    resetRuntimeSessionForTests();
    resetCompositionRoot();
  });

  afterEach(() => {
    resetRuntimeSessionForTests();
    resetRuntimeWriteThrough();
    resetDashboardRestore();
    resetRepositoryHydration();
    resetRuntimeBootstrap();
    resetCompositionRoot();
  });

  it("a write-through persistence failure does not block or fail the Runtime Session", async () => {
    loginAs(ATHLETE_A);
    const { getByTestId } = renderHarness();
    await waitFor(() => expect(getByTestId("authenticated-app")).toBeTruthy());

    await triggerFailingMutation(ATHLETE_A.id);

    expect(getWriteThroughStatus()).toBe(RUNTIME_WRITE_THROUGH_STATUS.failed);
    // Session remains READY — persistence failure is a separate concern
    // from runtime execution / session lifecycle.
    expect(getRuntimeSessionStatus()).toBe(RUNTIME_SESSION_STATUS.ready);
    expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.ready);
    expect(getByTestId("authenticated-app")).toBeTruthy();
  });

  it("failed persistence -> logout -> login -> clean startup with no stale write-through state", async () => {
    loginAs(ATHLETE_A);
    const { getByTestId, unmount } = renderHarness();
    await waitFor(() => expect(getByTestId("authenticated-app")).toBeTruthy());

    await triggerFailingMutation(ATHLETE_A.id);
    expect(getWriteThroughStatus()).toBe(RUNTIME_WRITE_THROUGH_STATUS.failed);

    mockedSecureStorage.clearTokens.mockResolvedValue(undefined);
    await act(async () => {
      await getByTestId("logout").props.onPress();
    });

    await waitFor(() => expect(getByTestId("onboarding")).toBeTruthy());

    // Logout runs the existing deterministic reset cascade (Observer →
    // Write-Through → Dashboard Restore → Hydration → Bootstrap → Session)
    // regardless of the earlier persistence failure — no stale failed
    // write-through state survives.
    expect(getWriteThroughStatus()).toBe(RUNTIME_WRITE_THROUGH_STATUS.idle);
    expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.idle);
    expect(getBootstrapStatus()).toBe(BOOTSTRAP_STATUS.idle);
    expect(getHydrationStatus()).toBe(HYDRATION_STATUS.idle);
    expect(getDashboardRestoreStatus()).toBe(DASHBOARD_RESTORE_STATUS.idle);

    unmount();

    loginAs(ATHLETE_A);
    const { getByTestId: getByTestIdAgain } = renderHarness();

    await waitFor(() =>
      expect(getByTestIdAgain("authenticated-app")).toBeTruthy(),
    );
    expect(getBootstrapStatus()).toBe(BOOTSTRAP_STATUS.ready);
    expect(getWriteThroughStatus()).not.toBe(RUNTIME_WRITE_THROUGH_STATUS.failed);
  });

  it("does not leak Athlete A's failed persistence state into Athlete B's session", async () => {
    loginAs(ATHLETE_A);
    const { getByTestId, unmount } = renderHarness();
    await waitFor(() => expect(getByTestId("authenticated-app")).toBeTruthy());

    await triggerFailingMutation(ATHLETE_A.id);
    expect(getWriteThroughStatus()).toBe(RUNTIME_WRITE_THROUGH_STATUS.failed);

    mockedSecureStorage.clearTokens.mockResolvedValue(undefined);
    await act(async () => {
      await getByTestId("logout").props.onPress();
    });
    await waitFor(() => expect(getByTestId("onboarding")).toBeTruthy());

    unmount();

    loginAs(ATHLETE_B);
    const { getByTestId: getByTestIdB } = renderHarness();

    await waitFor(() =>
      expect(getByTestIdB("authenticated-app")).toBeTruthy(),
    );
    expect(getByTestIdB("athleteId").props.children).toBe(ATHLETE_B.id);
    expect(getWriteThroughStatus()).not.toBe(RUNTIME_WRITE_THROUGH_STATUS.failed);

    const root = getCompositionRoot();
    expect(
      root.resolve("AthleteIdentityService").getAthleteIdentity(ATHLETE_A.id),
    ).toBeNull();
  });
});
