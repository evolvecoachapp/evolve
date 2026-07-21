import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { router } from "expo-router";
import type { WorkoutSession } from "../../features/training/application";
import { consumePendingSessionSummary } from "../../features/workout/services";
import { ThemeProvider } from "../../theme/ThemeContext";
import { WorkoutSessionScreen } from "../WorkoutSessionScreen";

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

function createSession(): WorkoutSession {
  return Object.freeze({
    id: "session:day:1",
    title: "Upper A",
    subtitle: "Hypertrophy Block · Chest, Upper Back",
    status: "ready",
    dayId: "day:1",
    dayIndex: 0,
    programTitle: "Hypertrophy Block",
    goalLabel: "Hypertrophy",
    primaryFocus: Object.freeze(["Chest", "Upper Back"]),
    exercises: Object.freeze([
      Object.freeze({
        id: "ex:1",
        name: "Barbell Bench Press",
        order: 0,
        sets: Object.freeze([
          Object.freeze({
            id: "set:1",
            order: 0,
            setType: "working",
            setTypeLabel: "Working",
            targetReps: Object.freeze({ min: 8, max: 10, label: "8–10" }),
            intensity: Object.freeze({
              metric: "rir",
              value: 2,
              label: "RIR 2",
            }),
            restSeconds: 120,
            prescriptionNotes: null,
            notes: null,
            completed: false,
            completedReps: null,
            completedLoad: null,
          }),
          Object.freeze({
            id: "set:2",
            order: 1,
            setType: "working",
            setTypeLabel: "Working",
            targetReps: Object.freeze({ min: 8, max: 10, label: "8–10" }),
            intensity: Object.freeze({
              metric: "rir",
              value: 2,
              label: "RIR 2",
            }),
            restSeconds: 120,
            prescriptionNotes: null,
            notes: null,
            completed: false,
            completedReps: null,
            completedLoad: null,
          }),
        ]),
        notes: null,
        completed: false,
        skipped: false,
        progressionReference: "Linear · +2.5 kg when progressing",
        supersetGroup: null,
      }),
    ]),
    progressionReferences: Object.freeze([
      Object.freeze({
        id: "prog:1",
        model: "linear",
        modelLabel: "Linear",
        summary: "Linear · +2.5 kg when progressing",
        incrementLabel: "+2.5 kg",
        cycleLengthWeeks: 4,
        deloadFrequencyWeeks: 4,
        description: null,
      }),
    ]),
    notes: null,
    startedAt: null,
    completedAt: null,
  });
}

function renderScreen(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("WorkoutSessionScreen", () => {
  it("renders session title, subtitle, exercises, sets, and progression", () => {
    const session = createSession();
    const { getByText, getAllByText } = renderScreen(
      <WorkoutSessionScreen sessionId={session.id} session={session} />,
    );

    expect(getByText("Upper A")).toBeTruthy();
    expect(getByText("Hypertrophy Block · Chest, Upper Back")).toBeTruthy();
    expect(getByText("Barbell Bench Press")).toBeTruthy();
    expect(getAllByText(/Working · 8–10 reps · RIR 2 · 2:00 rest/).length).toBe(2);
    expect(getAllByText("Linear · +2.5 kg when progressing").length).toBeGreaterThan(0);
    expect(getByText("Linear")).toBeTruthy();
    expect(getByText("Ready")).toBeTruthy();
    expect(getByText("Session progress")).toBeTruthy();
  });

  it("marks a set complete, starts rest, and highlights the next active set", () => {
    const session = createSession();
    const { getByLabelText, getByText, getAllByText, queryByText } = renderScreen(
      <WorkoutSessionScreen sessionId={session.id} session={session} />,
    );

    expect(getByText("Active set")).toBeTruthy();

    fireEvent.press(getByLabelText("Complete set 1"));

    expect(getByText("Completed")).toBeTruthy();
    expect(getAllByText("In progress").length).toBeGreaterThan(0);
    expect(getByLabelText("Completed reps for set 1")).toBeTruthy();
    expect(getByLabelText("Completed load for set 1")).toBeTruthy();
    expect(getByText("1 / 2 sets")).toBeTruthy();
    expect(queryByText("Ready")).toBeNull();
    expect(getByText("Rest")).toBeTruthy();
    expect(getByLabelText("Pause rest timer")).toBeTruthy();
    expect(getByLabelText("Skip rest timer")).toBeTruthy();
    expect(getByText("Up next")).toBeTruthy();
    expect(getByText("Working · Set 2")).toBeTruthy();

    fireEvent.press(getByLabelText("Pause rest timer"));
    expect(getByLabelText("Resume rest timer")).toBeTruthy();

    fireEvent.press(getByLabelText("Skip rest timer"));
    expect(queryByText("Rest")).toBeNull();

    fireEvent.changeText(getByLabelText("Completed reps for set 1"), "10");
    fireEvent.changeText(getByLabelText("Completed load for set 1"), "62.5");

    fireEvent.press(getByLabelText("Unmark set 1"));
    expect(getByLabelText("Complete set 1")).toBeTruthy();
  });

  it("skips and restores a set without starting rest", () => {
    const session = createSession();
    const { getByLabelText, getByText, queryByText } = renderScreen(
      <WorkoutSessionScreen sessionId={session.id} session={session} />,
    );

    fireEvent.press(getByLabelText("Skip set 2"));
    expect(getByText("Skipped")).toBeTruthy();
    expect(queryByText("Rest")).toBeNull();

    fireEvent.press(getByLabelText("Restore set 2"));
    expect(getByLabelText("Complete set 2")).toBeTruthy();
  });

  it("shows a miss state when the session handoff is empty", () => {
    const { getByText } = renderScreen(
      <WorkoutSessionScreen sessionId="session:missing" session={null} />,
    );

    expect(getByText(/Workout session not found/i)).toBeTruthy();
  });

  it("exposes Finish Workout when all sets are accounted and hands off a summary", () => {
    const session = createSession();
    const { getByLabelText, getByText, queryByText } = renderScreen(
      <WorkoutSessionScreen sessionId={session.id} session={session} />,
    );

    expect(queryByText("Finish Workout")).toBeNull();

    fireEvent.press(getByLabelText("Complete set 1"));
    fireEvent.changeText(getByLabelText("Completed load for set 1"), "60");
    fireEvent.press(getByLabelText("Skip set 2"));

    expect(getByText("Complete")).toBeTruthy();
    expect(getByText("Finish Workout")).toBeTruthy();
    expect(getByText(/1 logged · 1 skipped/)).toBeTruthy();

    fireEvent.press(getByText("Finish Workout"));

    expect(router.push).toHaveBeenCalledWith({
      pathname: "/(app)/workout/complete",
      params: { sessionId: session.id },
    });

    const summary = consumePendingSessionSummary(session.id);
    expect(summary).not.toBeNull();
    expect(summary?.title).toBe("Upper A");
    expect(summary?.completedSets).toBe(1);
    expect(summary?.skippedSets).toBe(1);
    expect(summary?.completionPercent).toBe(100);
    expect(summary?.estimatedVolumeKg).toBe(480);
    expect(session.status).toBe("ready");
    expect(session.completedAt).toBeNull();
  });
});
