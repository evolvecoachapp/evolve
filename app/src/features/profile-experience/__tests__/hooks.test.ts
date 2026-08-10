import { act, renderHook, waitFor } from "@testing-library/react-native";
import { RUNTIME_SESSION_STATUS } from "../../../runtime/session/RuntimeSessionStatus";
import { useRuntimeSession } from "../../../runtime/session/RuntimeSessionContext";
import {
  emptyMockProfileExperienceService,
  mockProfileExperienceService,
} from "../providers/MockProfileExperienceService";
import {
  useCoachPreferences,
  useGoals,
  useNutritionPreferences,
  useProfile,
  useTrainingPreferences,
} from "../hooks";
import { ProfileExperienceViewModel } from "../viewmodels";

jest.mock("../../../runtime/session/RuntimeSessionContext", () => ({
  useRuntimeSession: jest.fn(),
}));

const mockedUseRuntimeSession = useRuntimeSession as jest.Mock;

describe("profile-experience hooks", () => {
  beforeEach(() => {
    mockedUseRuntimeSession.mockReturnValue({
      isStarting: false,
      status: RUNTIME_SESSION_STATUS.ready,
      retrySession: jest.fn(),
    });
  });
  it("useProfile loads the profile", async () => {
    const { result } = renderHook(() => useProfile({ service: mockProfileExperienceService }));
    await waitFor(() => expect(result.current.loading.isLoading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.profile?.displayName).toBe("Alex Rivera");
  });

  it("useProfile exposes empty state", async () => {
    const { result } = renderHook(() => useProfile({ service: emptyMockProfileExperienceService }));
    await waitFor(() => expect(result.current.loading.isLoading).toBe(false));
    expect(result.current.isEmpty).toBe(true);
  });

  it("useGoals projects goals from the view model", async () => {
    const viewModel = new ProfileExperienceViewModel({ service: mockProfileExperienceService });
    await viewModel.loadProfile();
    const { result } = renderHook(() => useGoals({ viewModel }));
    expect(result.current.goals.length).toBeGreaterThan(0);
  });

  it("useTrainingPreferences projects training prefs", async () => {
    const viewModel = new ProfileExperienceViewModel({ service: mockProfileExperienceService });
    await viewModel.loadProfile();
    const { result } = renderHook(() => useTrainingPreferences({ viewModel }));
    expect(result.current.trainingPreferences?.sessionsPerWeek).toBeGreaterThan(0);
  });

  it("useNutritionPreferences projects nutrition prefs", async () => {
    const viewModel = new ProfileExperienceViewModel({ service: mockProfileExperienceService });
    await viewModel.loadProfile();
    const { result } = renderHook(() => useNutritionPreferences({ viewModel }));
    expect(result.current.nutritionPreferences?.calorieTarget).toBeGreaterThan(0);
  });

  it("useCoachPreferences projects coach prefs", async () => {
    const viewModel = new ProfileExperienceViewModel({ service: mockProfileExperienceService });
    await viewModel.loadProfile();
    const { result } = renderHook(() => useCoachPreferences({ viewModel }));
    expect(result.current.coachPreferences?.coachingStyle).toBe("analytical");
  });

  it("useProfile allows updating training preferences", async () => {
    const viewModel = new ProfileExperienceViewModel({ service: mockProfileExperienceService });
    await viewModel.loadProfile();
    const { result } = renderHook(() => useProfile({ viewModel }));
    await act(async () => {
      await result.current.updateTrainingPreferences({
        level: "elite",
        sessionsPerWeek: 6,
        preferredDuration: 90,
        preferredTime: "Morning",
        focusAreas: ["Full Body"],
        equipmentAvailable: ["Full Gym"],
      });
    });
    expect(result.current.profile?.trainingPreferences.level).toBe("elite");
  });
});
