import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import type { ReminderType } from "../../models";
import { AddReminderRow } from "../AddReminderRow";

jest.mock("../../../../theme/themeStorage", () => ({
  getStoredThemePreference: jest.fn().mockResolvedValue(null),
  setStoredThemePreference: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

describe("AddReminderRow", () => {
  it("offers presets for reminder types that have not been created yet", () => {
    const { getByLabelText, queryByLabelText } = render(
      <ThemeProvider>
        <AddReminderRow existingTypes={new Set<ReminderType>(["workout"])} onAdd={jest.fn()} />
      </ThemeProvider>,
    );

    expect(queryByLabelText("Add Workout reminder")).toBeNull();
    expect(getByLabelText("Add Hydration reminder")).toBeTruthy();
  });

  it("invokes onAdd with the preset's reminder type when pressed", () => {
    const onAdd = jest.fn();
    const { getByLabelText } = render(
      <ThemeProvider>
        <AddReminderRow existingTypes={new Set<ReminderType>()} onAdd={onAdd} />
      </ThemeProvider>,
    );

    fireEvent.press(getByLabelText("Add Hydration reminder"));

    expect(onAdd).toHaveBeenCalledWith("hydration");
  });

  it("renders nothing once every preset type already has a reminder", () => {
    const allTypes = new Set<ReminderType>(["workout", "hydration", "sleep", "nutrition", "recovery"]);
    const { queryByText } = render(
      <ThemeProvider>
        <AddReminderRow existingTypes={allTypes} onAdd={jest.fn()} />
      </ThemeProvider>,
    );

    expect(queryByText("Add a reminder")).toBeNull();
  });

  it("disables preset chips while a save is already in flight", () => {
    const onAdd = jest.fn();
    const { getByLabelText } = render(
      <ThemeProvider>
        <AddReminderRow existingTypes={new Set<ReminderType>()} onAdd={onAdd} disabled />
      </ThemeProvider>,
    );

    const chip = getByLabelText("Add Workout reminder");
    expect(chip.props.accessibilityState?.disabled).toBe(true);
    fireEvent.press(chip);

    expect(onAdd).not.toHaveBeenCalled();
  });
});
