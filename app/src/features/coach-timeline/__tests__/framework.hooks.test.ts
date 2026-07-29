import { renderHook, waitFor } from "@testing-library/react-native";
import {
  useTimeline,
  useTimelineFilters,
  useTimelineSearch,
  useTimelineSnapshot,
  useTimelineStatistics,
} from "../hooks";
import {
  mockCoachTimelineService,
  resetMockCoachTimelineData,
} from "../providers/MockCoachTimelineService";
import { CoachTimelineViewModel } from "../viewmodels";

describe("coach-timeline framework hooks", () => {
  beforeEach(() => {
    resetMockCoachTimelineData();
  });

  it("useTimeline auto-loads", async () => {
    const { result } = renderHook(() =>
      useTimeline({ service: mockCoachTimelineService }),
    );
    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });
    expect(result.current.events.length).toBeGreaterThan(0);
  });

  it("slice hooks project from preloaded view model", async () => {
    const viewModel = new CoachTimelineViewModel({ service: mockCoachTimelineService });
    await viewModel.loadTimeline();

    const filters = renderHook(() => useTimelineFilters({ viewModel }));
    const stats = renderHook(() => useTimelineStatistics({ viewModel }));
    const snapshot = renderHook(() => useTimelineSnapshot({ viewModel }));
    const search = renderHook(() => useTimelineSearch({ viewModel }));

    expect(filters.result.current.filter).not.toBeNull();
    expect(stats.result.current.statistics).not.toBeNull();
    expect(snapshot.result.current.snapshot).not.toBeNull();
    expect(search.result.current.events.length).toBeGreaterThan(0);
  });
});
