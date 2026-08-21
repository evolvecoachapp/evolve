import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuth } from "../../../auth/useAuth";
import { RUNTIME_SESSION_STATUS } from "../../../runtime/session/RuntimeSessionStatus";
import { useRuntimeSession } from "../../../runtime/session/RuntimeSessionContext";
import { ThemeProvider } from "../../../theme/ThemeContext";
import { mockProfileExperienceService, emptyMockProfileExperienceService } from "../providers/MockProfileExperienceService";
import { ProfileExperienceScreen } from "../screens";

const mockRouterPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockRouterPush, back: jest.fn(), replace: jest.fn() }),
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
}));

jest.mock("../../../theme/themeStorage", () => ({
  getStoredThemePreference: jest.fn().mockResolvedValue("light"),
  setStoredThemePreference: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradient",
}));

jest.mock("../../../auth/useAuth");

jest.mock("../../../runtime/session/RuntimeSessionContext", () => ({
  useRuntimeSession: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.Mock;
const mockedUseRuntimeSession = useRuntimeSession as jest.Mock;

const safeAreaMetrics = {
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

function renderScreen(service = mockProfileExperienceService) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>
        <ProfileExperienceScreen service={service} />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("ProfileExperienceScreen composition", () => {
  beforeEach(() => {
    mockRouterPush.mockClear();
    mockedUseAuth.mockReturnValue({
      user: { id: "athlete-001", username: "alex", first_name: "Alex", last_name: "Rivera" },
      isAuthenticated: true,
      signOut: jest.fn(),
    });
    mockedUseRuntimeSession.mockReturnValue({
      isStarting: false,
      status: RUNTIME_SESSION_STATUS.ready,
      retrySession: jest.fn(),
    });
  });

  it("shows the live theme preference instead of the possibly-stale identity appearance field", async () => {
    // Mock profile's appearancePreferences.theme is "dark", but the active
    // ThemeProvider preference (the real, user-facing setting) is "light".
    const { getByText, queryByText } = renderScreen();

    await waitFor(() => {
      expect(getByText("Light theme")).toBeTruthy();
    });

    expect(queryByText("Dark theme")).toBeNull();
  });

  it("links Goals and Notifications cards out to their owning tabs instead of duplicating editable state", async () => {
    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(getByText("Manage reminders and alerts in the Notifications tab")).toBeTruthy();
    });

    expect(getByText("Increase Squat 1RM")).toBeTruthy();
  });

  it("shows a setup CTA when the backend profile is incomplete", async () => {
    const { getByText } = renderScreen(emptyMockProfileExperienceService);

    await waitFor(() => {
      expect(getByText("Finish your athlete setup")).toBeTruthy();
    });

    fireEvent.press(getByText("Complete athlete setup"));
    expect(mockRouterPush).toHaveBeenCalledWith("/(app)/setup");
  });
});
