import { act, renderHook, waitFor } from "@testing-library/react-native";
import { RUNTIME_SESSION_STATUS } from "../../../runtime/session/RuntimeSessionStatus";
import { useRuntimeSession } from "../../../runtime/session/RuntimeSessionContext";
import { useHomeDashboard, usePullToRefresh, useQuickActions } from "../hooks";
import type { HomeService } from "../types/homeService";
import { HomeServiceError } from "../types/homeService";
import { mockHomeDashboardData } from "../mocks/dashboardData";

jest.mock("../../../runtime/session/RuntimeSessionContext", () => ({
  useRuntimeSession: jest.fn(),
}));

const mockedUseRuntimeSession = useRuntimeSession as jest.Mock;

const identity = Object.freeze({
  displayName: "Casey",
  initials: "CA",
  now: new Date("2026-07-29T09:00:00.000Z"),
});

function createService(options?: { fail?: boolean }): HomeService {
  return {
    providerId: "mock",
    async getDashboard() {
      if (options?.fail) {
        throw new HomeServiceError("hook failure", "mock");
      }
      return { ...mockHomeDashboardData };
    },
  };
}

describe("home hooks", () => {
  const successService = createService();
  const failingService = createService({ fail: true });

  beforeEach(() => {
    mockedUseRuntimeSession.mockReturnValue({
      isStarting: false,
      status: RUNTIME_SESSION_STATUS.ready,
      retrySession: jest.fn(),
    });
  });

  it("useHomeDashboard loads dashboard through the ViewModel", async () => {
    const { result } = renderHook(() =>
      useHomeDashboard({ service: successService, identity }),
    );

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.dashboard?.athlete.displayName).toBe("Casey");
    expect(result.current.workout?.durationMinutes).toBe(45);
  });

  it("useHomeDashboard surfaces provider errors", async () => {
    const { result } = renderHook(() =>
      useHomeDashboard({ service: failingService, identity }),
    );

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(result.current.error?.message).toContain("hook failure");
    expect(result.current.dashboard).toBeNull();
  });

  it("useHomeDashboard.refresh reloads data", async () => {
    const { result } = renderHook(() =>
      useHomeDashboard({ service: successService, identity }),
    );

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.loading.isRefreshing).toBe(false);
    expect(result.current.dashboard?.recovery.score).toBe(82);
  });

  it("useQuickActions returns actions from application API", async () => {
    const { result } = renderHook(() =>
      useQuickActions({ service: successService }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.actions.length).toBeGreaterThan(0);
    expect(result.current.error).toBeNull();
  });

  it("usePullToRefresh invokes onRefresh", async () => {
    const onRefresh = jest.fn(async () => undefined);
    const { result } = renderHook(() => usePullToRefresh({ onRefresh }));

    await act(async () => {
      await result.current.onRefresh();
    });

    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(result.current.refreshing).toBe(false);
  });
});
