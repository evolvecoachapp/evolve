import { render } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { WorkoutRecord } from "../../models/WorkoutRecord";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { RecordCard } from "../RecordCard";

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

const workoutRecord: WorkoutRecord = Object.freeze({
  bestWeightKg: 140,
  bestEstimatedOneRMKg: 155,
  bestSessionVolumeKg: 1800,
  bestSingleSetVolumeKg: 840,
  bestReps: 12,
  lastRecordAt: "2026-07-21T12:00:00.000Z",
});

function renderCard(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("RecordCard", () => {
  it("renders personal record metrics", () => {
    const { getByText, getByTestId } = renderCard(
      <RecordCard workoutRecord={workoutRecord} />,
    );

    expect(getByTestId("record-card")).toBeTruthy();
    expect(getByText("Best Weight")).toBeTruthy();
    expect(getByText("140 kg")).toBeTruthy();
    expect(getByText("Best Estimated 1RM")).toBeTruthy();
    expect(getByText("155 kg")).toBeTruthy();
    expect(getByText("Best Session Volume")).toBeTruthy();
    expect(getByText("Best Single-Set Volume")).toBeTruthy();
    expect(getByText("Best Reps")).toBeTruthy();
    expect(getByText("12")).toBeTruthy();
  });
});
