import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as authApi from "../../../api/auth";
import { AuthProvider } from "../../../auth/AuthContext";
import { useAuth } from "../../../auth/useAuth";
import * as secureStorage from "../../../auth/secureStorage";
import { RuntimeFailureScreen } from "../../../components/RuntimeFailureScreen";
import {
  getCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import { AthleteIdentityService } from "../../../features/athlete-identity/services/AthleteIdentityService";
import { resetNativeSQLiteTestState } from "../../../infrastructure/sqlite/testSupport/resetNativeSQLiteTestState";
import { ThemeProvider } from "../../../theme/ThemeContext";
import type { UserPublic } from "../../../types/api";
import { resetRuntimeBootstrap } from "../../bootstrap/RuntimeBootstrap";
import { resetDashboardRestore } from "../../dashboard-restore/DashboardRestorePipeline";
import { resetRepositoryHydration } from "../../hydration/RepositoryHydrationPipeline";
import { observeRuntime } from "../../runtime-observer/application/observeRuntime";
import { resetRuntimeObserver } from "../../runtime-observer/RuntimeObserver";
import {
  getRuntimeWriteThroughPromise,
  resetRuntimeWriteThrough,
} from "../../write-through/RuntimeWriteThroughPipeline";
import { getWriteThroughStatus } from "../../write-through/application/getWriteThroughStatus";
import { RUNTIME_WRITE_THROUGH_STATUS } from "../../write-through/RuntimeWriteThroughStatus";
import { getRuntimeSessionStatus, startRuntimeSession } from "../application";
import { initializeFirstRunRuntime } from "../initializeFirstRunRuntime";
import {
  resetRuntimeSessionForTests,
  RuntimeSessionProvider,
  useRuntimeSession,
} from "../RuntimeSessionContext";
import { resetRuntimeSession } from "../RuntimeSessionOrchestrator";
import { RUNTIME_SESSION_STATUS } from "../RuntimeSessionStatus";

jest.mock("../../../api/auth");
jest.mock("../../../auth/secureStorage");
jest.mock("../../../theme/themeStorage", () => ({
  getStoredThemePreference: jest.fn().mockResolvedValue(null),
  setStoredThemePreference: jest.fn().mockResolvedValue(undefined),
}));

const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;
const mockedSecureStorage = secureStorage as jest.Mocked<typeof secureStorage>;

const FIXED_CLOCK = () => "2026-08-13T10:00:00.000Z";
const ATHLETE_A = "athlete:sprint38:userA";
const ATHLETE_B = "athlete:sprint38:userB";

const testUserA: UserPublic = {
  id: ATHLETE_A,
  email: "a@example.com",
  username: "athleteA",
  first_name: "Alex",
  last_name: "Rivera",
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

const safeAreaMetrics = {
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

function resetEverything(): void {
  resetRuntimeObserver();
  resetRuntimeWriteThrough();
  resetDashboardRestore();
  resetRepositoryHydration();
  resetRuntimeBootstrap();
  resetRuntimeSession();
  resetCompositionRoot();
  resetNativeSQLiteTestState();
}

function simulateLogout(): void {
  resetRuntimeSessionForTests();
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

function AuthenticatedShellHarness() {
  const { isAuthenticated, isBootstrapping: isAuthBootstrapping } = useAuth();
  const {
    isStarting: isRuntimeStarting,
    status: runtimeStatus,
    retrySession,
  } = useRuntimeSession();

  if (!isAuthBootstrapping && !isAuthenticated) {
    return <Text testID="onboarding">onboarding</Text>;
  }

  if (isAuthBootstrapping || isRuntimeStarting) {
    return <Text testID="loading">loading</Text>;
  }

  if (runtimeStatus === RUNTIME_SESSION_STATUS.failed) {
    return <RuntimeFailureScreen onRetry={retrySession} />;
  }

  return <Text testID="authenticated-app">authenticated app</Text>;
}

function renderShell() {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>
        <AuthProvider>
          <RuntimeSessionProvider>
            <AuthenticatedShellHarness />
          </RuntimeSessionProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("First-run runtime bootstrap (Sprint 38.3)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    resetEverything();
  });

  it("initializes identity and workspace for a brand-new athlete and reaches ready", async () => {
    const result = await startRuntimeSession({
      athleteIds: [ATHLETE_A],
      identitySeed: {
        displayName: "Alex Rivera",
        givenName: "Alex",
        familyName: "Rivera",
      },
      clock: FIXED_CLOCK,
    });

    expect(result.status).toBe("ready");
    expect(getRuntimeSessionStatus()).toBe(RUNTIME_SESSION_STATUS.ready);
    expect(result.hydration.identityRecordCount).toBe(0);
    expect(result.dashboardRestore.projectedCount).toBe(1);
    expect(result.dashboardRestore.emptyCount).toBe(0);
    expect(result.dashboardRestore.primaryDashboard.athlete.displayName).toBe(
      "Alex Rivera",
    );

    const root = getCompositionRoot();
    const identity = root
      .resolve("AthleteIdentityService")
      .getAthleteIdentity(ATHLETE_A);
    expect(identity?.athleteId).toBe(ATHLETE_A);
    expect(identity?.profile.displayName).toBe("Alex Rivera");
    expect(root.resolve("UnifiedWorkspaceService").getWorkspace(ATHLETE_A)).not.toBeNull();
  });

  it("restores an existing athlete without replacing persisted identity or workspace", async () => {
    await startRuntimeSession({
      athleteIds: [ATHLETE_A],
      identitySeed: { displayName: "Alex Rivera" },
      clock: FIXED_CLOCK,
    });
    observeRuntime({ athleteIds: [ATHLETE_A], clock: FIXED_CLOCK });

    const root = getCompositionRoot();
    const custom = root.resolve("AthleteIdentityService").build({
      athleteId: ATHLETE_A,
      requestId: "existing:identity:custom",
      generatedAt: FIXED_CLOCK(),
      profile: {
        displayName: "Alex Custom",
        givenName: "Alex",
        familyName: "Custom",
      },
      locale: { languageTag: "en-US" },
      units: { system: "metric" },
      timeZone: { iana: "Etc/UTC" },
    });
    expect(custom.success).toBe(true);
    const persistedIdentityId = custom.identity?.id;
    const persistedWorkspaceId = root
      .resolve("UnifiedWorkspaceService")
      .getWorkspace(ATHLETE_A)?.id;

    await waitForWriteThrough();
    simulateLogout();

    const restarted = await startRuntimeSession({
      athleteIds: [ATHLETE_A],
      identitySeed: { displayName: "Should Not Replace" },
      clock: FIXED_CLOCK,
    });

    expect(restarted.status).toBe("ready");
    const restoredRoot = getCompositionRoot();
    const restoredIdentity = restoredRoot
      .resolve("AthleteIdentityService")
      .getAthleteIdentity(ATHLETE_A);
    expect(restoredIdentity?.id).toBe(persistedIdentityId);
    expect(restoredIdentity?.profile.displayName).toBe("Alex Custom");
    expect(
      restoredRoot.resolve("UnifiedWorkspaceService").getWorkspace(ATHLETE_A)?.id,
    ).toBe(persistedWorkspaceId);
  });

  it("creates first-run identity only when it is missing", async () => {
    await startRuntimeSession({
      athleteIds: [ATHLETE_A],
      identitySeed: { displayName: "Alex Rivera" },
      clock: FIXED_CLOCK,
    });

    const root = getCompositionRoot();
    const identityService = root.resolve("AthleteIdentityService");
    const existing = identityService.getAthleteIdentity(ATHLETE_A);
    expect(existing).not.toBeNull();

    const buildSpy = jest.spyOn(identityService, "build");
    await initializeFirstRunRuntime({
      athleteIds: [ATHLETE_A],
      identitySeed: { displayName: "Replacement" },
      clock: FIXED_CLOCK,
    });

    expect(buildSpy).not.toHaveBeenCalled();
    expect(identityService.getAthleteIdentity(ATHLETE_A)).toBe(existing);
  });

  it("creates first-run workspace only when it is missing", async () => {
    await startRuntimeSession({
      athleteIds: [ATHLETE_A],
      clock: FIXED_CLOCK,
    });

    const root = getCompositionRoot();
    const workspaceService = root.resolve("UnifiedWorkspaceService");
    const existing = workspaceService.getWorkspace(ATHLETE_A);
    expect(existing).not.toBeNull();

    const buildSpy = jest.spyOn(workspaceService, "build");
    await initializeFirstRunRuntime({
      athleteIds: [ATHLETE_A],
      clock: FIXED_CLOCK,
    });

    expect(buildSpy).not.toHaveBeenCalled();
    expect(workspaceService.getWorkspace(ATHLETE_A)).toBe(existing);
  });

  it("isolates first-run athlete A from athlete B after logout", async () => {
    await startRuntimeSession({
      athleteIds: [ATHLETE_A],
      identitySeed: { displayName: "Alex Rivera" },
      clock: FIXED_CLOCK,
    });

    const rootA = getCompositionRoot();
    expect(
      rootA.resolve("AthleteIdentityService").getAthleteIdentity(ATHLETE_A)
        ?.profile.displayName,
    ).toBe("Alex Rivera");

    simulateLogout();

    await startRuntimeSession({
      athleteIds: [ATHLETE_B],
      identitySeed: { displayName: "Bailey Chen" },
      clock: FIXED_CLOCK,
    });

    const rootB = getCompositionRoot();
    expect(rootB).not.toBe(rootA);
    expect(
      rootB.resolve("AthleteIdentityService").getAthleteIdentity(ATHLETE_A),
    ).toBeNull();
    expect(
      rootB.resolve("AthleteIdentityService").getAthleteIdentity(ATHLETE_B)
        ?.profile.displayName,
    ).toBe("Bailey Chen");
    expect(
      rootB.resolve("UnifiedWorkspaceService").getWorkspace(ATHLETE_A),
    ).toBeNull();
    expect(
      rootB.resolve("UnifiedWorkspaceService").getWorkspace(ATHLETE_B),
    ).not.toBeNull();
  });

  it("sends first-run initialization failure to the existing Runtime failure UX", async () => {
    mockedSecureStorage.getTokens.mockResolvedValue({
      accessToken: "a",
      refreshToken: "r",
    });
    mockedAuthApi.getCurrentUser.mockResolvedValue(testUserA);

    jest.spyOn(AthleteIdentityService.prototype, "build").mockImplementation(() => {
      throw new Error("first-run identity composition exploded");
    });

    const { getByText, queryByText, queryByTestId } = renderShell();

    await waitFor(() => expect(getByText("EVOLVE couldn't start")).toBeTruthy());
    expect(queryByTestId("authenticated-app")).toBeNull();
    expect(queryByText("first-run identity composition exploded")).toBeNull();
    expect(getRuntimeSessionStatus()).toBe(RUNTIME_SESSION_STATUS.failed);
  });

  it("retries successfully after a first-run initialization failure", async () => {
    mockedSecureStorage.getTokens.mockResolvedValue({
      accessToken: "a",
      refreshToken: "r",
    });
    mockedAuthApi.getCurrentUser.mockResolvedValue(testUserA);

    const buildSpy = jest
      .spyOn(AthleteIdentityService.prototype, "build")
      .mockImplementationOnce(() => {
        throw new Error("first-run identity composition exploded");
      });

    const { getByText, queryByTestId } = renderShell();

    await waitFor(() => expect(getByText("EVOLVE couldn't start")).toBeTruthy());
    expect(queryByTestId("authenticated-app")).toBeNull();

    await act(async () => {
      fireEvent.press(getByText("Retry"));
    });

    await waitFor(() =>
      expect(queryByTestId("authenticated-app")).toBeTruthy(),
    );
    expect(getRuntimeSessionStatus()).toBe(RUNTIME_SESSION_STATUS.ready);
    expect(buildSpy).toHaveBeenCalled();

    const root = getCompositionRoot();
    expect(
      root.resolve("AthleteIdentityService").getAthleteIdentity(ATHLETE_A),
    ).not.toBeNull();
  });
});
