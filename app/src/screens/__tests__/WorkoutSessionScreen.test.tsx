import { render } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { WorkoutSession } from "../../features/training/application";
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
    expect(getByText(/Working · 8–10 reps · RIR 2 · 2:00 rest/)).toBeTruthy();
    expect(getAllByText("Linear · +2.5 kg when progressing").length).toBeGreaterThan(0);
    expect(getByText("Linear")).toBeTruthy();
  });

  it("shows a miss state when the session handoff is empty", () => {
    const { getByText } = renderScreen(
      <WorkoutSessionScreen sessionId="session:missing" session={null} />,
    );

    expect(getByText(/Workout session not found/i)).toBeTruthy();
  });
});
