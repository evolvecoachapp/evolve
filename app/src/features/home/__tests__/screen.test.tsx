import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuth } from "../../../auth/useAuth";
import { RUNTIME_SESSION_STATUS } from "../../../runtime/session/RuntimeSessionStatus";
import { useRuntimeSession } from "../../../runtime/session/RuntimeSessionContext";
import { ThemeProvider } from "../../../theme/ThemeContext";
import type { HomeDashboard as HomeDashboardDto } from "../types/homeDashboard";
import type { HomeService } from "../types/homeService";
import { HomeServiceError } from "../types/homeService";
import { mockHomeDashboardData } from "../mocks/dashboardData";
import { HomeDashboardScreen } from "../screens";

const mockRouterPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockRouterPush, back: jest.fn(), replace: jest.fn() }),
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
}));

jest.mock("../../../theme/themeStorage", () => ({
  getStoredThemePreference: jest.fn().mockResolvedValue(null),
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

jest.mock("../../recommendations/components", () => ({
  RecommendationWidget: () => null,
}));

const mockedUseAuth = useAuth as jest.Mock;
const mockedUseRuntimeSession = useRuntimeSession as jest.Mock;

const safeAreaMetrics = {
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

function createService(options?: {
  dto?: HomeDashboardDto;
  fail?: boolean;
}): HomeService {
  return {
    providerId: "mock",
    async getDashboard() {
      if (options?.fail) {
        throw new HomeServiceError("screen failure", "mock");
      }
      return { ...(options?.dto ?? mockHomeDashboardData) };
    },
  };
}

function renderScreen(service: HomeService) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>
        <HomeDashboardScreen service={service} />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("HomeDashboardScreen composition", () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue({
      user: {
        id: "user-1",
        username: "alex",
        first_name: "Alex",
        last_name: "Rivera",
      },
      isAuthenticated: true,
      signOut: jest.fn(),
    });
    mockedUseRuntimeSession.mockReturnValue({
      isStarting: false,
      status: RUNTIME_SESSION_STATUS.ready,
      retrySession: jest.fn(),
    });
  });

  it("renders loading skeleton then dashboard cards", async () => {
    const { getByText, queryByText } = renderScreen(createService());

    await waitFor(() => {
      expect(getByText("Alex")).toBeTruthy();
    });

    expect(getByText("Upper Body Strength")).toBeTruthy();
    expect(getByText("Calories")).toBeTruthy();
    expect(getByText("Protein")).toBeTruthy();
    expect(getByText("Recovery score")).toBeTruthy();
    expect(getByText("Quick Actions")).toBeTruthy();
    expect(queryByText("Couldn't load Home")).toBeNull();
  });

  it("renders a Notifications entry point that navigates to the Notification Center", async () => {
    mockRouterPush.mockClear();
    const { getByText, getByLabelText } = renderScreen(createService());

    await waitFor(() => {
      expect(getByText("Alex")).toBeTruthy();
    });

    const notificationsButton = getByLabelText("Notifications");
    await act(async () => {
      fireEvent.press(notificationsButton);
    });

    expect(mockRouterPush).toHaveBeenCalledWith("/(app)/notifications");
  });

  it("renders error state with retry", async () => {
    const { getByText, getByLabelText } = renderScreen(
      createService({ fail: true }),
    );

    await waitFor(() => {
      expect(getByText("Couldn't load Home")).toBeTruthy();
    });

    expect(getByText("screen failure")).toBeTruthy();
    expect(getByLabelText("Retry loading Home")).toBeTruthy();
    await act(async () => {
      fireEvent.press(getByLabelText("Retry loading Home"));
    });
  });

  it("renders empty state when dashboard has no cards", async () => {
    const emptyDto: HomeDashboardDto = {
      ...mockHomeDashboardData,
      workoutPreview: { name: "", muscleGroups: "", durationMinutes: 0 },
      nutritionSummary: {
        calories: { current: 0, target: 0 },
        protein: { current: 0, target: 0 },
        carbs: { current: 0, target: 0 },
        fat: { current: 0, target: 0 },
      },
      recovery: { score: -1, status: "", tip: "" },
      coachSummary: { message: "" },
    };

    const { getByText } = renderScreen(createService({ dto: emptyDto }));

    await waitFor(() => {
      expect(getByText("Nothing on your Home yet")).toBeTruthy();
    });
  });
});
