import { act, render, waitFor } from "@testing-library/react-native";
import { Text, View } from "react-native";
import * as authApi from "../../../api/auth";
import type { UserPublic } from "../../../types/api";
import { AuthProvider } from "../../../auth/AuthContext";
import * as secureStorage from "../../../auth/secureStorage";
import {
  getCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import { createBootstrapResult } from "../../bootstrap/BootstrapResult";
import { RUNTIME_INITIALIZATION_PHASES } from "../../bootstrap/RuntimeInitialization";
import { resetRuntimeBootstrap } from "../../bootstrap/RuntimeBootstrap";
import * as bootstrapApplication from "../../bootstrap/application/bootstrapRuntime";
import { createDashboardRestoreResult } from "../../dashboard-restore/DashboardRestoreResult";
import { DASHBOARD_RESTORE_PHASES } from "../../dashboard-restore/DashboardRestoreInitialization";
import { createEmptyHomeDashboard } from "../../dashboard-restore/DashboardRestoreRestoration";
import { resetDashboardRestore } from "../../dashboard-restore/DashboardRestorePipeline";
import * as restoreApplication from "../../dashboard-restore/application/restoreDashboard";
import { createHydrationResult } from "../../hydration/HydrationResult";
import { HYDRATION_PHASES } from "../../hydration/HydrationInitialization";
import { resetRepositoryHydration } from "../../hydration/RepositoryHydrationPipeline";
import * as hydrationApplication from "../../hydration/application/hydrateRuntime";
import { RUNTIME_SESSION_STATUS } from "../RuntimeSessionStatus";
import {
  RuntimeSessionProvider,
  resetRuntimeSessionForTests,
  useRuntimeSession,
} from "../RuntimeSessionContext";
import * as sessionApplication from "../application/startRuntimeSession";
import { getRuntimeObserverStatus } from "../../runtime-observer/application/getRuntimeObserverStatus";
import { RUNTIME_OBSERVER_STATUS } from "../../runtime-observer/RuntimeObserverStatus";
import * as observerApplication from "../../runtime-observer/application/observeRuntime";
import { useAuth } from "../../../auth/useAuth";

jest.mock("../../../api/auth");
jest.mock("../../../auth/secureStorage");

const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;
const mockedSecureStorage = secureStorage as jest.Mocked<typeof secureStorage>;

const testUser: UserPublic = {
  id: "11111111-1111-1111-1111-111111111111",
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

function Probe() {
  const { isStarting, status } = useRuntimeSession();
  return (
    <View>
      <Text testID="starting">{String(isStarting)}</Text>
      <Text testID="status">{status}</Text>
    </View>
  );
}

function renderProbe() {
  return render(
    <AuthProvider>
      <RuntimeSessionProvider>
        <Probe />
      </RuntimeSessionProvider>
    </AuthProvider>,
  );
}

describe("RuntimeSessionProvider startup integration", () => {
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

  it("does not start runtime session for unauthenticated users", async () => {
    const startSpy = jest.spyOn(sessionApplication, "startRuntimeSession");
    mockedSecureStorage.getTokens.mockResolvedValue(null);

    const { getByTestId } = renderProbe();

    await waitFor(() =>
      expect(getByTestId("starting").props.children).toBe("false"),
    );
    expect(getByTestId("status").props.children).toBe(RUNTIME_SESSION_STATUS.idle);
    expect(startSpy).not.toHaveBeenCalled();
  });

  it("starts runtime session after auth succeeds and exposes ready status", async () => {
    mockedSecureStorage.getTokens.mockResolvedValue({
      accessToken: "a",
      refreshToken: "r",
    });
    mockedAuthApi.getCurrentUser.mockResolvedValue(testUser);

    const { getByTestId } = renderProbe();

    await waitFor(() =>
      expect(getByTestId("status").props.children).toBe(
        RUNTIME_SESSION_STATUS.ready,
      ),
    );
    expect(getByTestId("starting").props.children).toBe("false");
  });

  it("passes authenticated athlete id into startRuntimeSession", async () => {
    const startSpy = jest.spyOn(sessionApplication, "startRuntimeSession");
    mockedSecureStorage.getTokens.mockResolvedValue({
      accessToken: "a",
      refreshToken: "r",
    });
    mockedAuthApi.getCurrentUser.mockResolvedValue(testUser);

    renderProbe();

    await waitFor(() => expect(startSpy).toHaveBeenCalled());
    expect(startSpy).toHaveBeenCalledWith({
      athleteIds: [testUser.id],
    });
  });

  it("invokes bootstrap, hydration, and dashboard restore in order", async () => {
    const callOrder: string[] = [];

    mockedSecureStorage.getTokens.mockResolvedValue({
      accessToken: "a",
      refreshToken: "r",
    });
    mockedAuthApi.getCurrentUser.mockResolvedValue(testUser);

    jest.spyOn(bootstrapApplication, "bootstrapRuntime").mockImplementation(async () => {
      callOrder.push("bootstrap");
      return createBootstrapResult({
        serviceTokenCount: 62,
        validatedAt: "2026-08-10T10:00:00.000Z",
        phases: RUNTIME_INITIALIZATION_PHASES,
      });
    });

    jest.spyOn(hydrationApplication, "hydrateRuntime").mockImplementation(async () => {
      callOrder.push("hydrate");
      return createHydrationResult({
        identityRecordCount: 0,
        runtimeRecordCount: 0,
        workspaceRecordCount: 0,
        restoredAt: "2026-08-10T10:00:01.000Z",
        phases: HYDRATION_PHASES,
      });
    });

    jest.spyOn(restoreApplication, "restoreDashboard").mockImplementation(async () => {
      callOrder.push("restore");
      return createDashboardRestoreResult({
        athleteCount: 0,
        projectedCount: 0,
        emptyCount: 1,
        restoredAt: "2026-08-10T10:00:02.000Z",
        phases: DASHBOARD_RESTORE_PHASES,
        primaryDashboard: createEmptyHomeDashboard(),
      });
    });

    jest.spyOn(observerApplication, "observeRuntime").mockReturnValue({
      status: "ready",
      startedAt: "2026-08-10T10:00:00.000Z",
      completedAt: "2026-08-10T10:00:02.000Z",
      phases: [],
      watchedServices: [],
    });

    const { getByTestId } = renderProbe();

    await waitFor(() =>
      expect(getByTestId("status").props.children).toBe(
        RUNTIME_SESSION_STATUS.ready,
      ),
    );
    expect(callOrder).toEqual(["bootstrap", "hydrate", "restore"]);
  });

  it("propagates session failure to provider status", async () => {
    mockedSecureStorage.getTokens.mockResolvedValue({
      accessToken: "a",
      refreshToken: "r",
    });
    mockedAuthApi.getCurrentUser.mockResolvedValue(testUser);

    jest
      .spyOn(hydrationApplication, "hydrateRuntime")
      .mockRejectedValue(new Error("hydration failed"));

    const { getByTestId } = renderProbe();

    await waitFor(() =>
      expect(getByTestId("status").props.children).toBe(
        RUNTIME_SESSION_STATUS.failed,
      ),
    );
    expect(getByTestId("starting").props.children).toBe("false");
  });

  it("retries session startup through retrySession", async () => {
    mockedSecureStorage.getTokens.mockResolvedValue({
      accessToken: "a",
      refreshToken: "r",
    });
    mockedAuthApi.getCurrentUser.mockResolvedValue(testUser);

    const startSpy = jest
      .spyOn(sessionApplication, "startRuntimeSession")
      .mockRejectedValueOnce(new Error("session failed"))
      .mockResolvedValueOnce({
        status: "ready",
        startedAt: "2026-08-10T10:00:00.000Z",
        completedAt: "2026-08-10T10:00:02.000Z",
        phases: [],
        bootstrap: createBootstrapResult({
          serviceTokenCount: 62,
          validatedAt: "2026-08-10T10:00:00.000Z",
          phases: RUNTIME_INITIALIZATION_PHASES,
        }),
        hydration: createHydrationResult({
          identityRecordCount: 0,
          runtimeRecordCount: 0,
          workspaceRecordCount: 0,
          restoredAt: "2026-08-10T10:00:01.000Z",
          phases: HYDRATION_PHASES,
        }),
        dashboardRestore: createDashboardRestoreResult({
          athleteCount: 0,
          projectedCount: 0,
          emptyCount: 1,
          restoredAt: "2026-08-10T10:00:02.000Z",
          phases: DASHBOARD_RESTORE_PHASES,
          primaryDashboard: createEmptyHomeDashboard(),
        }),
      });

    jest.spyOn(observerApplication, "observeRuntime").mockReturnValue({
      status: "ready",
      startedAt: "2026-08-10T10:00:00.000Z",
      completedAt: "2026-08-10T10:00:02.000Z",
      phases: [],
      watchedServices: [],
    });

    function RetryProbe() {
      const { status, retrySession } = useRuntimeSession();
      return (
        <View>
          <Text testID="status">{status}</Text>
          <Text testID="retry" onPress={() => retrySession()}>
            retry
          </Text>
        </View>
      );
    }

    const { getByTestId } = render(
      <AuthProvider>
        <RuntimeSessionProvider>
          <RetryProbe />
        </RuntimeSessionProvider>
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(getByTestId("status").props.children).toBe(
        RUNTIME_SESSION_STATUS.failed,
      ),
    );

    await act(async () => {
      await getByTestId("retry").props.onPress();
    });

    await waitFor(() =>
      expect(getByTestId("status").props.children).toBe(
        RUNTIME_SESSION_STATUS.ready,
      ),
    );
    expect(startSpy).toHaveBeenCalledTimes(2);
  });
});

describe("RuntimeSessionProvider composition integration", () => {
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

  it("creates composition root through the full session chain", async () => {
    mockedSecureStorage.getTokens.mockResolvedValue({
      accessToken: "a",
      refreshToken: "r",
    });
    mockedAuthApi.getCurrentUser.mockResolvedValue(testUser);

    const { getByTestId } = renderProbe();

    await waitFor(() =>
      expect(getByTestId("status").props.children).toBe(
        RUNTIME_SESSION_STATUS.ready,
      ),
    );

    const root = getCompositionRoot();
    expect(root.resolve("RuntimeSessionService").getStatus()).toBe(
      RUNTIME_SESSION_STATUS.ready,
    );
    expect(root.resolve("RuntimeBootstrapService").isReady()).toBe(true);
  });
});

describe("RuntimeSessionProvider observer auto-start integration", () => {
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

  it("starts runtime observer automatically after session reaches ready", async () => {
    mockedSecureStorage.getTokens.mockResolvedValue({
      accessToken: "a",
      refreshToken: "r",
    });
    mockedAuthApi.getCurrentUser.mockResolvedValue(testUser);

    const { getByTestId } = renderProbe();

    await waitFor(() =>
      expect(getByTestId("status").props.children).toBe(
        RUNTIME_SESSION_STATUS.ready,
      ),
    );
    expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.ready);
  });

  it("does not start runtime observer when session startup fails", async () => {
    mockedSecureStorage.getTokens.mockResolvedValue({
      accessToken: "a",
      refreshToken: "r",
    });
    mockedAuthApi.getCurrentUser.mockResolvedValue(testUser);

    jest
      .spyOn(hydrationApplication, "hydrateRuntime")
      .mockRejectedValue(new Error("hydration failed"));

    const observeSpy = jest.spyOn(observerApplication, "observeRuntime");

    const { getByTestId } = renderProbe();

    await waitFor(() =>
      expect(getByTestId("status").props.children).toBe(
        RUNTIME_SESSION_STATUS.failed,
      ),
    );
    expect(observeSpy).not.toHaveBeenCalled();
    expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.idle);
  });

  it("starts runtime observer after session and before provider reports ready", async () => {
    const callOrder: string[] = [];

    mockedSecureStorage.getTokens.mockResolvedValue({
      accessToken: "a",
      refreshToken: "r",
    });
    mockedAuthApi.getCurrentUser.mockResolvedValue(testUser);

    const originalStart = sessionApplication.startRuntimeSession;
    jest.spyOn(sessionApplication, "startRuntimeSession").mockImplementation(async (options) => {
      callOrder.push("session");
      return originalStart(options);
    });

    const originalObserve = observerApplication.observeRuntime;
    jest.spyOn(observerApplication, "observeRuntime").mockImplementation((options) => {
      callOrder.push("observer");
      return originalObserve(options);
    });

    const { getByTestId } = renderProbe();

    await waitFor(() =>
      expect(getByTestId("status").props.children).toBe(
        RUNTIME_SESSION_STATUS.ready,
      ),
    );
    expect(callOrder.indexOf("session")).toBeLessThan(callOrder.indexOf("observer"));
  });

  it("stops runtime observer and resets state on logout", async () => {
    mockedSecureStorage.getTokens.mockResolvedValue({
      accessToken: "a",
      refreshToken: "r",
    });
    mockedAuthApi.getCurrentUser.mockResolvedValue(testUser);
    mockedSecureStorage.clearTokens.mockResolvedValue(undefined);

    function LogoutProbe() {
      const { logout } = useAuth();
      const { status } = useRuntimeSession();
      return (
        <View>
          <Text testID="status">{status}</Text>
          <Text testID="logout" onPress={() => logout()}>
            logout
          </Text>
        </View>
      );
    }

    const { getByTestId } = render(
      <AuthProvider>
        <RuntimeSessionProvider>
          <LogoutProbe />
        </RuntimeSessionProvider>
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(getByTestId("status").props.children).toBe(
        RUNTIME_SESSION_STATUS.ready,
      ),
    );
    expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.ready);

    await act(async () => {
      await getByTestId("logout").props.onPress();
    });

    await waitFor(() =>
      expect(getByTestId("status").props.children).toBe(
        RUNTIME_SESSION_STATUS.idle,
      ),
    );
    expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.idle);
  });

  it("exposes ready RuntimeObserverService through composition root after startup", async () => {
    mockedSecureStorage.getTokens.mockResolvedValue({
      accessToken: "a",
      refreshToken: "r",
    });
    mockedAuthApi.getCurrentUser.mockResolvedValue(testUser);

    const { getByTestId } = renderProbe();

    await waitFor(() =>
      expect(getByTestId("status").props.children).toBe(
        RUNTIME_SESSION_STATUS.ready,
      ),
    );

    const root = getCompositionRoot();
    expect(root.resolve("RuntimeObserverService").getStatus()).toBe(
      RUNTIME_OBSERVER_STATUS.ready,
    );
  });
});
