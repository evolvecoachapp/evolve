import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../../../theme/ThemeContext";
import { AthleteSetupScreen } from "../AthleteSetupScreen";
import type { AthleteSetupValues } from "../models";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));
jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradient",
}));
jest.mock("../../../theme/themeStorage", () => ({
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
        onTouchEnd={() => onChange?.({ type: "set" }, new Date(1994, 1, 10))}
      />
    );
  };
  return MockDateTimePicker;
});

const safeAreaMetrics = {
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

function renderSetup(onComplete = jest.fn().mockResolvedValue(undefined)) {
  return {
    onComplete,
    ...render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <ThemeProvider>
          <AthleteSetupScreen onComplete={onComplete} />
        </ThemeProvider>
      </SafeAreaProvider>,
    ),
  };
}

function completeIdentity(utils: ReturnType<typeof renderSetup>) {
  fireEvent.changeText(utils.getByPlaceholderText("What should we call you?"), "Jordan");
  fireEvent.press(utils.getByTestId("athlete-setup-birth-date"));
  fireEvent(utils.getByTestId("athlete-setup-birth-date-picker"), "touchEnd");
  fireEvent.press(utils.getByText("Female"));
  fireEvent.press(utils.getByText("Continue"));
}

describe("AthleteSetupScreen", () => {
  it("keeps target weight hidden until a lose/gain goal is chosen", async () => {
    const screen = renderSetup();

    completeIdentity(screen);
    await waitFor(() => {
      expect(screen.getByPlaceholderText("e.g. 178")).toBeTruthy();
    });
    fireEvent.changeText(screen.getByPlaceholderText("e.g. 178"), "170");
    fireEvent.changeText(screen.getByPlaceholderText("e.g. 78"), "62");
    fireEvent.press(screen.getByText("Continue"));

    await waitFor(() => {
      expect(screen.getByText("What we're training for")).toBeTruthy();
    });
    expect(screen.queryByPlaceholderText("Where do you want to land?")).toBeNull();

    fireEvent.press(screen.getByText("Cut with intent"));
    expect(screen.getByPlaceholderText("Where do you want to land?")).toBeTruthy();

    fireEvent.press(screen.getByText("Stay sharp"));
    expect(screen.queryByPlaceholderText("Where do you want to land?")).toBeNull();
  });

  it("blocks continue when identity fields are missing", () => {
    const { getByText, queryByText } = renderSetup();
    fireEvent.press(getByText("Continue"));
    expect(getByText("First name is required.")).toBeTruthy();
    expect(queryByText("Your current numbers")).toBeNull();
  });

  it("submits mapped values after the final step", async () => {
    const onComplete = jest.fn().mockResolvedValue(undefined);
    const screen = renderSetup(onComplete);

    completeIdentity(screen);
    await waitFor(() => expect(screen.getByPlaceholderText("e.g. 178")).toBeTruthy());
    fireEvent.changeText(screen.getByPlaceholderText("e.g. 178"), "170");
    fireEvent.changeText(screen.getByPlaceholderText("e.g. 78"), "62");
    fireEvent.press(screen.getByText("Continue"));

    await waitFor(() => expect(screen.getByText("Consistent training")).toBeTruthy());
    fireEvent.press(screen.getByText("All-around fitness"));
    fireEvent.press(screen.getByText("Consistent training"));
    fireEvent.press(screen.getByText("Save athlete profile"));

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    const payload = onComplete.mock.calls[0][0] as AthleteSetupValues;
    expect(payload.firstName).toBe("Jordan");
    expect(payload.birthDate).toBe("1994-02-10");
    expect(payload.gender).toBe("female");
    expect(payload.heightCm).toBe("170");
    expect(payload.weightKg).toBe("62");
    expect(payload.goal).toBe("general_fitness");
    expect(payload.activityLevel).toBe("moderately_active");
    expect(payload.targetWeightKg).toBe("");
  });
});
