import { act, renderHook, waitFor } from "@testing-library/react-native";
import { RUNTIME_SESSION_STATUS } from "../../../runtime/session/RuntimeSessionStatus";
import { useRuntimeSession } from "../../../runtime/session/RuntimeSessionContext";
import {
  emptyMockGoalProgressExperienceService,
  mockGoalProgressExperienceService,
} from "../providers/MockGoalProgressExperienceService";
import { useGoalProgressDashboard } from "../hooks";
import { GoalProgressExperienceViewModel } from "../viewmodels";

jest.mock("../../../runtime/session/RuntimeSessionContext", () => ({
  useRuntimeSession: jest.fn(),
}));

const mockedUseRuntimeSession = useRuntimeSession as jest.Mock;

describe("goal-progress-experience hooks", () => {
  beforeEach(() => {
    mockedUseRuntimeSession.mockReturnValue({
      isStarting: false,
      status: RUNTIME_SESSION_STATUS.ready,
      retrySession: jest.fn(),
    });
  });

  it("useGoalProgressDashboard loads the dashboard", async () => {
    const { result } = renderHook(() =>
      useGoalProgressDashboard({ service: mockGoalProgressExperienceService }),
    );
    await waitFor(() => expect(result.current.loading.isLoading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.dashboard?.goalId).toBeTruthy();
  });

  it("useGoalProgressDashboard exposes empty state", async () => {
    const { result } = renderHook(() =>
      useGoalProgressDashboard({ service: emptyMockGoalProgressExperienceService }),
    );
    await waitFor(() => expect(result.current.loading.isLoading).toBe(false));
    expect(result.current.isEmpty).toBe(true);
  });

  it("useGoalProgressDashboard updates progress through the view model", async () => {
    const viewModel = new GoalProgressExperienceViewModel({
      service: mockGoalProgressExperienceService,
    });
    await viewModel.loadDashboard();
    const { result } = renderHook(() => useGoalProgressDashboard({ viewModel }));
    await act(async () => {
      await result.current.updateProgress();
    });
    expect(result.current.dashboard?.completionPercent).toBeGreaterThan(0);
  });
});
