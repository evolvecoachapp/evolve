import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { router } from "expo-router";
import type { WorkoutSessionSummary } from "../../features/workout/types/workoutSessionSummary";
import { ThemeProvider } from "../../theme/ThemeContext";
import { WorkoutSessionCompleteScreen } from "../WorkoutSessionCompleteScreen";

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
}));

jest.mock("../../theme/themeStorage", () => ({
  getStoredThemePreference: jest.fn().mockResolvedValue(null),
  setStoredThemePreference: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

const safeAreaMetrics = {
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

const summary: WorkoutSessionSummary = Object.freeze({
  sessionId: "session:day:1",
  title: "Upper A",
  programName: "Hypertrophy Block",
  durationSeconds: 2730,
  completedExercises: 1,
  totalExercises: 2,
  completedSets: 2,
  skippedSets: 1,
  totalSets: 3,
  completionPercent: 100,
  estimatedVolumeKg: 920,
  averageCompletedReps: 10,
  completedAt: "2026-07-21T10:45:30.000Z",
});

function renderScreen(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("WorkoutSessionCompleteScreen", () => {
  it("renders summary metrics and returns to workout on Done", () => {
    const { getByText } = renderScreen(
      <WorkoutSessionCompleteScreen summary={summary} />,
    );

    expect(getByText("Upper A")).toBeTruthy();
    expect(getByText("45 min")).toBeTruthy();
    expect(getByText("920 kg")).toBeTruthy();
    expect(getByText("2 / 3")).toBeTruthy();
    expect(getByText("1")).toBeTruthy();
    expect(getByText("1 / 2")).toBeTruthy();
    expect(getByText("100%")).toBeTruthy();
    expect(getByText("10")).toBeTruthy();

    fireEvent.press(getByText("Done"));
    expect(router.replace).toHaveBeenCalledWith("/(app)/(tabs)/workout");
  });

  it("shows a miss state when summary is unavailable", () => {
    const { getByText } = renderScreen(
      <WorkoutSessionCompleteScreen summary={null} />,
    );

    expect(getByText(/Workout summary unavailable/i)).toBeTruthy();
  });
});
