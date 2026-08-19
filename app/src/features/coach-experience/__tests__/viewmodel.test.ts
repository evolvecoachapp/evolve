import { CoachExperienceViewModel } from "../viewmodels";
import {
  emptyCoachExperienceData,
  mockCoachExperienceData,
} from "../mocks/coachExperienceData";
import { CoachLoadingStatuses } from "../models/CoachLoadingState";
import {
  createCoachConversation,
  createCoachExperience,
  createCoachMessage,
} from "../models";
import {
  CoachConversationStatuses,
  createCoachConversationState,
} from "../models/CoachConversationState";
import { CoachMessageRoles } from "../models/CoachMessage";
import type { CoachExperienceDto } from "../types/coachExperienceDto";
import type { CoachExperienceService } from "../types/coachExperienceService";
import { CoachExperienceError } from "../types/coachExperienceService";

function createService(options?: {
  dto?: CoachExperienceDto;
  fail?: boolean;
  failOnce?: boolean;
  empty?: boolean;
  providerId?: CoachExperienceService["providerId"];
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
    providerId: options?.providerId ?? "mock",
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

  it("sendMessage on the backend provider adopts the returned conversation UUID", async () => {
    const backendId = "11111111-1111-4111-8111-111111111111";
    const service = createService({ empty: true, providerId: "backend" });
    service.sendMessage = async ({ message }) => {
      const now = "2026-08-13T10:00:00.000Z";
      return {
        conversationId: backendId,
        userMessage: {
          id: "user-1",
          role: "user",
          content: message,
          createdAt: now,
        },
        coachMessage: {
          id: "coach-1",
          role: "coach",
          content: "Keep intensity moderate today.",
          createdAt: now,
        },
      };
    };
    const viewModel = new CoachExperienceViewModel({ service });
    await viewModel.loadConversation();

    await viewModel.sendMessage("How should I train today?");

    expect(viewModel.conversation?.id).toBe(backendId);
    expect(viewModel.messages.at(-1)?.content).toBe(
      "Keep intensity moderate today.",
    );
    expect(viewModel.messages.at(-1)?.citations).toEqual([]);
  });

  it("appends an optimistic user bubble and typing state before the provider resolves", async () => {
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
    const viewModel = new CoachExperienceViewModel({
      service,
      now: () => new Date("2026-08-20T10:00:00.000Z"),
    });
    await viewModel.loadConversation();
    const before = viewModel.messages.length;

    const pending = viewModel.sendMessage("Keep rest short");

    expect(viewModel.messages.length).toBe(before + 1);
    expect(viewModel.messages.at(-1)?.content).toBe("Keep rest short");
    expect(viewModel.messages.at(-1)?.role).toBe("user");
    expect(viewModel.messages.at(-1)?.status).toBe("pending");
    expect(viewModel.typing.visible).toBe(true);
    expect(viewModel.loading.isSending).toBe(true);

    resolveSend({
      conversationId: "conv-today",
      userMessage: {
        id: "user-server",
        role: "user",
        content: "Keep rest short",
        createdAt: "2026-08-20T10:00:00.000Z",
      },
      coachMessage: {
        id: "coach-server",
        role: "coach",
        content: "Two minutes between sets is enough.",
        createdAt: "2026-08-20T10:00:01.000Z",
      },
    });
    await pending;

    const userTurns = viewModel.messages.filter(
      (message) => message.content === "Keep rest short",
    );
    expect(userTurns).toHaveLength(1);
    expect(userTurns[0]?.id).toBe("user-server");
    expect(userTurns[0]?.status).toBe("complete");
    expect(viewModel.messages.at(-1)?.content).toBe(
      "Two minutes between sets is enough.",
    );
    expect(viewModel.typing.visible).toBe(false);
    expect(viewModel.loading.isSending).toBe(false);
  });

  it("shows the first optimistic bubble from an empty conversation", async () => {
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
    const service = createService({ empty: true });
    service.sendMessage = jest.fn(
      () =>
        new Promise((resolve) => {
          resolveSend = resolve;
        }),
    );
    const viewModel = new CoachExperienceViewModel({
      service,
      now: () => new Date("2026-08-20T10:00:00.000Z"),
    });
    await viewModel.loadConversation();
    expect(viewModel.isEmpty).toBe(true);

    const pending = viewModel.sendMessage("How should I train today?");

    expect(viewModel.isEmpty).toBe(false);
    expect(viewModel.messages).toHaveLength(1);
    expect(viewModel.messages[0]?.content).toBe("How should I train today?");
    expect(viewModel.typing.visible).toBe(true);

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
    await pending;

    expect(viewModel.messages).toHaveLength(2);
    expect(viewModel.messages.filter((message) => message.role === "user")).toHaveLength(
      1,
    );
  });

  it("keeps the user bubble and re-enables send after a failed turn", async () => {
    const service = createService();
    service.sendMessage = jest.fn(async () => {
      throw new CoachExperienceError("send failed", "mock");
    });
    const viewModel = new CoachExperienceViewModel({
      service,
      now: () => new Date("2026-08-20T10:00:00.000Z"),
    });
    await viewModel.loadConversation();
    const before = viewModel.messages.length;

    await viewModel.sendMessage("Can I add a set?");

    expect(viewModel.messages.length).toBe(before + 1);
    expect(viewModel.messages.at(-1)?.content).toBe("Can I add a set?");
    expect(viewModel.messages.at(-1)?.status).toBe("error");
    expect(viewModel.typing.visible).toBe(false);
    expect(viewModel.loading.isSending).toBe(false);
    expect(viewModel.error?.message).toContain("send failed");
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

  it("no-ops regenerateResponse for the backend provider without calling the service", async () => {
    const regenerateResponse = jest.fn();
    const service = createService({ providerId: "backend" });
    service.regenerateResponse = regenerateResponse;
    const viewModel = new CoachExperienceViewModel({ service });
    await viewModel.loadConversation();
    const before = viewModel.messages.map((message) => message.content);
    const coachMessage = viewModel.messages.find(
      (message) => message.role === "coach",
    )!;

    await viewModel.regenerateResponse(coachMessage.id);

    expect(regenerateResponse).not.toHaveBeenCalled();
    expect(viewModel.messages.map((message) => message.content)).toEqual(before);
    expect(viewModel.error).toBeNull();
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

  it("applyHydratedCoachExperience drives runtime path without service", async () => {
    const viewModel = new CoachExperienceViewModel({ athleteId: "athlete:1" });
    expect(viewModel.isRuntimeDriven).toBe(true);

    viewModel.applyHydratedCoachExperience(
      createCoachExperience({
        conversation: createCoachConversation({
          id: "conv-runtime",
          title: "Today's Coaching",
          messages: [
            createCoachMessage({
              id: "msg-1",
              role: CoachMessageRoles.COACH,
              content: "Hold intensity this week",
              createdAt: "2026-07-29T09:00:00.000Z",
            }),
          ],
          state: createCoachConversationState(CoachConversationStatuses.READY),
          createdAt: "2026-07-29T08:00:00.000Z",
          updatedAt: "2026-07-29T09:00:00.000Z",
        }),
      }),
    );

    expect(viewModel.messages.length).toBe(1);
    expect(viewModel.loading.status).toBe(CoachLoadingStatuses.IDLE);
  });
});
