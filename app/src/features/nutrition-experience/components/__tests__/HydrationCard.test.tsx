import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { createHydrationProgress } from "../../models";
import { HydrationCard } from "../HydrationCard";

jest.mock("../../../../theme/themeStorage", () => ({
  getStoredThemePreference: jest.fn().mockResolvedValue(null),
  setStoredThemePreference: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

describe("HydrationCard", () => {
  it("logs a 250ml increment when the log button is pressed", () => {
    const onLogHydration = jest.fn();
    const { getByText } = render(
      <ThemeProvider>
        <HydrationCard
          hydration={createHydrationProgress({
            currentMl: 500,
            goalMl: 2000,
            remainingMl: 1500,
            completionPercent: 25,
            destination: null,
          })}
          onLogHydration={onLogHydration}
        />
      </ThemeProvider>,
    );

    fireEvent.press(getByText("+250 ml"));

    expect(onLogHydration).toHaveBeenCalledWith(250);
  });

  it("disables logging once the hydration goal is reached", () => {
    const onLogHydration = jest.fn();
    const { getByText } = render(
      <ThemeProvider>
        <HydrationCard
          hydration={createHydrationProgress({
            currentMl: 2000,
            goalMl: 2000,
            remainingMl: 0,
            completionPercent: 100,
            destination: null,
          })}
          onLogHydration={onLogHydration}
        />
      </ThemeProvider>,
    );

    fireEvent.press(getByText("+250 ml"));

    expect(onLogHydration).not.toHaveBeenCalled();
    expect(getByText("Goal reached")).toBeTruthy();
  });

  it("renders no logging control when onLogHydration is omitted", () => {
    const { queryByText } = render(
      <ThemeProvider>
        <HydrationCard
          hydration={createHydrationProgress({
            currentMl: 500,
            goalMl: 2000,
            remainingMl: 1500,
            completionPercent: 25,
            destination: null,
          })}
        />
      </ThemeProvider>,
    );

    expect(queryByText("+250 ml")).toBeNull();
  });
});
