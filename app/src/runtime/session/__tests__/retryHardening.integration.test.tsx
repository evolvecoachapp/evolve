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
import * as bootstrapApplication from "../../bootstrap/application/bootstrapRuntime";
import { RuntimeBootstrapError } from "../../bootstrap/RuntimeBootstrapError";

import { resetRepositoryHydration } from "../../hydration/RepositoryHydrationPipeline";
import { getHydrationStatus } from "../../hydration/application/getHydrationStatus";
import { HYDRATION_STATUS } from "../../hydration/HydrationStatus";
import * as hydrationApplication from "../../hydration/application/hydrateRuntime";
import { HydrationError } from "../../hydration/HydrationError";

import { resetDashboardRestore } from "../../dashboard-restore/DashboardRestorePipeline";
import { getDashboardRestoreStatus } from "../../dashboard-restore/application/getDashboardRestoreStatus";
import { DASHBOARD_RESTORE_STATUS } from "../../dashboard-restore/DashboardRestoreStatus";
import * as restoreApplication from "../../dashboard-restore/application/restoreDashboard";
import { DashboardRestoreError } from "../../dashboard-restore/DashboardRestoreError";

import { resetRuntimeWriteThrough } from "../../write-through/RuntimeWriteThroughPipeline";
import { getWriteThroughStatus } from "../../write-through/application/getWriteThroughStatus";
import { RUNTIME_WRITE_THROUGH_STATUS } from "../../write-through/RuntimeWriteThroughStatus";
import * as writeThroughApplication from "../../write-through/application/persistRuntime";

import { resetRuntimeObserver } from "../../runtime-observer/RuntimeObserver";
import { getRuntimeObserverStatus } from "../../runtime-observer/application/getRuntimeObserverStatus";
import { RUNTIME_OBSERVER_STATUS } from "../../runtime-observer/RuntimeObserverStatus";
import * as observerApplication from "../../runtime-observer/application/observeRuntime";

import { RUNTIME_SESSION_STATUS } from "../RuntimeSessionStatus";
import { getRuntimeSessionStatus } from "../application/getRuntimeSessionStatus";
import { RuntimeBootstrap } from "../../bootstrap/RuntimeBootstrap";
import { RepositoryHydrationPipeline } from "../../hydration/RepositoryHydrationPipeline";
import { DashboardRestorePipeline } from "../../dashboard-restore/DashboardRestorePipeline";
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

const ATHLETE_A = makeUser("33333333-3333-3333-3333-333333333333");
const ATHLETE_B = makeUser("44444444-4444-4444-4444-444444444444");

/**
 * Mirrors `app/(app)/_layout.tsx` gating exactly (unauthenticated →
 * onboarding, auth/runtime starting → loading, failed → the failure
 * surface with a Retry action, otherwise the authenticated app) plus a
 * logout affordance and the current authenticated athlete id, so tests can
 * assert on athlete isolation without reaching into React internals.
 */
