import { act, renderHook, waitFor } from "@testing-library/react-native";
import { RUNTIME_SESSION_STATUS } from "../../../runtime/session/RuntimeSessionStatus";
import { useRuntimeSession } from "../../../runtime/session/RuntimeSessionContext";
import { createRecoveryDay } from "../models";
import {
  emptyMockRecoveryExperienceService,
  mockRecoveryExperienceService,
} from "../providers/MockRecoveryExperienceService";
import { useRecoveryDashboard } from "../hooks";
import { RecoveryExperienceViewModel } from "../viewmodels";

jest.mock("../../../runtime/session/RuntimeSessionContext", () => ({
  useRuntimeSession: jest.fn(),
}));

const mockedUseRuntimeSession = useRuntimeSession as jest.Mock;

const TODAY = createRecoveryDay({
  id: "today",
  isoDate: "2026-07-29",
  label: "Today",
  shortLabel: "Today",
  relativeLabel: "Today",
  isToday: true,
});

describe("recovery-experience hooks", () => {
  beforeEach(() => {
    mockedUseRuntimeSession.mockReturnValue({
      isStarting: false,
      status: RUNTIME_SESSION_STATUS.ready,
      retrySession: jest.fn(),
    });
  });

  it("useRecoveryDashboard loads the dashboard", async () => {
    const { result } = renderHook(() =>
      useRecoveryDashboard({ service: mockRecoveryExperienceService }),
    );
    await waitFor(() => expect(result.current.loading.isLoading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.dashboard?.headline).toContain("recovery");
  });

  it("useRecoveryDashboard exposes empty state", async () => {
    const { result } = renderHook(() =>
      useRecoveryDashboard({ service: emptyMockRecoveryExperienceService }),
    );
    await waitFor(() => expect(result.current.loading.isLoading).toBe(false));
    expect(result.current.isEmpty).toBe(true);
  });

  it("useRecoveryDashboard logs sleep through the view model", async () => {
    const viewModel = new RecoveryExperienceViewModel({
      service: mockRecoveryExperienceService,
      initialDay: TODAY,
    });
    await viewModel.loadDashboard();
    const { result } = renderHook(() => useRecoveryDashboard({ viewModel }));
    await act(async () => {
      await result.current.logSleep(7.5);
    });
    expect(result.current.dashboard?.sleep.hours).toBe(7.5);
  });

  it("useRecoveryDashboard updates readiness through the view model", async () => {
    const viewModel = new RecoveryExperienceViewModel({
      service: mockRecoveryExperienceService,
      initialDay: TODAY,
    });
    await viewModel.loadDashboard();
    const { result } = renderHook(() => useRecoveryDashboard({ viewModel }));
    await act(async () => {
      await result.current.updateReadiness(80);
    });
    expect(result.current.dashboard?.readiness.score).toBe(80);
  });
});
