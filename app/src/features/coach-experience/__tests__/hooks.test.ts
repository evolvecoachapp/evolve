import { act, renderHook, waitFor } from "@testing-library/react-native";
import { RUNTIME_SESSION_STATUS } from "../../../runtime/session/RuntimeSessionStatus";
import { useRuntimeSession } from "../../../runtime/session/RuntimeSessionContext";
import {
  useCoachConversation,
  useCoachInsights,
  useCoachQuickActions,
  useCoachRecommendations,
  usePullToRefresh,
} from "../hooks";
import { mockCoachExperienceData } from "../mocks/coachExperienceData";
import type { CoachExperienceService } from "../types/coachExperienceService";
import { CoachExperienceError } from "../types/coachExperienceService";
import { CoachExperienceViewModel } from "../viewmodels";

jest.mock("../../../runtime/session/RuntimeSessionContext", () => ({
  useRuntimeSession: jest.fn(),
}));

const mockedUseRuntimeSession = useRuntimeSession as jest.Mock;

beforeEach(() => {
  mockedUseRuntimeSession.mockReturnValue({
    isStarting: false,
    status: RUNTIME_SESSION_STATUS.ready,
    retrySession: jest.fn(),
  });
});

function createService(options?: { fail?: boolean }): CoachExperienceService {
  const seed = {
    ...mockCoachExperienceData,
    conversation: {
      ...mockCoachExperienceData.conversation,
      messages: [...mockCoachExperienceData.conversation.messages],
    },
  };

  return {
    providerId: "mock",
    async getExperience() {
      if (options?.fail) {
        throw new CoachExperienceError("hook failure", "mock");
      }
      return {
        ...seed,
        conversation: {
          ...seed.conversation,
          messages: [...seed.conversation.messages],
        },
      };
    },
    async sendMessage({ conversationId, message }) {
      const now = new Date().toISOString();
      return {
        conversationId,
        userMessage: {
          id: `user-${now}`,
          role: "user",
          content: message,
          createdAt: now,
        },
        coachMessage: {
          id: `coach-${now}`,
          role: "coach",
          content: `Reply: ${message}`,
          createdAt: now,
        },
      };
    },
    async regenerateResponse({ messageId }) {
      return {
        id: messageId,
        role: "coach",
        content: "Hook regenerate",
        createdAt: new Date().toISOString(),
      };
    },
    async pinInsight(insightId) {
      return {
        ...seed.dailyInsight!,
        id: insightId,
        pinned: true,
        kind: "pinned",
      };
    },
    async dismissInsight() {},
    async getConversationHistory() {
      return [...(seed.conversationHistory ?? [])];
    },
    async getDailyInsight() {
      return seed.dailyInsight ? { ...seed.dailyInsight } : null;
    },
    async getRecommendations() {
      return [...(seed.recommendations ?? [])];
    },
    async getQuickActions() {
      return [...(seed.quickActions ?? [])];
    },
  };
}

describe("coach-experience hooks", () => {
  const successService = createService();
  const failingService = createService({ fail: true });

  it("useCoachConversation loads conversation through the ViewModel", async () => {
    const { result } = renderHook(() =>
      useCoachConversation({ service: successService }),
    );

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.messages.length).toBe(3);
    expect(result.current.conversation?.title).toBe("Today's Coaching");
  });

  it("useCoachConversation surfaces provider errors", async () => {
    const { result } = renderHook(() =>
      useCoachConversation({ service: failingService }),
    );

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    expect(result.current.error?.message).toContain("hook failure");
    expect(result.current.experience).toBeNull();
  });

  it("useCoachConversation.sendMessage appends conversation turns", async () => {
    const { result } = renderHook(() =>
      useCoachConversation({ service: successService }),
    );

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    const before = result.current.messages.length;

    await act(async () => {
      await result.current.sendMessage("Show weekly progress");
    });

    expect(result.current.messages.length).toBe(before + 2);
    expect(result.current.streamingPrepared).toBe(true);
  });

  it("useCoachConversation.sendMessage shows an optimistic bubble before the provider resolves", async () => {
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
    const service = createService();
    service.sendMessage = jest.fn(
      () =>
        new Promise((resolve) => {
          resolveSend = resolve;
        }),
    );
    const { result } = renderHook(() =>
      useCoachConversation({ service }),
    );

    await waitFor(() => {
      expect(result.current.loading.isLoading).toBe(false);
    });

    const before = result.current.messages.length;
    let pending: Promise<void> | undefined;
    act(() => {
      pending = result.current.sendMessage("Show weekly progress");
    });

    expect(result.current.messages.length).toBe(before + 1);
    expect(result.current.messages.at(-1)?.content).toBe("Show weekly progress");
    expect(result.current.typing.visible).toBe(true);
    expect(result.current.loading.isSending).toBe(true);

    await act(async () => {
      resolveSend({
        conversationId: "conv-today",
        userMessage: {
          id: "user-server",
          role: "user",
          content: "Show weekly progress",
          createdAt: "2026-08-20T10:00:00.000Z",
        },
        coachMessage: {
          id: "coach-server",
          role: "coach",
          content: "Reply: Show weekly progress",
          createdAt: "2026-08-20T10:00:01.000Z",
        },
      });
      await pending;
    });

    expect(
      result.current.messages.filter(
        (message) => message.content === "Show weekly progress",
      ),
    ).toHaveLength(1);
    expect(result.current.loading.isSending).toBe(false);
  });

  it("useCoachInsights projects daily and pinned insights", async () => {
    const viewModel = new CoachExperienceViewModel({
      service: successService,
    });
    await viewModel.loadConversation();

    const { result } = renderHook(() =>
      useCoachInsights({ viewModel }),
    );

    expect(result.current.dailyInsight?.kind).toBe("daily");
    expect(result.current.pinnedInsight?.pinned).toBe(true);

    await act(async () => {
      await result.current.pinInsight(result.current.dailyInsight!.id);
    });

    expect(result.current.pinnedInsight?.pinned).toBe(true);
  });

  it("useCoachRecommendations and useCoachQuickActions project actions", async () => {
    const viewModel = new CoachExperienceViewModel({
      service: successService,
    });
    await viewModel.loadConversation();

    const recommendations = renderHook(() =>
      useCoachRecommendations({ viewModel }),
    );
    const quickActions = renderHook(() =>
      useCoachQuickActions({ viewModel }),
    );

    expect(recommendations.result.current.recommendations.length).toBe(4);
    expect(quickActions.result.current.quickActions.length).toBe(7);

    await act(async () => {
      await quickActions.result.current.suggestActions();
    });

    expect(quickActions.result.current.quickActions.length).toBeGreaterThan(0);
  });

  it("usePullToRefresh invokes onRefresh", async () => {
    const onRefresh = jest.fn(async () => undefined);
    const { result } = renderHook(() => usePullToRefresh({ onRefresh }));

    await act(async () => {
      await result.current.onRefresh();
    });

    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(result.current.refreshing).toBe(false);
  });
});
