import {
  dismissCoachInsight,
  loadCoachConversation,
  loadConversationHistory,
  loadDailyInsight,
  loadQuickActions,
  loadRecommendations,
  pinCoachInsight,
  refreshCoachExperience,
  regenerateCoachResponse,
  sendCoachMessage,
} from "../application";
import {
  emptyCoachExperienceData,
  mockCoachExperienceData,
} from "../mocks/coachExperienceData";
import {
  resetMockCoachExperienceSeed,
} from "../providers/MockCoachExperienceService";
import type { CoachExperienceDto } from "../types/coachExperienceDto";
import type { CoachExperienceService } from "../types/coachExperienceService";
import { CoachExperienceError } from "../types/coachExperienceService";

function createService(options?: {
  dto?: CoachExperienceDto;
  fail?: boolean;
  empty?: boolean;
}): CoachExperienceService {
  if (options?.fail) {
    return {
      providerId: "mock",
      async getExperience() {
        throw new CoachExperienceError("experience unavailable", "mock");
      },
      async sendMessage() {
        throw new CoachExperienceError("send failed", "mock");
      },
      async regenerateResponse() {
        throw new CoachExperienceError("regenerate failed", "mock");
      },
      async pinInsight() {
        throw new CoachExperienceError("pin failed", "mock");
      },
      async dismissInsight() {
        throw new CoachExperienceError("dismiss failed", "mock");
      },
      async getConversationHistory() {
        throw new CoachExperienceError("history failed", "mock");
      },
      async getDailyInsight() {
        throw new CoachExperienceError("insight failed", "mock");
      },
      async getRecommendations() {
        throw new CoachExperienceError("recommendations failed", "mock");
      },
      async getQuickActions() {
        throw new CoachExperienceError("quick actions failed", "mock");
      },
    };
  }

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
        content: `Echo: ${message}`,
        createdAt: now,
        citations: ["test"],
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
      const now = new Date().toISOString();
      const regenerated = {
        id: messageId,
        role: "coach" as const,
        content: "Regenerated coaching reply",
        createdAt: now,
        citations: ["regenerated"],
      };
      seed = {
        ...seed,
        conversation: {
          ...seed.conversation,
          messages: seed.conversation.messages.map((message) =>
            message.id === messageId ? regenerated : message,
          ),
          updatedAt: now,
        },
      };
      return regenerated;
    },
    async pinInsight(insightId) {
      const source =
        seed.dailyInsight?.id === insightId
          ? seed.dailyInsight
          : seed.pinnedInsight!;
      const pinned = { ...source, id: insightId, pinned: true, kind: "pinned" as const };
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

describe("coach-experience application APIs", () => {
  beforeEach(() => {
    resetMockCoachExperienceSeed();
  });

  it("loadCoachConversation maps provider data into immutable experience", async () => {
    const experience = await loadCoachConversation({
      service: createService(),
    });

    expect(Object.isFrozen(experience)).toBe(true);
    expect(experience.conversation.messages.length).toBe(3);
    expect(experience.dailyInsight?.title).toContain("progressive");
    expect(experience.recommendations.length).toBe(4);
    expect(experience.quickActions.length).toBe(7);
    expect(experience.memorySummary?.entryCount).toBe(12);
    expect(experience.isEmpty).toBe(false);
  });

  it("refreshCoachExperience returns a fresh mapped experience", async () => {
    const service = createService();
    const first = await loadCoachConversation({ service });
    const second = await refreshCoachExperience({ service });

    expect(second).not.toBe(first);
    expect(second.conversation.id).toBe(first.conversation.id);
  });

  it("sendCoachMessage appends user and coach messages", async () => {
    const service = createService();
    const loaded = await loadCoachConversation({ service });
    const next = await sendCoachMessage({
      service,
      experience: loaded,
      message: "Explain today's workout",
    });

    expect(next.conversation.messages.length).toBe(
      loaded.conversation.messages.length + 2,
    );
    expect(next.conversation.messages.at(-2)?.role).toBe("user");
    expect(next.conversation.messages.at(-1)?.content).toContain(
      "Explain today's workout",
    );
  });

  it("regenerateCoachResponse replaces a coach message", async () => {
    const service = createService();
    const loaded = await loadCoachConversation({ service });
    const target = loaded.conversation.messages.find(
      (message) => message.role === "coach",
    )!;
    const next = await regenerateCoachResponse({
      service,
      experience: loaded,
      messageId: target.id,
    });

    const updated = next.conversation.messages.find(
      (message) => message.id === target.id,
    );
    expect(updated?.content).toBe("Regenerated coaching reply");
  });

  it("loadDailyInsight / loadRecommendations / loadQuickActions return frozen models", async () => {
    const service = createService();
    const insight = await loadDailyInsight({ service });
    const recommendations = await loadRecommendations({ service });
    const actions = await loadQuickActions({ service });

    expect(insight?.kind).toBe("daily");
    expect(Object.isFrozen(recommendations)).toBe(true);
    expect(actions.some((action) => action.kind === "explain_today_workout")).toBe(
      true,
    );
  });

  it("pinCoachInsight and dismissCoachInsight mutate experience immutably", async () => {
    const service = createService();
    const loaded = await loadCoachConversation({ service });
    const pinned = await pinCoachInsight({
      service,
      experience: loaded,
      insightId: loaded.dailyInsight!.id,
    });

    expect(pinned.pinnedInsight?.pinned).toBe(true);

    const dismissed = await dismissCoachInsight({
      service,
      experience: pinned,
      insightId: pinned.pinnedInsight!.id,
    });

    expect(dismissed.pinnedInsight).toBeNull();
  });

  it("loadConversationHistory returns history items", async () => {
    const history = await loadConversationHistory({
      service: createService(),
    });
    expect(history.length).toBeGreaterThan(0);
    expect(history[0]?.destination).toContain("/coach/history/");
  });

  it("maps empty experience", async () => {
    const experience = await loadCoachConversation({
      service: createService({ empty: true }),
    });
    expect(experience.isEmpty).toBe(true);
    expect(experience.conversation.messages.length).toBe(0);
  });

  it("propagates provider failures", async () => {
    await expect(
      loadCoachConversation({ service: createService({ fail: true }) }),
    ).rejects.toThrow("experience unavailable");
  });
});
