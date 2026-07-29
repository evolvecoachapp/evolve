import { renderHook, waitFor } from "@testing-library/react-native";
import {
  emptyMockProgressAnalyticsService,
  mockProgressAnalyticsService,
} from "../providers/MockProgressAnalyticsService";
import {
  useAnalytics,
  useAnalyticsSnapshot,
  useBodyMeasurements,
  useGoalProgress,
  useStrengthProgress,
  useWorkoutHistory,
} from "../hooks";
import { ProgressAnalyticsViewModel } from "../viewmodels";

describe("progress-analytics hooks", () => {
  it("useAnalytics loads analytics", async () => {
    const { result } = renderHook(() => useAnalytics({ service: mockProgressAnalyticsService }));
    await waitFor(() => expect(result.current.loading.isLoading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.summary).not.toBeNull();
  });

  it("useAnalytics exposes empty state", async () => {
    const { result } = renderHook(() => useAnalytics({ service: emptyMockProgressAnalyticsService }));
    await waitFor(() => expect(result.current.loading.isLoading).toBe(false));
    expect(result.current.isEmpty).toBe(true);
  });

  it("useWorkoutHistory projects history", async () => {
    const viewModel = new ProgressAnalyticsViewModel({ service: mockProgressAnalyticsService });
    await viewModel.loadAnalytics();
    const { result } = renderHook(() => useWorkoutHistory({ viewModel }));
    expect(result.current.workoutHistory?.entries.length).toBeGreaterThan(0);
  });

  it("useStrengthProgress projects strength", async () => {
    const viewModel = new ProgressAnalyticsViewModel({ service: mockProgressAnalyticsService });
    await viewModel.loadAnalytics();
    const { result } = renderHook(() => useStrengthProgress({ viewModel }));
    expect(result.current.strengthProgress).not.toBeNull();
  });

  it("useBodyMeasurements projects measurements", async () => {
    const viewModel = new ProgressAnalyticsViewModel({ service: mockProgressAnalyticsService });
    await viewModel.loadAnalytics();
    const { result } = renderHook(() => useBodyMeasurements({ viewModel }));
    expect(result.current.bodyMeasurements.length).toBeGreaterThan(0);
  });

  it("useGoalProgress projects goals", async () => {
    const viewModel = new ProgressAnalyticsViewModel({ service: mockProgressAnalyticsService });
    await viewModel.loadAnalytics();
    const { result } = renderHook(() => useGoalProgress({ viewModel }));
    expect(result.current.goalProgress.length).toBeGreaterThan(0);
  });

  it("useAnalyticsSnapshot projects snapshot", async () => {
    const viewModel = new ProgressAnalyticsViewModel({ service: mockProgressAnalyticsService });
    await viewModel.loadAnalytics();
    const { result } = renderHook(() => useAnalyticsSnapshot({ viewModel }));
    expect(result.current.snapshot).not.toBeNull();
  });
});
