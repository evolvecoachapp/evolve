import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { router } from "expo-router";
import type { CompletedWorkout } from "../../features/workout/models/CompletedWorkout";
import type { WorkoutHistoryRepository } from "../../features/workout/repository";
import { ThemeProvider } from "../../theme/ThemeContext";
import { WorkoutHistoryScreen } from "../WorkoutHistoryScreen";

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

function createWorkout(
  overrides: Partial<CompletedWorkout> & Pick<CompletedWorkout, "id" | "title" | "completedAt">,
): CompletedWorkout {
  return Object.freeze({
    sessionId: overrides.sessionId ?? overrides.id,
    programName: overrides.programName ?? "Hypertrophy Block",
    durationSeconds: overrides.durationSeconds ?? 2700,
    completedExercises: overrides.completedExercises ?? 2,
    totalExercises: overrides.totalExercises ?? 3,
    completedSets: overrides.completedSets ?? 8,
    skippedSets: overrides.skippedSets ?? 0,
    totalSets: overrides.totalSets ?? 8,
    completionPercent: overrides.completionPercent ?? 100,
    estimatedVolumeKg: overrides.estimatedVolumeKg ?? 920,
    averageCompletedReps: overrides.averageCompletedReps ?? 10,
    exercises: overrides.exercises ?? Object.freeze([]),
    ...overrides,
  });
}

function createRepository(
  sessions: readonly CompletedWorkout[] = [],
): WorkoutHistoryRepository {
  return {
    saveCompletedSession: jest.fn(),
    getCompletedSessions: jest.fn(async () => sessions),
    getCompletedSession: jest.fn(),
    getRecentSessions: jest.fn(),
    clearHistory: jest.fn(),
  };
}

function renderScreen(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("WorkoutHistoryScreen", () => {
  beforeEach(() => {
    (router.push as jest.Mock).mockClear();
  });

  it("shows an empty state when no workouts exist", async () => {
    const repository = createRepository([]);
    const { getByText } = renderScreen(
      <WorkoutHistoryScreen repository={repository} />,
    );

    await waitFor(() => {
      expect(getByText("No workouts yet")).toBeTruthy();
    });
    expect(getByText(/Finish a session/i)).toBeTruthy();
    expect(repository.getCompletedSessions).toHaveBeenCalledTimes(1);
  });

  it("renders workout cards from the mocked repository", async () => {
    const repository = createRepository([
      createWorkout({
        id: "session:1",
        title: "Upper A",
        completedAt: "2026-07-21T12:00:00.000Z",
      }),
      createWorkout({
        id: "session:2",
        title: "Lower A",
        completedAt: "2026-07-20T12:00:00.000Z",
        estimatedVolumeKg: 1500,
      }),
    ]);

    const { getByText, getByTestId } = renderScreen(
      <WorkoutHistoryScreen repository={repository} />,
    );

    await waitFor(() => {
      expect(getByTestId("workout-history-list")).toBeTruthy();
    });

    expect(getByText("Upper A")).toBeTruthy();
    expect(getByText("Lower A")).toBeTruthy();
    expect(getByText("920 kg")).toBeTruthy();
    expect(getByText("1.5k kg")).toBeTruthy();
  });

  it("preserves newest-to-oldest repository ordering in the list", async () => {
    const repository = createRepository([
      createWorkout({
        id: "newer",
        title: "Newest Session",
        completedAt: "2026-07-21T18:00:00.000Z",
      }),
      createWorkout({
        id: "older",
        title: "Oldest Session",
        completedAt: "2026-07-19T08:00:00.000Z",
      }),
    ]);

    const { getByText, toJSON } = renderScreen(
      <WorkoutHistoryScreen repository={repository} />,
    );

    await waitFor(() => {
      expect(getByText("Newest Session")).toBeTruthy();
    });

    const serialized = JSON.stringify(toJSON());
    expect(serialized.indexOf("Newest Session")).toBeLessThan(
      serialized.indexOf("Oldest Session"),
    );
  });

  it("navigates to the detail stub when a card is pressed", async () => {
    const repository = createRepository([
      createWorkout({
        id: "session:press",
        title: "Press Me",
        completedAt: "2026-07-21T12:00:00.000Z",
      }),
    ]);

    const { getByText } = renderScreen(
      <WorkoutHistoryScreen repository={repository} />,
    );

    await waitFor(() => {
      expect(getByText("Press Me")).toBeTruthy();
    });

    fireEvent.press(getByText("Press Me"));

    expect(router.push).toHaveBeenCalledWith({
      pathname: "/(app)/workout/detail",
      params: { sessionId: "session:press" },
    });
  });
});
