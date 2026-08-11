import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { createReminder, createReminderSchedule, type Reminder } from "../../models";
import { ReminderCard } from "../ReminderCard";

jest.mock("../../../../theme/themeStorage", () => ({
  getStoredThemePreference: jest.fn().mockResolvedValue(null),
  setStoredThemePreference: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

function buildReminder(overrides: Partial<Reminder> = {}): Reminder {
  return createReminder({
    id: "reminder:1",
    type: "workout",
    title: "Evening workout",
    message: "Time for your session.",
    schedule: createReminderSchedule({
      dayOfWeek: Object.freeze([1, 3, 5]),
      timeOfDay: "18:00",
      deliveryPolicy: "scheduled",
      enabled: true,
    }),
    deliveryPolicy: "scheduled",
    enabled: true,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    ...overrides,
  });
}

describe("ReminderCard", () => {
  it("invokes onToggleEnabled when the status chip is pressed", () => {
    const onToggleEnabled = jest.fn();
    const { getByLabelText } = render(
      <ThemeProvider>
        <ReminderCard reminder={buildReminder()} onToggleEnabled={onToggleEnabled} />
      </ThemeProvider>,
    );

    fireEvent.press(getByLabelText("Active"));

    expect(onToggleEnabled).toHaveBeenCalledTimes(1);
  });

  it("does not toggle while disabled (a save is already in flight)", () => {
    const onToggleEnabled = jest.fn();
    const { getByLabelText } = render(
      <ThemeProvider>
        <ReminderCard
          reminder={buildReminder()}
          onToggleEnabled={onToggleEnabled}
          disabled
        />
      </ThemeProvider>,
    );

    const chip = getByLabelText("Active");
    expect(chip.props.accessibilityState?.disabled).toBe(true);
    fireEvent.press(chip);

    expect(onToggleEnabled).not.toHaveBeenCalled();
  });

  it("invokes onRemove when Remove is pressed", () => {
    const onRemove = jest.fn();
    const { getByLabelText } = render(
      <ThemeProvider>
        <ReminderCard reminder={buildReminder()} onRemove={onRemove} />
      </ThemeProvider>,
    );

    fireEvent.press(getByLabelText("Remove Evening workout reminder"));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("renders a non-interactive status badge when no onToggleEnabled is supplied", () => {
    const { queryByLabelText } = render(
      <ThemeProvider>
        <ReminderCard reminder={buildReminder({ enabled: false })} />
      </ThemeProvider>,
    );

    expect(queryByLabelText("Paused")).toBeNull();
  });
});
