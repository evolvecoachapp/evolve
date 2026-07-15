import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { ProfileEditForm } from "../ProfileEditForm";
import type { ProfileFormValues } from "../../utils";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));
jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradient",
}));
jest.mock("../../../../theme/themeStorage", () => ({
  getStoredThemePreference: jest.fn().mockResolvedValue(null),
  setStoredThemePreference: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@react-native-community/datetimepicker", () => {
  const MockDateTimePicker = ({
    onChange,
    testID,
  }: {
    onChange?: (event: { type: string }, date?: Date) => void;
    testID?: string;
  }) => {
    const { View } = jest.requireActual<typeof import("react-native")>("react-native");
    return (
      <View
        testID={testID}
        onTouchEnd={() => onChange?.({ type: "set" }, new Date(2002, 0, 18))}
      />
    );
  };

  return MockDateTimePicker;
});

const baseForm: ProfileFormValues = {
  displayName: "Alex Rivera",
  firstName: "Alex",
  lastName: "Rivera",
  birthDate: "",
  gender: null,
  heightCm: "178",
  weightKg: "78",
  goal: null,
  bio: "",
};

const safeAreaMetrics = {
  insets: { top: 0, right: 0, left: 0, bottom: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

function renderForm(
  overrides: Partial<ProfileFormValues> = {},
  onFieldChange = jest.fn(),
) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>
        <ProfileEditForm
          email="coach@evolve.app"
          form={{ ...baseForm, ...overrides }}
          fieldErrors={{}}
          onFieldChange={onFieldChange}
        />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("ProfileEditForm birth date picker", () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Platform.OS = originalPlatform;
  });

  it("shows a placeholder until a date is selected", () => {
    const { getByText } = renderForm();

    expect(getByText("Select date of birth")).toBeTruthy();
  });

  it("displays the selected date in a localized human-readable format", () => {
    const { getByText } = renderForm({ birthDate: "2002-01-18" });

    expect(getByText("January 18, 2002")).toBeTruthy();
  });

  it("opens the native picker when the field is tapped", () => {
    const { getByTestId, queryByTestId } = renderForm();

    expect(queryByTestId("birth-date-picker")).toBeNull();

    fireEvent.press(getByTestId("birth-date-picker-trigger"));

    expect(getByTestId("birth-date-picker")).toBeTruthy();
  });

  it("stores the picked date as ISO YYYY-MM-DD", () => {
    const onFieldChange = jest.fn();
    const { getByTestId } = renderForm({}, onFieldChange);

    fireEvent.press(getByTestId("birth-date-picker-trigger"));
    fireEvent(getByTestId("birth-date-picker"), "touchEnd");

    expect(onFieldChange).toHaveBeenCalledWith("birthDate", "2002-01-18");
  });
});
