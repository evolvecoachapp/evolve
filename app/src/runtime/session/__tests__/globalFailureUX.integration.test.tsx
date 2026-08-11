import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as authApi from "../../../api/auth";
import type { UserPublic } from "../../../types/api";
import { AuthProvider } from "../../../auth/AuthContext";
import { useAuth } from "../../../auth/useAuth";
import * as secureStorage from "../../../auth/secureStorage";
import {
  getCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import { RuntimeFailureScreen } from "../../../components/RuntimeFailureScreen";
import { ThemeProvider } from "../../../theme/ThemeContext";
import { createBootstrapResult } from "../../bootstrap/BootstrapResult";
import { RUNTIME_INITIALIZATION_PHASES } from "../../bootstrap/RuntimeInitialization";
import { resetRuntimeBootstrap } from "../../bootstrap/RuntimeBootstrap";
import { createDashboardRestoreResult } from "../../dashboard-restore/DashboardRestoreResult";
import { DASHBOARD_RESTORE_PHASES } from "../../dashboard-restore/DashboardRestoreInitialization";
import { createEmptyHomeDashboard } from "../../dashboard-restore/DashboardRestoreRestoration";
import { resetDashboardRestore } from "../../dashboard-restore/DashboardRestorePipeline";
import { createHydrationResult } from "../../hydration/HydrationResult";
import { HYDRATION_PHASES } from "../../hydration/HydrationInitialization";
import { resetRepositoryHydration } from "../../hydration/RepositoryHydrationPipeline";
import { RUNTIME_SESSION_STATUS } from "../RuntimeSessionStatus";
import {
  RuntimeSessionProvider,
  resetRuntimeSessionForTests,
  useRuntimeSession,
} from "../RuntimeSessionContext";
import * as sessionApplication from "../application/startRuntimeSession";
import * as observerApplication from "../../runtime-observer/application/observeRuntime";

jest.mock("../../../api/auth");
jest.mock("../../../auth/secureStorage");
jest.mock("../../../theme/themeStorage", () => ({
  getStoredThemePreference: jest.fn().mockResolvedValue(null),
  setStoredThemePreference: jest.fn().mockResolvedValue(undefined),
}));

const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;
const mockedSecureStorage = secureStorage as jest.Mocked<typeof secureStorage>;

const RAW_FAILURE_REASON = "hydration failed: sqlite handle closed unexpectedly";

const testUser: UserPublic = {
  id: "22222222-2222-2222-2222-222222222222",
  email: "user@example.com",
  username: "evolveuser",
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

const safeAreaMetrics = {
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

function createReadyResult() {
  return {
    status: "ready" as const,
    startedAt: "2026-08-11T10:00:00.000Z",
    completedAt: "2026-08-11T10:00:02.000Z",
    phases: [],
    bootstrap: createBootstrapResult({
      serviceTokenCount: 62,
      validatedAt: "2026-08-11T10:00:00.000Z",
      phases: RUNTIME_INITIALIZATION_PHASES,
    }),
    hydration: createHydrationResult({
      identityRecordCount: 0,
      runtimeRecordCount: 0,
      workspaceRecordCount: 0,
      restoredAt: "2026-08-11T10:00:01.000Z",
      phases: HYDRATION_PHASES,
    }),
    dashboardRestore: createDashboardRestoreResult({
      athleteCount: 0,
      projectedCount: 0,
      emptyCount: 1,
      restoredAt: "2026-08-11T10:00:02.000Z",
      phases: DASHBOARD_RESTORE_PHASES,
      primaryDashboard: createEmptyHomeDashboard(),
    }),
  };
}

/**
 * Mirrors the gating logic in `app/(app)/_layout.tsx`: unauthenticated →
 * onboarding, auth/runtime starting → loading, Runtime Session failed →
 * global `RuntimeFailureScreen` (blocking authenticated navigation),
 * otherwise the authenticated app renders.
 */
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

describe("Global Runtime Failure UX", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    resetRuntimeSessionForTests();
    resetCompositionRoot();
  });

  afterEach(() => {
    resetRuntimeSessionForTests();
    resetDashboardRestore();
    resetRepositoryHydration();
    resetRuntimeBootstrap();
    resetCompositionRoot();
  });

  it("renders the global runtime failure screen when Runtime Session fails to start", async () => {
    mockedSecureStorage.getTokens.mockResolvedValue({
      accessToken: "a",
      refreshToken: "r",
    });
    mockedAuthApi.getCurrentUser.mockResolvedValue(testUser);
    jest
      .spyOn(sessionApplication, "startRuntimeSession")
      .mockRejectedValue(new Error(RAW_FAILURE_REASON));

    const { getByText, queryByTestId } = renderShell();

    await waitFor(() => expect(getByText("EVOLVE couldn't start")).toBeTruthy());
    expect(queryByTestId("authenticated-app")).toBeNull();
    expect(getByText("Retry")).toBeTruthy();
  });

  it("never exposes the raw failure reason to the user", async () => {
    mockedSecureStorage.getTokens.mockResolvedValue({
      accessToken: "a",
      refreshToken: "r",
    });
    mockedAuthApi.getCurrentUser.mockResolvedValue(testUser);
    jest
      .spyOn(sessionApplication, "startRuntimeSession")
      .mockRejectedValue(new Error(RAW_FAILURE_REASON));

    const { getByText, queryByText } = renderShell();

    await waitFor(() => expect(getByText("EVOLVE couldn't start")).toBeTruthy());
    expect(queryByText(RAW_FAILURE_REASON)).toBeNull();
    expect(queryByText(/sqlite/i)).toBeNull();
    expect(queryByText(/error:/i)).toBeNull();
  });

  it("Retry calls the existing retrySession()/startRuntimeSession() API, and a successful retry returns to the authenticated app", async () => {
    mockedSecureStorage.getTokens.mockResolvedValue({
      accessToken: "a",
      refreshToken: "r",
    });
    mockedAuthApi.getCurrentUser.mockResolvedValue(testUser);

    const startSpy = jest
      .spyOn(sessionApplication, "startRuntimeSession")
      .mockRejectedValueOnce(new Error(RAW_FAILURE_REASON))
      .mockResolvedValueOnce(createReadyResult());
    jest.spyOn(observerApplication, "observeRuntime").mockReturnValue({
      status: "ready",
      startedAt: "2026-08-11T10:00:00.000Z",
      completedAt: "2026-08-11T10:00:02.000Z",
      phases: [],
      watchedServices: [],
    });

    const { getByText } = renderShell();

    await waitFor(() => expect(getByText("EVOLVE couldn't start")).toBeTruthy());
    expect(startSpy).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(getByText("Retry"));
    });

    await waitFor(() => expect(getByText("authenticated app")).toBeTruthy());
    expect(startSpy).toHaveBeenCalledTimes(2);
  });

  it("unauthenticated users bypass the runtime session entirely and are never shown the failure screen", async () => {
    mockedSecureStorage.getTokens.mockResolvedValue(null);
    const startSpy = jest.spyOn(sessionApplication, "startRuntimeSession");

    const { getByTestId, queryByText } = renderShell();

    await waitFor(() => expect(getByTestId("onboarding")).toBeTruthy());
    expect(startSpy).not.toHaveBeenCalled();
    expect(queryByText("EVOLVE couldn't start")).toBeNull();
  });

  it("exposes composition root as unaffected after a failed-then-retried session (regression)", async () => {
    mockedSecureStorage.getTokens.mockResolvedValue({
      accessToken: "a",
      refreshToken: "r",
    });
    mockedAuthApi.getCurrentUser.mockResolvedValue(testUser);

    jest
      .spyOn(sessionApplication, "startRuntimeSession")
      .mockRejectedValueOnce(new Error(RAW_FAILURE_REASON))
      .mockResolvedValueOnce(createReadyResult());
    jest.spyOn(observerApplication, "observeRuntime").mockReturnValue({
      status: "ready",
      startedAt: "2026-08-11T10:00:00.000Z",
      completedAt: "2026-08-11T10:00:02.000Z",
      phases: [],
      watchedServices: [],
    });

    const { getByText } = renderShell();

    await waitFor(() => expect(getByText("EVOLVE couldn't start")).toBeTruthy());

    await act(async () => {
      fireEvent.press(getByText("Retry"));
    });

    await waitFor(() => expect(getByText("authenticated app")).toBeTruthy());
    expect(getCompositionRoot()).toBeTruthy();
  });
});
