import { render } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import {
  CoachMessageRoles,
  CoachMessageStatuses,
  createCoachMessage,
} from "../../models/CoachMessage";
import { MessageBubble } from "../MessageBubble";

jest.mock("../../../../theme/themeStorage", () => ({
  getStoredThemePreference: jest.fn().mockResolvedValue(null),
  setStoredThemePreference: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradient",
}));

const safeAreaMetrics = {
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

function renderBubble(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("Coach experience MessageBubble", () => {
  it("renders bold text instead of markdown markers", () => {
    const { getByText, queryByText } = renderBubble(
      <MessageBubble
        message={createCoachMessage({
          id: "coach-1",
          role: CoachMessageRoles.COACH,
          content: "Stay **tight** today.",
          createdAt: "2026-08-20T10:00:00.000Z",
        })}
      />,
    );

    expect(getByText("tight")).toBeTruthy();
    expect(queryByText("Stay **tight** today.")).toBeNull();
  });

  it("does not show escaped newline sequences", () => {
    const { getByText, queryByText } = renderBubble(
      <MessageBubble
        message={createCoachMessage({
          id: "coach-2",
          role: CoachMessageRoles.COACH,
          content: "First line\\nSecond line",
          createdAt: "2026-08-20T10:00:00.000Z",
        })}
      />,
    );

    expect(getByText("First line")).toBeTruthy();
    expect(getByText("Second line")).toBeTruthy();
    expect(queryByText("First line\\nSecond line")).toBeNull();
  });

  it("renders simple lists", () => {
    const { getByText, getAllByText } = renderBubble(
      <MessageBubble
        message={createCoachMessage({
          id: "coach-3",
          role: CoachMessageRoles.COACH,
          content: "- Sleep\n- Protein",
          createdAt: "2026-08-20T10:00:00.000Z",
        })}
      />,
    );

    expect(getByText("Sleep")).toBeTruthy();
    expect(getByText("Protein")).toBeTruthy();
    expect(getAllByText("•").length).toBeGreaterThan(0);
  });

  it("keeps a failed user bubble visible", () => {
    const { getByText } = renderBubble(
      <MessageBubble
        message={createCoachMessage({
          id: "user-1",
          role: CoachMessageRoles.USER,
          content: "Can I deload?",
          createdAt: "2026-08-20T10:00:00.000Z",
          status: CoachMessageStatuses.ERROR,
        })}
      />,
    );

    expect(getByText("Can I deload?")).toBeTruthy();
    expect(getByText("Couldn’t send")).toBeTruthy();
  });
});
