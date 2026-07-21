import { render } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { RecordSummary } from "../../models/RecordSummary";
import type { WorkoutRecord } from "../../models/WorkoutRecord";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { RecordHero } from "../RecordHero";

jest.mock("../../../../theme/themeStorage", () => ({
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

const summary: RecordSummary = Object.freeze({
  totalLifetimeVolumeKg: 4200,
  totalLifetimeSessions: 12,
  exerciseCount: 4,
  lastRecordAt: "2026-07-21T12:00:00.000Z",
});

const workoutRecord: WorkoutRecord = Object.freeze({
  bestWeightKg: 140,
  bestEstimatedOneRMKg: 155,
  bestSessionVolumeKg: 1800,
  bestSingleSetVolumeKg: 840,
  bestReps: 12,
  lastRecordAt: "2026-07-21T12:00:00.000Z",
});

function renderHero(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("RecordHero", () => {
  it("renders lifetime sessions and top lift highlights", () => {
    const { getByText, getByTestId } = renderHero(
      <RecordHero summary={summary} workoutRecord={workoutRecord} />,
    );

    expect(getByTestId("record-hero")).toBeTruthy();
    expect(getByText("Sessions")).toBeTruthy();
    expect(getByText("12")).toBeTruthy();
    expect(getByText("Best Weight")).toBeTruthy();
    expect(getByText("140 kg")).toBeTruthy();
    expect(getByText("Best Est. 1RM")).toBeTruthy();
    expect(getByText("155 kg")).toBeTruthy();
    expect(getByText("Lifetime Volume")).toBeTruthy();
    expect(getByText("4.2k kg")).toBeTruthy();
  });
});
