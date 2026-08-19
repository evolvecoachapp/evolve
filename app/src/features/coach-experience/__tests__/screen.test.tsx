import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
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
import { CoachExperienceError } from "../types/coachExperienceService";

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

  it("shows the pending user bubble and typing before the first reply arrives", async () => {
    let resolveSend!: (value: {
      conversationId: string;
      userMessage: {
        id: string;
        role: "user";
        content: string;
        createdAt: string;
      };
      coachMessage: {
        id: string;
        role: "coach";
        content: string;
        createdAt: string;
      };
    }) => void;
    const sendMessage = jest.fn(
      () =>
        new Promise<Awaited<ReturnType<CoachExperienceService["sendMessage"]>>>(
          (resolve) => {
            resolveSend = resolve;
          },
        ),
    );
    const { getByText, getByLabelText, queryByText } = renderScreen(
      createEmptyBackendService(sendMessage),
    );

    await waitFor(() => {
      expect(getByText("No coaching yet")).toBeTruthy();
    });

    fireEvent.changeText(
      getByLabelText("Coach message input"),
      "How should I train today?",
    );
    fireEvent.press(getByLabelText("Send message"));

    expect(queryByText("No coaching yet")).toBeNull();
    expect(getByText("How should I train today?")).toBeTruthy();
    expect(getByLabelText("Coach is typing")).toBeTruthy();
    expect(getByText("Coach is responding…")).toBeTruthy();
    expect(getByLabelText("Coach message input").props.value).toBe("");
    expect(getByLabelText("Coach message input").props.editable).toBe(false);

    await act(async () => {
      resolveSend({
        conversationId: "11111111-1111-4111-8111-111111111111",
        userMessage: {
          id: "user-1",
          role: "user",
          content: "How should I train today?",
          createdAt: "2026-08-20T10:00:00.000Z",
        },
        coachMessage: {
          id: "coach-1",
          role: "coach",
          content: "Keep intensity moderate today.",
          createdAt: "2026-08-20T10:00:01.000Z",
        },
      });
    });

    await waitFor(() => {
      expect(getByText("Keep intensity moderate today.")).toBeTruthy();
    });
    expect(queryByText("No coaching yet")).toBeNull();
    expect(getByText("How should I train today?")).toBeTruthy();
    expect(queryByText("Coach is responding…")).toBeNull();
    expect(getByText("Ready")).toBeTruthy();
  });

  it("reconciles the pending user bubble without duplicating it", async () => {
    const sendMessage = jest.fn(async ({ conversationId, message }) => {
      const now = new Date().toISOString();
      return {
        conversationId,
        userMessage: {
          id: "user-server",
          role: "user" as const,
          content: message,
          createdAt: now,
        },
        coachMessage: {
          id: "coach-server",
          role: "coach" as const,
          content: `Reply: ${message}`,
          createdAt: now,
        },
      };
    });
    const { getByText, getByLabelText, getAllByText, queryByText } = renderScreen(
      createEmptyBackendService(sendMessage),
    );

    await waitFor(() => {
      expect(getByText("No coaching yet")).toBeTruthy();
    });

    fireEvent.changeText(
      getByLabelText("Coach message input"),
      "How should I train today?",
    );
    fireEvent.press(getByLabelText("Send message"));

    await waitFor(() => {
      expect(getByText("Reply: How should I train today?")).toBeTruthy();
    });

    expect(getAllByText("How should I train today?")).toHaveLength(1);
    expect(queryByText("No coaching yet")).toBeNull();
  });

  it("keeps the user bubble and re-enables the composer after a failed send", async () => {
    const sendMessage = jest.fn(async () => {
      throw new CoachExperienceError("Coach could not respond", "backend");
    });
    const { getByText, getByLabelText, queryByText } = renderScreen(
      createEmptyBackendService(sendMessage),
    );

    await waitFor(() => {
      expect(getByText("No coaching yet")).toBeTruthy();
    });

    fireEvent.changeText(
      getByLabelText("Coach message input"),
      "How should I train today?",
    );
    fireEvent.press(getByLabelText("Send message"));

    await waitFor(() => {
      expect(getByText("Coach could not respond")).toBeTruthy();
    });

    expect(queryByText("No coaching yet")).toBeNull();
    expect(getByText("How should I train today?")).toBeTruthy();
    expect(getByText("Couldn’t send")).toBeTruthy();
    expect(getByLabelText("Coach message input").props.editable).not.toBe(false);

    fireEvent.changeText(
      getByLabelText("Coach message input"),
      "Trying again",
    );
    expect(getByLabelText("Send message")).toBeTruthy();
  });
});
