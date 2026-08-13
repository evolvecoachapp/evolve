import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuth } from "../../../auth/useAuth";
import { RUNTIME_SESSION_STATUS } from "../../../runtime/session/RuntimeSessionStatus";
import { useRuntimeSession } from "../../../runtime/session/RuntimeSessionContext";
import { ThemeProvider } from "../../../theme/ThemeContext";
import {
  BACKEND_PENDING_CONVERSATION_ID,
  buildEmptyBackendCoachExperience,
} from "../mappers/mapBackendCoachToExperienceDto";
import { CoachExperienceScreen } from "../screens";
import type { CoachExperienceService } from "../types/coachExperienceService";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
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

const mockedUseAuth = useAuth as jest.Mock;
const mockedUseRuntimeSession = useRuntimeSession as jest.Mock;

const safeAreaMetrics = {
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

function createEmptyBackendService(
  sendMessage: CoachExperienceService["sendMessage"],
): CoachExperienceService {
  return {
    providerId: "backend",
    async getExperience() {
      return buildEmptyBackendCoachExperience();
    },
    sendMessage,
    async regenerateResponse({ messageId }) {
      return {
        id: messageId,
        role: "coach",
        content: "",
        createdAt: new Date().toISOString(),
      };
    },
    async pinInsight() {
      throw new Error("unsupported");
    },
    async dismissInsight() {
      throw new Error("unsupported");
    },
    async getConversationHistory() {
      throw new Error("unsupported");
    },
    async getDailyInsight() {
      throw new Error("unsupported");
    },
    async getRecommendations() {
      throw new Error("unsupported");
    },
    async getQuickActions() {
      throw new Error("unsupported");
    },
  };
}

function renderScreen(service: CoachExperienceService) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>
        <CoachExperienceScreen service={service} />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("CoachExperienceScreen empty conversation", () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue({
      user: { id: "user-1", username: "alex" },
      isAuthenticated: true,
      signOut: jest.fn(),
    });
    mockedUseRuntimeSession.mockReturnValue({
      isStarting: false,
      status: RUNTIME_SESSION_STATUS.ready,
      retrySession: jest.fn(),
    });
  });

  it("shows the empty state and composer so a fresh user can start chatting", async () => {
    const sendMessage = jest.fn(async ({ conversationId, message }) => {
      const now = new Date().toISOString();
      return {
        conversationId,
        userMessage: {
          id: `user-${now}`,
          role: "user" as const,
          content: message,
          createdAt: now,
        },
        coachMessage: {
          id: `coach-${now}`,
          role: "coach" as const,
          content: `Reply: ${message}`,
          createdAt: now,
        },
      };
    });
    const { getByText, getByLabelText, getByPlaceholderText } = renderScreen(
      createEmptyBackendService(sendMessage),
    );

    await waitFor(() => {
      expect(getByText("No coaching yet")).toBeTruthy();
    });

    expect(
      getByText(
        "Your contextual Coach conversation and insights will appear here.",
      ),
    ).toBeTruthy();
    expect(getByPlaceholderText("Ask your coach…")).toBeTruthy();
    expect(getByLabelText("Coach message input")).toBeTruthy();
    expect(getByLabelText("Send message")).toBeTruthy();

    fireEvent.changeText(
      getByLabelText("Coach message input"),
      "How should I train today?",
    );
    fireEvent.press(getByLabelText("Send message"));

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledWith({
        conversationId: BACKEND_PENDING_CONVERSATION_ID,
        message: "How should I train today?",
      });
    });
  });
});
