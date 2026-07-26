import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../../theme/ThemeContext";
import { CoachScreen } from "../CoachScreen";
import { useCoachConversation } from "../../features/conversation/hooks/useCoachConversation";
import { useCoachPrompt } from "../../features/prompt-builder/hooks/useCoachPrompt";
import { createPromptContext } from "../../features/conversation/testSupport/fixtures";

jest.mock("../../theme/themeStorage", () => ({
  getStoredThemePreference: jest.fn().mockResolvedValue(null),
  setStoredThemePreference: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradient",
}));

jest.mock("../../features/conversation/hooks/useCoachConversation");
jest.mock("../../features/prompt-builder/hooks/useCoachPrompt");

jest.mock(
  "../../features/coach/services/createCoachConversationRuntime",
  () => ({
    createCoachConversationRuntime: () => ({
      service: {},
      coachingSession: {
        startSession: jest.fn(),
        continueSession: jest.fn(),
        endSession: jest.fn(),
        describeSession: jest.fn(),
      },
      configuration: {
        provider: { type: "local", apiKey: null },
        model: { id: "local-default" },
      },
      providerInfo: {
        type: "local",
        name: "Local Stub",
        model: {
          id: "local-stub-v1",
          name: "Local Stub v1",
          provider: "local",
        },
      },
      healthCheck: jest.fn().mockResolvedValue(true),
    }),
  }),
);

const mockedUseCoachConversation = useCoachConversation as jest.Mock;
const mockedUseCoachPrompt = useCoachPrompt as jest.Mock;

const safeAreaMetrics = {
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

function renderCoachScreen() {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>
        <CoachScreen />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("CoachScreen", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockedUseCoachPrompt.mockReturnValue({
      promptContext: createPromptContext(),
      loading: false,
      error: null,
    });
  });

  it("renders the conversation header and empty state", () => {
    const startConversation = jest.fn();
    mockedUseCoachConversation.mockReturnValue({
      conversation: {
        id: "conv-1",
        status: "active",
        messages: [],
        metadata: {
          title: "New conversation",
          messageCount: 0,
          lastMessageAt: null,
          createdAt: "2026-07-22T12:00:00.000Z",
          updatedAt: "2026-07-22T12:00:00.000Z",
        },
        session: {
          id: "sess-1",
          conversationId: "conv-1",
          startedAt: "2026-07-22T12:00:00.000Z",
          endedAt: null,
        },
        createdAt: "2026-07-22T12:00:00.000Z",
        updatedAt: "2026-07-22T12:00:00.000Z",
      },
      messages: [],
      status: "active",
      loading: false,
      error: null,
      startConversation,
      sendMessage: jest.fn(),
      retryMessage: jest.fn(),
      closeConversation: jest.fn(),
      deleteConversation: jest.fn(),
    });

    const { getByText } = renderCoachScreen();

    expect(getByText("EVOLVE Coach")).toBeTruthy();
    expect(getByText("Start a conversation")).toBeTruthy();
    expect(getByText("Ask me about your training")).toBeTruthy();
  });

  it("renders messages from useCoachConversation", () => {
    mockedUseCoachConversation.mockReturnValue({
      conversation: {
        id: "conv-1",
        status: "active",
        messages: [],
        metadata: {
          title: "Training chat",
          messageCount: 2,
          lastMessageAt: "2026-07-22T12:01:00.000Z",
          createdAt: "2026-07-22T12:00:00.000Z",
          updatedAt: "2026-07-22T12:01:00.000Z",
        },
        session: {
          id: "sess-1",
          conversationId: "conv-1",
          startedAt: "2026-07-22T12:00:00.000Z",
          endedAt: null,
        },
        createdAt: "2026-07-22T12:00:00.000Z",
        updatedAt: "2026-07-22T12:01:00.000Z",
      },
      messages: [
        {
          id: "msg-1",
          conversationId: "conv-1",
          role: "user",
          content: "How is my squat?",
          status: "sent",
          createdAt: "2026-07-22T12:00:00.000Z",
          updatedAt: "2026-07-22T12:00:00.000Z",
        },
        {
          id: "msg-2",
          conversationId: "conv-1",
          role: "assistant",
          content: "Focus on depth and bracing.",
          status: "sent",
          createdAt: "2026-07-22T12:01:00.000Z",
          updatedAt: "2026-07-22T12:01:00.000Z",
        },
      ],
      status: "active",
      loading: false,
      error: null,
      startConversation: jest.fn(),
      sendMessage: jest.fn(),
      retryMessage: jest.fn(),
      closeConversation: jest.fn(),
      deleteConversation: jest.fn(),
    });

    const { getByText } = renderCoachScreen();

    expect(getByText("Training chat")).toBeTruthy();
    expect(getByText("How is my squat?")).toBeTruthy();
    expect(getByText("Focus on depth and bracing.")).toBeTruthy();
  });

  it("sends messages through useCoachConversation", async () => {
    const sendMessage = jest.fn().mockResolvedValue(undefined);
    mockedUseCoachConversation.mockReturnValue({
      conversation: {
        id: "conv-1",
        status: "active",
        messages: [],
        metadata: {
          title: "New conversation",
          messageCount: 0,
          lastMessageAt: null,
          createdAt: "2026-07-22T12:00:00.000Z",
          updatedAt: "2026-07-22T12:00:00.000Z",
        },
        session: {
          id: "sess-1",
          conversationId: "conv-1",
          startedAt: "2026-07-22T12:00:00.000Z",
          endedAt: null,
        },
        createdAt: "2026-07-22T12:00:00.000Z",
        updatedAt: "2026-07-22T12:00:00.000Z",
      },
      messages: [],
      status: "active",
      loading: false,
      error: null,
      startConversation: jest.fn(),
      sendMessage,
      retryMessage: jest.fn(),
      closeConversation: jest.fn(),
      deleteConversation: jest.fn(),
    });

    const { getByLabelText } = renderCoachScreen();

    fireEvent.changeText(getByLabelText("Message input"), "Help my squat");
    fireEvent.press(getByLabelText("Send message"));

    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith("Help my squat"),
    );
  });

  it("shows a friendly error state", () => {
    mockedUseCoachConversation.mockReturnValue({
      conversation: null,
      messages: [],
      status: null,
      loading: false,
      error: "HTTP 500 Internal Server Error",
      startConversation: jest.fn(),
      sendMessage: jest.fn(),
      retryMessage: jest.fn(),
      closeConversation: jest.fn(),
      deleteConversation: jest.fn(),
    });

    const { getByText, queryByText } = renderCoachScreen();

    expect(getByText("Couldn’t load Coach")).toBeTruthy();
    expect(
      getByText("We couldn’t reach Coach right now. Please try again."),
    ).toBeTruthy();
    expect(queryByText("HTTP 500 Internal Server Error")).toBeNull();
  });
});
