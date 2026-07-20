import { renderHook, act } from "@testing-library/react-native";
import {
  createWorkoutPreviewProvider,
  type WorkoutProgramPreview,
} from "../../../training/application";
import { HYPERTROPHY_ATHLETE } from "../../../training/application/fixtures";
import { useWorkoutProgramPreview } from "../useWorkoutProgramPreview";

describe("useWorkoutProgramPreview", () => {
  it("returns a generated preview and selects the first training day", () => {
    const provider = createWorkoutPreviewProvider();
    const { result } = renderHook(() =>
      useWorkoutProgramPreview({ profile: HYPERTROPHY_ATHLETE, provider }),
    );

    expect(result.current.error).toBeNull();
    expect(result.current.preview).not.toBeNull();
    expect(result.current.preview?.title).toBe(HYPERTROPHY_ATHLETE.name);
    expect(result.current.selectedDay).not.toBeNull();
    expect(result.current.selectedDay?.isRestDay).toBe(false);
  });

  it("updates the selected day when selectDay is called", () => {
    const provider = createWorkoutPreviewProvider();
    const { result } = renderHook(() =>
      useWorkoutProgramPreview({ profile: HYPERTROPHY_ATHLETE, provider }),
    );

    const preview = result.current.preview as WorkoutProgramPreview;
    const restDay = preview.weeklySchedule.days.find((day) => day.isRestDay);
    expect(restDay).toBeDefined();

    act(() => {
      result.current.selectDay(restDay!.id);
    });

    expect(result.current.selectedDay?.id).toBe(restDay!.id);
    expect(result.current.selectedDay?.isRestDay).toBe(true);
  });
});
