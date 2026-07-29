import { act, renderHook, waitFor } from "@testing-library/react-native";
import { emptyMockProgressExperienceService, mockProgressExperienceService } from "../providers/MockProgressExperienceService";
import { useCoachInsights, useProgressDashboard, useTimeRange } from "../hooks";
import { TimeRanges } from "../models";
import { ProgressExperienceViewModel } from "../viewmodels";

describe("progress-experience hooks", () => {
  it("useProgressDashboard loads the dashboard", async () => {
    const { result } = renderHook(() => useProgressDashboard({ service: mockProgressExperienceService }));
    await waitFor(() => expect(result.current.loading.isLoading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.dashboard?.headline).toContain("1RM");
  });

  it("useProgressDashboard exposes empty state", async () => {
    const { result } = renderHook(() => useProgressDashboard({ service: emptyMockProgressExperienceService }));
    await waitFor(() => expect(result.current.loading.isLoading).toBe(false));
    expect(result.current.isEmpty).toBe(true);
  });

  it("useTimeRange changes the selected range through the ViewModel", async () => {
    const viewModel = new ProgressExperienceViewModel({ service: mockProgressExperienceService });
    await viewModel.loadDashboard();
    const { result } = renderHook(() => useTimeRange({ viewModel }));
    await act(async () => { await result.current.changeRange(TimeRanges.LAST_7_DAYS); });
    expect(result.current.timeRange).toBe(TimeRanges.LAST_7_DAYS);
  });

  it("useCoachInsights projects coach insights", async () => {
    const viewModel = new ProgressExperienceViewModel({ service: mockProgressExperienceService });
    await viewModel.loadDashboard();
    const { result } = renderHook(() => useCoachInsights({ viewModel }));
    expect(result.current.insights.length).toBeGreaterThan(0);
    await act(async () => { await result.current.loadCoachInsights(); });
    expect(result.current.insights[0]?.title).toContain("Bench");
  });
});