function RetryHardeningHarness() {
  const { isAuthenticated, isBootstrapping: isAuthBootstrapping, user, logout } =
    useAuth();
  const { isStarting, status, retrySession } = useRuntimeSession();

  if (!isAuthBootstrapping && !isAuthenticated) {
    return <Text testID="onboarding">onboarding</Text>;
  }

  if (isAuthBootstrapping || isStarting) {
    return <Text testID="loading">loading</Text>;
  }

  if (status === RUNTIME_SESSION_STATUS.failed) {
    return (
      <View>
        <Text testID="failed">failed</Text>
        <Text testID="retry" onPress={() => retrySession()}>
          retry
        </Text>
        <Text testID="logout" onPress={() => logout()}>
          logout
        </Text>
      </View>
    );
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
        <RetryHardeningHarness />
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

describe("Sprint 36.3 — Runtime Session retry hardening", () => {
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

  describe("retry lifecycle", () => {
    it("failure -> retry -> ready", async () => {
      loginAs(ATHLETE_A);
      jest
        .spyOn(bootstrapApplication, "bootstrapRuntime")
        .mockRejectedValueOnce(
          new RuntimeBootstrapError(
            "Composition Root bootstrap failed",
            "composition_root_failed",
          ),
        );

      const { getByTestId } = renderHarness();
      await waitFor(() => expect(getByTestId("failed")).toBeTruthy());

      await act(async () => {
        await getByTestId("retry").props.onPress();
      });

      await waitFor(() =>
        expect(getByTestId("authenticated-app")).toBeTruthy(),
      );
      expect(getBootstrapStatus()).toBe(BOOTSTRAP_STATUS.ready);
    });

    it("failure -> retry -> failure", async () => {
      loginAs(ATHLETE_A);
      jest
        .spyOn(bootstrapApplication, "bootstrapRuntime")
        .mockRejectedValue(
          new RuntimeBootstrapError(
            "Composition Root bootstrap failed",
            "composition_root_failed",
          ),
        );

      const { getByTestId } = renderHarness();
      await waitFor(() => expect(getByTestId("failed")).toBeTruthy());

      await act(async () => {
        await getByTestId("retry").props.onPress();
      });

      await waitFor(() => expect(getByTestId("failed")).toBeTruthy());
      expect(getRuntimeSessionStatus()).toBe(RUNTIME_SESSION_STATUS.failed);
      expect(getByTestId("failed")).toBeTruthy();
    });

    it("retries cleanly after a bootstrap failure", async () => {
      loginAs(ATHLETE_A);
      jest
        .spyOn(bootstrapApplication, "bootstrapRuntime")
        .mockRejectedValueOnce(
          new RuntimeBootstrapError(
            "Composition Root bootstrap failed",
            "composition_root_failed",
          ),
        );

      const { getByTestId } = renderHarness();
      await waitFor(() => expect(getByTestId("failed")).toBeTruthy());
      expect(getRuntimeSessionStatus()).toBe(RUNTIME_SESSION_STATUS.failed);

      await act(async () => {
        await getByTestId("retry").props.onPress();
      });

      await waitFor(() =>
        expect(getByTestId("authenticated-app")).toBeTruthy(),
      );
      expect(getBootstrapStatus()).toBe(BOOTSTRAP_STATUS.ready);
      expect(getHydrationStatus()).toBe(HYDRATION_STATUS.ready);
      expect(getDashboardRestoreStatus()).toBe(DASHBOARD_RESTORE_STATUS.ready);
    });

    it("retries cleanly after a hydration failure", async () => {
      loginAs(ATHLETE_A);
      jest
        .spyOn(hydrationApplication, "hydrateRuntime")
        .mockRejectedValueOnce(
          new HydrationError(
            "Repository contract rejected hydration",
            "repository_contract_failed",
          ),
        );

      const { getByTestId } = renderHarness();
      await waitFor(() => expect(getByTestId("failed")).toBeTruthy());
      expect(getRuntimeSessionStatus()).toBe(RUNTIME_SESSION_STATUS.failed);
      // Bootstrap already succeeded for real on the first attempt (only
      // hydration is mocked here) — retry must still be able to
      // re-bootstrap deterministically rather than skip it.
      expect(getBootstrapStatus()).toBe(BOOTSTRAP_STATUS.ready);

      await act(async () => {
        await getByTestId("retry").props.onPress();
      });

      await waitFor(() =>
        expect(getByTestId("authenticated-app")).toBeTruthy(),
      );
      expect(getHydrationStatus()).toBe(HYDRATION_STATUS.ready);
      expect(getDashboardRestoreStatus()).toBe(DASHBOARD_RESTORE_STATUS.ready);
    });

    it("retries cleanly after a dashboard restore failure", async () => {
      loginAs(ATHLETE_A);
      jest
        .spyOn(restoreApplication, "restoreDashboard")
        .mockRejectedValueOnce(
          new DashboardRestoreError(
            "Dashboard projection failed",
            "projection_failed",
          ),
        );

      const { getByTestId } = renderHarness();
      await waitFor(() => expect(getByTestId("failed")).toBeTruthy());
      expect(getRuntimeSessionStatus()).toBe(RUNTIME_SESSION_STATUS.failed);
      // Bootstrap and hydration are not mocked in this scenario and
      // succeeded for real on the first attempt.
      expect(getBootstrapStatus()).toBe(BOOTSTRAP_STATUS.ready);
      expect(getHydrationStatus()).toBe(HYDRATION_STATUS.ready);

      await act(async () => {
        await getByTestId("retry").props.onPress();
      });

      await waitFor(() =>
        expect(getByTestId("authenticated-app")).toBeTruthy(),
      );
      expect(getDashboardRestoreStatus()).toBe(DASHBOARD_RESTORE_STATUS.ready);
    });

    it("retries cleanly after an observer failure that occurs after the session pipeline already succeeded", async () => {
      loginAs(ATHLETE_A);
      jest
        .spyOn(observerApplication, "observeRuntime")
        .mockImplementationOnce(() => {
          throw new Error("observer failed to start");
        });

      const { getByTestId } = renderHarness();
      await waitFor(() => expect(getByTestId("failed")).toBeTruthy());
      // The orchestrator's own session pipeline succeeded — only the
      // observer (started after the session resolves) failed. Retry must
      // not be blocked or skipped because of this internal/exposed status
      // mismatch.
      expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.idle);

      await act(async () => {
        await getByTestId("retry").props.onPress();
      });

      await waitFor(() =>
        expect(getByTestId("authenticated-app")).toBeTruthy(),
      );
      expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.ready);
      expect(getBootstrapStatus()).toBe(BOOTSTRAP_STATUS.ready);
      expect(getHydrationStatus()).toBe(HYDRATION_STATUS.ready);
      expect(getDashboardRestoreStatus()).toBe(DASHBOARD_RESTORE_STATUS.ready);
    });

    it("does not duplicate observer build() wrapping across a failed-then-retried session", async () => {
      loginAs(ATHLETE_A);
      const persistSpy = jest
        .spyOn(writeThroughApplication, "persistRuntime")
        .mockResolvedValue({
          status: "ready",
          identityRecordCount: 1,
          runtimeRecordCount: 0,
          workspaceRecordCount: 0,
          persistedAt: "2026-08-11T10:00:00.000Z",
          phases: [],
        });

      jest
        .spyOn(observerApplication, "observeRuntime")
        .mockImplementationOnce(() => {
          throw new Error("observer failed to start");
        });

      const { getByTestId } = renderHarness();
      await waitFor(() => expect(getByTestId("failed")).toBeTruthy());

      await act(async () => {
        await getByTestId("retry").props.onPress();
      });
      await waitFor(() =>
        expect(getByTestId("authenticated-app")).toBeTruthy(),
      );

      persistSpy.mockClear();

      const root = getCompositionRoot();
      await act(async () => {
        root.resolve("AthleteIdentityService").build({
          athleteId: ATHLETE_A.id,
          requestId: "retry-hardening:no-duplicate-wrap",
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
        await Promise.resolve();
      });

      expect(persistSpy).toHaveBeenCalledTimes(1);
    });

    it("resets every runtime pipeline state before the retry attempt executes, forcing a full re-run", async () => {
      loginAs(ATHLETE_A);

      // Spy on the real pipeline classes (not the idempotent application
      // wrappers) so a call only registers when the underlying pipeline
      // actually re-executes — an idempotent wrapper that short-circuits on
      // stale "ready" state would NOT increment these.
      const bootstrapSpy = jest.spyOn(RuntimeBootstrap, "bootstrap");
      const hydrateSpy = jest.spyOn(RepositoryHydrationPipeline, "hydrate");
      const restoreSpy = jest.spyOn(DashboardRestorePipeline, "restore");

      // The session pipeline (bootstrap/hydration/restore) succeeds for
      // real on the first attempt; only the observer — which starts after
      // the session resolves — fails, so the failure surfaces without any
      // of the three sub-pipelines ever reporting "failed" themselves.
      jest
        .spyOn(observerApplication, "observeRuntime")
        .mockImplementationOnce(() => {
          throw new Error("observer failed to start");
        });

      const { getByTestId } = renderHarness();
      await waitFor(() => expect(getByTestId("failed")).toBeTruthy());

      expect(bootstrapSpy).toHaveBeenCalledTimes(1);
      expect(hydrateSpy).toHaveBeenCalledTimes(1);
      expect(restoreSpy).toHaveBeenCalledTimes(1);
      expect(getBootstrapStatus()).toBe(BOOTSTRAP_STATUS.ready);
      expect(getHydrationStatus()).toBe(HYDRATION_STATUS.ready);
      expect(getDashboardRestoreStatus()).toBe(DASHBOARD_RESTORE_STATUS.ready);
      expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.idle);

      await act(async () => {
        await getByTestId("retry").props.onPress();
      });

      await waitFor(() =>
        expect(getByTestId("authenticated-app")).toBeTruthy(),
      );

      // Retry re-ran every sub-pipeline from a clean slate rather than
      // reusing the "ready" state left over from before the observer
      // failed — proving the reset is unconditional and full, not scoped
      // only to whichever stage happened to fail.
      expect(bootstrapSpy).toHaveBeenCalledTimes(2);
      expect(hydrateSpy).toHaveBeenCalledTimes(2);
      expect(restoreSpy).toHaveBeenCalledTimes(2);
      expect(getBootstrapStatus()).toBe(BOOTSTRAP_STATUS.ready);
      expect(getHydrationStatus()).toBe(HYDRATION_STATUS.ready);
      expect(getDashboardRestoreStatus()).toBe(DASHBOARD_RESTORE_STATUS.ready);
      expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.ready);
      expect(getWriteThroughStatus()).not.toBe(RUNTIME_WRITE_THROUGH_STATUS.failed);
    });
  });

  describe("athlete isolation on retry", () => {
    it("reuses the current authenticated athleteId on retry", async () => {
      loginAs(ATHLETE_A);
      const hydrateSpy = jest.spyOn(hydrationApplication, "hydrateRuntime");
      jest
        .spyOn(bootstrapApplication, "bootstrapRuntime")
        .mockRejectedValueOnce(
          new RuntimeBootstrapError(
            "Composition Root bootstrap failed",
            "composition_root_failed",
          ),
        );

      const { getByTestId } = renderHarness();
      await waitFor(() => expect(getByTestId("failed")).toBeTruthy());

      await act(async () => {
        await getByTestId("retry").props.onPress();
      });

      await waitFor(() =>
        expect(getByTestId("authenticated-app")).toBeTruthy(),
      );
      expect(getByTestId("athleteId").props.children).toBe(ATHLETE_A.id);
      expect(hydrateSpy).toHaveBeenLastCalledWith({
        athleteIds: [ATHLETE_A.id],
      });
    });

    it("never reuses a stale athleteId across a logout/login cycle following a failed session", async () => {
      loginAs(ATHLETE_A);
      jest
        .spyOn(bootstrapApplication, "bootstrapRuntime")
        .mockRejectedValueOnce(
          new RuntimeBootstrapError(
            "Composition Root bootstrap failed",
            "composition_root_failed",
          ),
        );

      const { getByTestId, unmount } = renderHarness();
      await waitFor(() => expect(getByTestId("failed")).toBeTruthy());

      mockedSecureStorage.clearTokens.mockResolvedValue(undefined);
      await act(async () => {
        await getByTestId("logout").props.onPress();
      });
      await waitFor(() => expect(getByTestId("onboarding")).toBeTruthy());

      unmount();

      loginAs(ATHLETE_B);
      const hydrateSpy = jest.spyOn(hydrationApplication, "hydrateRuntime");
      const { getByTestId: getByTestIdB } = renderHarness();

      await waitFor(() =>
        expect(getByTestIdB("authenticated-app")).toBeTruthy(),
      );
      expect(getByTestIdB("athleteId").props.children).toBe(ATHLETE_B.id);
      expect(hydrateSpy).toHaveBeenCalledWith({ athleteIds: [ATHLETE_B.id] });
      expect(hydrateSpy).not.toHaveBeenCalledWith({
        athleteIds: [ATHLETE_A.id],
      });
    });
  });

  describe("navigation", () => {
    it("failed state blocks authenticated tabs from ever rendering", async () => {
      loginAs(ATHLETE_A);
      jest
        .spyOn(bootstrapApplication, "bootstrapRuntime")
        .mockRejectedValue(
          new RuntimeBootstrapError(
            "Composition Root bootstrap failed",
            "composition_root_failed",
          ),
        );

      const { getByTestId, queryByTestId } = renderHarness();
      await waitFor(() => expect(getByTestId("failed")).toBeTruthy());
      expect(queryByTestId("authenticated-app")).toBeNull();
    });

    it("retry transitions back through the loading state before resolving", async () => {
      loginAs(ATHLETE_A);
      jest
        .spyOn(bootstrapApplication, "bootstrapRuntime")
        .mockRejectedValueOnce(
          new RuntimeBootstrapError(
            "Composition Root bootstrap failed",
            "composition_root_failed",
          ),
        );

      const { getByTestId, queryByTestId } = renderHarness();
      await waitFor(() => expect(getByTestId("failed")).toBeTruthy());

      // `retrySession()` resets synchronously and sets status to
      // "starting" before its first `await` — invoking it inside a
      // synchronous `act()` lets us observe that intermediate render
      // (loading, not tabs) before the retry's real pipeline resolves.
      let retryPromise: Promise<void> | undefined;
      act(() => {
        retryPromise = getByTestId("retry").props.onPress();
      });

      expect(queryByTestId("failed")).toBeNull();
      expect(queryByTestId("authenticated-app")).toBeNull();
      expect(getByTestId("loading")).toBeTruthy();

      await act(async () => {
        await retryPromise;
      });

      await waitFor(() =>
        expect(getByTestId("authenticated-app")).toBeTruthy(),
      );
    });

    it("successful retry returns to the authenticated app", async () => {
      loginAs(ATHLETE_A);
      jest
        .spyOn(hydrationApplication, "hydrateRuntime")
        .mockRejectedValueOnce(
          new HydrationError(
            "Repository contract rejected hydration",
            "repository_contract_failed",
          ),
        );

      const { getByTestId } = renderHarness();
      await waitFor(() => expect(getByTestId("failed")).toBeTruthy());

      await act(async () => {
        await getByTestId("retry").props.onPress();
      });

      await waitFor(() =>
        expect(getByTestId("authenticated-app")).toBeTruthy(),
      );
    });
  });

  describe("logout after a failed session", () => {
    it("failed session -> logout -> login -> clean startup", async () => {
      loginAs(ATHLETE_A);
      jest
        .spyOn(bootstrapApplication, "bootstrapRuntime")
        .mockRejectedValueOnce(
          new RuntimeBootstrapError(
            "Composition Root bootstrap failed",
            "composition_root_failed",
          ),
        );

      const { getByTestId, unmount } = renderHarness();
      await waitFor(() => expect(getByTestId("failed")).toBeTruthy());

      mockedSecureStorage.clearTokens.mockResolvedValue(undefined);
      await act(async () => {
        await getByTestId("logout").props.onPress();
      });

      await waitFor(() => expect(getByTestId("onboarding")).toBeTruthy());
      expect(getBootstrapStatus()).toBe(BOOTSTRAP_STATUS.idle);
      expect(getHydrationStatus()).toBe(HYDRATION_STATUS.idle);
      expect(getDashboardRestoreStatus()).toBe(DASHBOARD_RESTORE_STATUS.idle);
      expect(getRuntimeObserverStatus()).toBe(RUNTIME_OBSERVER_STATUS.idle);

      unmount();

      loginAs(ATHLETE_A);
      const { getByTestId: getByTestIdAgain } = renderHarness();

      await waitFor(() =>
        expect(getByTestIdAgain("authenticated-app")).toBeTruthy(),
      );
      expect(getBootstrapStatus()).toBe(BOOTSTRAP_STATUS.ready);
    });

    it("does not leak Athlete A's failed-session state into Athlete B's session", async () => {
      loginAs(ATHLETE_A);
      jest
        .spyOn(hydrationApplication, "hydrateRuntime")
        .mockRejectedValueOnce(
          new HydrationError(
            "Repository contract rejected hydration",
            "repository_contract_failed",
          ),
        );

      const { getByTestId, unmount } = renderHarness();
      await waitFor(() => expect(getByTestId("failed")).toBeTruthy());

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

      const root = getCompositionRoot();
      expect(
        root.resolve("AthleteIdentityService").getAthleteIdentity(ATHLETE_A.id),
      ).toBeNull();
    });
  });
});
