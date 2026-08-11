import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { createNotificationSettings, type NotificationSettings } from "../../models";
import { NotificationSettingsCard } from "../NotificationSettingsCard";

jest.mock("../../../../theme/themeStorage", () => ({
  getStoredThemePreference: jest.fn().mockResolvedValue(null),
  setStoredThemePreference: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

const SETTINGS: NotificationSettings = createNotificationSettings({
  workoutReminders: true,
  nutritionReminders: false,
  hydrationReminders: true,
  recoveryReminders: true,
  sleepReminders: false,
  coachMessages: true,
  progressUpdates: false,
  globalDeliveryPolicy: "immediate",
  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",
});

describe("NotificationSettingsCard", () => {
  it("invokes onToggle with the flipped value when a preference chip is pressed", () => {
    const onToggle = jest.fn();
    const { getByLabelText } = render(
      <ThemeProvider>
        <NotificationSettingsCard settings={SETTINGS} onToggle={onToggle} />
      </ThemeProvider>,
    );

    fireEvent.press(getByLabelText("Workout Reminders: On"));

    expect(onToggle).toHaveBeenCalledWith("workoutReminders", false);
  });

  it("marks toggles disabled (but still visible) while saving", () => {
    const onToggle = jest.fn();
    const { getByLabelText } = render(
      <ThemeProvider>
        <NotificationSettingsCard settings={SETTINGS} onToggle={onToggle} saving />
      </ThemeProvider>,
    );

    const chip = getByLabelText("Workout Reminders: On");
    expect(chip.props.accessibilityState?.disabled).toBe(true);
    fireEvent.press(chip);

    expect(onToggle).not.toHaveBeenCalled();
  });

  it("renders read-only text values when onToggle is omitted", () => {
    const { queryByLabelText, getAllByText } = render(
      <ThemeProvider>
        <NotificationSettingsCard settings={SETTINGS} />
      </ThemeProvider>,
    );

    expect(queryByLabelText("On")).toBeNull();
    expect(getAllByText("On").length).toBeGreaterThan(0);
  });
});
