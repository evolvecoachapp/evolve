import { CoachExperienceViewModel } from "../viewmodels";
import {
  emptyCoachExperienceData,
  mockCoachExperienceData,
} from "../mocks/coachExperienceData";
import { CoachLoadingStatuses } from "../models/CoachLoadingState";
import type { CoachExperienceDto } from "../types/coachExperienceDto";
import type { CoachExperienceService } from "../types/coachExperienceService";
import { CoachExperienceError } from "../types/coachExperienceService";

function createService(options?: {
  dto?: CoachExperienceDto;
  fail?: boolean;
  failOnce?: boolean;
  empty?: boolean;
}): CoachExperienceService {
  let calls = 0;
  const dto = options?.empty
    ? emptyCoachExperienceData
    : (options?.dto ?? mockCoachExperienceData);

  let seed: CoachExperienceDto = {
    ...dto,
    conversation: {
      ...dto.conversation,
      messages: [...dto.conversation.messages],
    },
  };

  return {
    providerId: "mock",
    async getExperience() {
      calls += 1;
      if (options?.fail) {
        throw new CoachExperienceError("load failed", "mock");
      }
      if (options?.failOnce && calls === 1) {
        throw new CoachExperienceError("transient", "mock");
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
      const userMessage = {
        id: `user-${now}`,
        role: "user" as const,
        content: message,
        createdAt: now,
      };
      const coachMessage = {
        id: `coach-${now}`,
        role: "coach" as const,
        content: `Mock reply to: ${message}`,
        createdAt: now,
      };
      seed = {
        ...seed,
        conversation: {
          ...seed.conversation,
          id: conversationId,
          messages: [...seed.conversation.messages, userMessage, coachMessage],
          updatedAt: now,
        },
      };
      return { conversationId, userMessage, coachMessage };
    },
    async regenerateResponse({ messageId }) {
      return {
        id: messageId,
        role: "coach",
        content: "Fresh coach reply",
        createdAt: new Date().toISOString(),
      };
    },
    async pinInsight(insightId) {
      const pinned = {
        ...(seed.dailyInsight ?? seed.pinnedInsight!),
        id: insightId,
        pinned: true,
        kind: "pinned" as const,
      };
      seed = { ...seed, pinnedInsight: pinned };
      return pinned;
    },
    async dismissInsight(insightId) {
      seed = {
        ...seed,
        dailyInsight:
          seed.dailyInsight?.id === insightId ? null : seed.dailyInsight,
        pinnedInsight:
          seed.pinnedInsight?.id === insightId ? null : seed.pinnedInsight,
      };
    },
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

describe("CoachExperienceViewModel", () => {
  it("loads conversation, insights, recommendations, and quick actions", async () => {
    const viewModel = new CoachExperienceViewModel({
      service: createService(),
    });

    await viewModel.loadConversation();

    expect(viewModel.loading.status).toBe(CoachLoadingStatuses.IDLE);
    expect(viewModel.error).toBeNull();
    expect(viewModel.messages.length).toBe(3);
    expect(viewModel.dailyInsight?.kind).toBe("daily");
    expect(viewModel.pinnedInsight?.pinned).toBe(true);
    expect(viewModel.recommendations.length).toBe(4);
    expect(viewModel.quickActions.length).toBe(7);
    expect(viewModel.memorySummary?.headline).toContain("remembers");
    expect(viewModel.isEmpty).toBe(false);
    expect(viewModel.streamingPrepared).toBe(false);
  });

  it("exposes error state when the provider fails", async () => {
    const viewModel = new CoachExperienceViewModel({
      service: createService({ fail: true }),
    });

    await viewModel.loadConversation();

    expect(viewModel.experience).toBeNull();
    expect(viewModel.error?.retryable).toBe(true);
    expect(viewModel.error?.message).toContain("load failed");
  });

  it("refresh restores experience after a prior error", async () => {
    const viewModel = new CoachExperienceViewModel({
      service: createService({ failOnce: true }),
    });

    await viewModel.loadConversation();
    expect(viewModel.error).not.toBeNull();

    await viewModel.refresh();
    expect(viewModel.error).toBeNull();
    expect(viewModel.conversation?.id).toBe("conv-today");
    expect(viewModel.loading.isRefreshing).toBe(false);
  });

  it("sendMessage appends turns and prepares typing/streaming state", async () => {
    const viewModel = new CoachExperienceViewModel({
      service: createService(),
    });
    await viewModel.loadConversation();
    const before = viewModel.messages.length;

    await viewModel.sendMessage("Reduce today's volume");

    expect(viewModel.messages.length).toBe(before + 2);
    expect(viewModel.typing.visible).toBe(false);
    expect(viewModel.streamingPrepared).toBe(true);
    expect(viewModel.loading.isSending).toBe(false);
  });

  it("regenerateResponse updates a coach message", async () => {
    const viewModel = new CoachExperienceViewModel({
      service: createService(),
    });
    await viewModel.loadConversation();
    const coachMessage = viewModel.messages.find(
      (message) => message.role === "coach",
    )!;

    await viewModel.regenerateResponse(coachMessage.id);

    expect(
      viewModel.messages.find((message) => message.id === coachMessage.id)
        ?.content,
    ).toBe("Fresh coach reply");
  });

  it("pinInsight and dismissInsight update insight projection", async () => {
    const viewModel = new CoachExperienceViewModel({
      service: createService(),
    });
    await viewModel.loadConversation();
    const insightId = viewModel.dailyInsight!.id;

    await viewModel.pinInsight(insightId);
    expect(viewModel.pinnedInsight?.id).toBe(insightId);

    await viewModel.dismissInsight(insightId);
    expect(viewModel.pinnedInsight).toBeNull();
  });

  it("suggestActions and loadConversationHistory refresh projections", async () => {
    const viewModel = new CoachExperienceViewModel({
      service: createService(),
    });
    await viewModel.loadConversation();

    await viewModel.suggestActions();
    await viewModel.loadConversationHistory();
    await viewModel.loadDailyInsight();
    await viewModel.loadRecommendations();

    expect(viewModel.quickActions.length).toBeGreaterThan(0);
    expect(viewModel.conversationHistory.length).toBeGreaterThan(0);
    expect(viewModel.dailyInsight).not.toBeNull();
    expect(viewModel.recommendations.length).toBeGreaterThan(0);
  });

  it("marks empty experiences", async () => {
    const viewModel = new CoachExperienceViewModel({
      service: createService({ empty: true }),
    });

    await viewModel.loadConversation();
    expect(viewModel.isEmpty).toBe(true);
  });

  it("notifies subscribers on load", async () => {
    const viewModel = new CoachExperienceViewModel({
      service: createService(),
    });
    const listener = jest.fn();
    viewModel.subscribe(listener);

    await viewModel.loadConversation();

    expect(listener.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
