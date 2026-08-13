import { ApiError } from "../../../../api/client";
import { CoachExperienceError } from "../../services";
import {
  BACKEND_PENDING_CONVERSATION_ID,
  mapBackendCoachMessagesToExperienceDto,
} from "../../mappers/mapBackendCoachToExperienceDto";

const persisted = { conversationId: null as string | null };

jest.mock("../../../../api/coach", () => ({
  sendCoachMessage: jest.fn(),
  listCoachConversationMessages: jest.fn(),
}));

jest.mock("../backendCoachConversationStore", () => ({
  persistBackendCoachConversationId: jest.fn(async (id: string) => {
    persisted.conversationId = id;
  }),
  loadBackendCoachConversationId: jest.fn(async () => persisted.conversationId),
  clearBackendCoachConversationId: jest.fn(async () => {
    persisted.conversationId = null;
  }),
}));

// Imported after the mocks are registered so the provider module picks up the mocked functions.
import {
  backendCoachExperienceService,
  resetBackendCoachExperienceState,
} from "../BackendCoachExperienceService";

const mockedSendCoachMessage = jest.requireMock("../../../../api/coach")
  .sendCoachMessage as jest.MockedFunction<
  typeof import("../../../../api/coach").sendCoachMessage
>;
const mockedListCoachConversationMessages = jest.requireMock("../../../../api/coach")
  .listCoachConversationMessages as jest.MockedFunction<
  typeof import("../../../../api/coach").listCoachConversationMessages
>;
const mockedPersistConversationId = jest.requireMock(
  "../backendCoachConversationStore",
).persistBackendCoachConversationId as jest.MockedFunction<
  typeof import("../backendCoachConversationStore").persistBackendCoachConversationId
>;
const mockedLoadConversationId = jest.requireMock(
  "../backendCoachConversationStore",
).loadBackendCoachConversationId as jest.MockedFunction<
  typeof import("../backendCoachConversationStore").loadBackendCoachConversationId
>;

const CONVERSATION_ID = "11111111-1111-4111-8111-111111111111";

function buildReply(overrides: Record<string, unknown> = {}) {
  return {
    conversation_id: CONVERSATION_ID,
    message: "Keep intensity moderate today.",
    intent: "workout" as const,
    engines_invoked: ["workout_coach_engine"],
    artifacts: { state: "in_progress" },
    ...overrides,
  };
}

function buildChatMessage(overrides: Record<string, unknown> = {}) {
  return {
    id: "msg-1",
    conversation_id: CONVERSATION_ID,
    role: "user" as const,
    content: "How should I train today?",
    created_at: "2026-08-12T10:00:00.000Z",
    ...overrides,
  };
}

describe("backendCoachExperienceService", () => {
  beforeEach(() => {
    persisted.conversationId = null;
    jest.clearAllMocks();
    resetBackendCoachExperienceState();
  });

  it("has the backend provider id", () => {
    expect(backendCoachExperienceService.providerId).toBe("backend");
  });

  describe("authenticated Coach reads", () => {
    it("returns the empty experience without calling the API when no conversation id is known", async () => {
      const dto = await backendCoachExperienceService.getExperience();

      expect(mockedListCoachConversationMessages).not.toHaveBeenCalled();
      expect(mockedSendCoachMessage).not.toHaveBeenCalled();
      expect(dto.conversation.id).toBe(BACKEND_PENDING_CONVERSATION_ID);
      expect(dto.empty).toBe(true);
      expect(dto.dailyInsight).toBeNull();
      expect(dto.recommendations).toEqual([]);
      expect(dto.quickActions).toEqual([]);
    });

    it("maps GET /conversations/{id}/messages into the Coach Experience after a send", async () => {
      mockedSendCoachMessage.mockResolvedValueOnce(buildReply());
      mockedListCoachConversationMessages.mockResolvedValueOnce({
        items: [
          buildChatMessage(),
          buildChatMessage({
            id: "msg-2",
            role: "assistant",
            content: "Keep intensity moderate today.",
            created_at: "2026-08-12T10:00:05.000Z",
          }),
        ],
        total: 2,
        limit: 100,
        offset: 0,
      });

      await backendCoachExperienceService.sendMessage({
        conversationId: BACKEND_PENDING_CONVERSATION_ID,
        message: "How should I train today?",
      });
      const dto = await backendCoachExperienceService.getExperience();

      expect(mockedListCoachConversationMessages).toHaveBeenCalledWith(
        CONVERSATION_ID,
        { limit: 100, offset: 0 },
      );
      expect(dto.conversation.id).toBe(CONVERSATION_ID);
      expect(dto.conversation.messages).toHaveLength(2);
      expect(dto.conversation.messages[1]?.role).toBe("coach");
      expect(dto.conversation.messages[1]?.content).toBe(
        "Keep intensity moderate today.",
      );
      expect(dto.dailyInsight).toBeNull();
      expect(dto.quickActions).toEqual([]);
    });

    it("restores a persisted conversation id after an in-memory reset", async () => {
      mockedSendCoachMessage.mockResolvedValueOnce(buildReply());
      mockedListCoachConversationMessages.mockResolvedValueOnce({
        items: [
          buildChatMessage({
            role: "assistant",
            content: "Keep intensity moderate today.",
          }),
        ],
        total: 1,
        limit: 100,
        offset: 0,
      });

      await backendCoachExperienceService.sendMessage({
        conversationId: BACKEND_PENDING_CONVERSATION_ID,
        message: "How should I train today?",
      });
      expect(mockedPersistConversationId).toHaveBeenCalledWith(CONVERSATION_ID);

      resetBackendCoachExperienceState();
      persisted.conversationId = CONVERSATION_ID;

      const dto = await backendCoachExperienceService.getExperience();

      expect(mockedLoadConversationId).toHaveBeenCalled();
      expect(mockedListCoachConversationMessages).toHaveBeenCalledWith(
        CONVERSATION_ID,
        { limit: 100, offset: 0 },
      );
      expect(dto.conversation.id).toBe(CONVERSATION_ID);
      expect(dto.conversation.messages[0]?.content).toBe(
        "Keep intensity moderate today.",
      );
    });
  });

  describe("backend DTO → Coach Experience mapping", () => {
    it("does not invent insights, recommendations, or conversation-list history", () => {
      const dto = mapBackendCoachMessagesToExperienceDto({
        conversationId: CONVERSATION_ID,
        page: {
          items: [buildChatMessage({ role: "assistant", content: "Hello." })],
          total: 1,
          limit: 100,
          offset: 0,
        },
      });

      expect(dto.conversation.messages[0]?.role).toBe("coach");
      expect(dto.dailyInsight).toBeNull();
      expect(dto.pinnedInsight).toBeNull();
      expect(dto.recommendations).toEqual([]);
      expect(dto.quickActions).toEqual([]);
      expect(dto.memorySummary).toBeNull();
      expect(dto.conversationHistory).toEqual([]);
    });
  });

  describe("supported backend mutations", () => {
    it("sends via POST /messages without conversation_id for a pending local id", async () => {
      mockedSendCoachMessage.mockResolvedValueOnce(buildReply());

      const result = await backendCoachExperienceService.sendMessage({
        conversationId: BACKEND_PENDING_CONVERSATION_ID,
        message: "  How should I train today?  ",
      });

      expect(mockedSendCoachMessage).toHaveBeenCalledWith({
        message: "How should I train today?",
      });
      expect(result.conversationId).toBe(CONVERSATION_ID);
      expect(result.userMessage.content).toBe("How should I train today?");
      expect(result.coachMessage.content).toBe("Keep intensity moderate today.");
      expect(result.coachMessage.citations).toBeUndefined();
      expect(JSON.stringify(result)).not.toContain("workout_coach_engine");
      expect(JSON.stringify(result)).not.toContain("in_progress");
    });

    it("passes a backend conversation UUID on subsequent sends", async () => {
      mockedSendCoachMessage.mockResolvedValueOnce(buildReply());

      await backendCoachExperienceService.sendMessage({
        conversationId: CONVERSATION_ID,
        message: "Still sore from yesterday.",
      });

      expect(mockedSendCoachMessage).toHaveBeenCalledWith({
        message: "Still sore from yesterday.",
        conversation_id: CONVERSATION_ID,
      });
    });

    it("resumes the stored backend conversation when the Experience id is still pending", async () => {
      mockedSendCoachMessage
        .mockResolvedValueOnce(buildReply())
        .mockResolvedValueOnce(buildReply({ message: "Noted — keep volume steady." }));

      await backendCoachExperienceService.sendMessage({
        conversationId: BACKEND_PENDING_CONVERSATION_ID,
        message: "How should I train today?",
      });
      await backendCoachExperienceService.sendMessage({
        conversationId: BACKEND_PENDING_CONVERSATION_ID,
        message: "Still sore from yesterday.",
      });

      expect(mockedSendCoachMessage).toHaveBeenNthCalledWith(1, {
        message: "How should I train today?",
      });
      expect(mockedSendCoachMessage).toHaveBeenNthCalledWith(2, {
        message: "Still sore from yesterday.",
        conversation_id: CONVERSATION_ID,
      });
    });

    it("loads the latest message page when history exceeds the first page", async () => {
      mockedSendCoachMessage.mockResolvedValueOnce(buildReply());
      mockedListCoachConversationMessages
        .mockResolvedValueOnce({
          items: [buildChatMessage()],
          total: 101,
          limit: 100,
          offset: 0,
        })
        .mockResolvedValueOnce({
          items: [
            buildChatMessage({
              id: "msg-latest",
              role: "assistant",
              content: "Latest reply.",
              created_at: "2026-08-12T12:00:00.000Z",
            }),
          ],
          total: 101,
          limit: 100,
          offset: 1,
        });

      await backendCoachExperienceService.sendMessage({
        conversationId: BACKEND_PENDING_CONVERSATION_ID,
        message: "How should I train today?",
      });
      const dto = await backendCoachExperienceService.getExperience();

      expect(mockedListCoachConversationMessages).toHaveBeenNthCalledWith(1, CONVERSATION_ID, {
        limit: 100,
        offset: 0,
      });
      expect(mockedListCoachConversationMessages).toHaveBeenNthCalledWith(2, CONVERSATION_ID, {
        limit: 100,
        offset: 1,
      });
      expect(dto.conversation.messages[0]?.content).toBe("Latest reply.");
    });

    it("does not report success when the message is empty", async () => {
      await expect(
        backendCoachExperienceService.sendMessage({
          conversationId: CONVERSATION_ID,
          message: "   ",
        }),
      ).rejects.toThrow(/must not be empty/i);
      expect(mockedSendCoachMessage).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("wraps a network/API failure as a CoachExperienceError, never the raw exception", async () => {
      mockedSendCoachMessage.mockRejectedValueOnce(
        new ApiError(500, null, "Internal Server Error"),
      );

      const failure = backendCoachExperienceService.sendMessage({
        conversationId: BACKEND_PENDING_CONVERSATION_ID,
        message: "Hello",
      });

      await expect(failure).rejects.toBeInstanceOf(CoachExperienceError);
      await expect(failure).rejects.toThrow("Internal Server Error");
      await expect(failure).rejects.not.toBeInstanceOf(ApiError);
    });

    it("surfaces a backend validation failure as a CoachExperienceError", async () => {
      mockedSendCoachMessage.mockRejectedValueOnce(
        new ApiError(
          422,
          { detail: "String should have at least 1 character" },
          "String should have at least 1 character",
        ),
      );

      const failure = backendCoachExperienceService.sendMessage({
        conversationId: CONVERSATION_ID,
        message: "Hello",
      });

      await expect(failure).rejects.toBeInstanceOf(CoachExperienceError);
      await expect(failure).rejects.toThrow(/at least 1 character/i);
      await expect(failure).rejects.not.toBeInstanceOf(ApiError);
    });

    it("does not report success when the backend send POST fails", async () => {
      mockedSendCoachMessage.mockRejectedValueOnce(
        new ApiError(503, null, "Service Unavailable"),
      );

      await expect(
        backendCoachExperienceService.sendMessage({
          conversationId: BACKEND_PENDING_CONVERSATION_ID,
          message: "Hello",
        }),
      ).rejects.toThrow("Service Unavailable");
    });

    it("returns the empty experience when a persisted conversation is gone", async () => {
      mockedSendCoachMessage.mockResolvedValueOnce(buildReply());
      mockedListCoachConversationMessages.mockRejectedValueOnce(
        new ApiError(404, null, "Conversation not found for this user."),
      );

      await backendCoachExperienceService.sendMessage({
        conversationId: BACKEND_PENDING_CONVERSATION_ID,
        message: "Hello",
      });

      const dto = await backendCoachExperienceService.getExperience();
      expect(dto.empty).toBe(true);
      expect(dto.conversation.id).toBe(BACKEND_PENDING_CONVERSATION_ID);
    });

    it("wraps a non-404 history GET failure as a CoachExperienceError", async () => {
      mockedSendCoachMessage.mockResolvedValueOnce(buildReply());
      mockedListCoachConversationMessages.mockRejectedValueOnce(
        new ApiError(500, null, "Internal Server Error"),
      );

      await backendCoachExperienceService.sendMessage({
        conversationId: BACKEND_PENDING_CONVERSATION_ID,
        message: "Hello",
      });

      const failure = backendCoachExperienceService.getExperience();
      await expect(failure).rejects.toBeInstanceOf(CoachExperienceError);
      await expect(failure).rejects.toThrow("Internal Server Error");
    });
  });

  describe("unsupported Coach operations", () => {
    it("no-ops regenerateResponse without calling the Coach API", async () => {
      const result = await backendCoachExperienceService.regenerateResponse({
        conversationId: CONVERSATION_ID,
        messageId: "msg-2",
      });

      expect(result.id).toBe("msg-2");
      expect(result.role).toBe("coach");
      expect(mockedSendCoachMessage).not.toHaveBeenCalled();
      expect(mockedListCoachConversationMessages).not.toHaveBeenCalled();
    });

    it.each([
      ["pinInsight", () => backendCoachExperienceService.pinInsight("insight-1")],
      [
        "dismissInsight",
        () => backendCoachExperienceService.dismissInsight("insight-1"),
      ],
      [
        "getConversationHistory",
        () => backendCoachExperienceService.getConversationHistory(),
      ],
      ["getDailyInsight", () => backendCoachExperienceService.getDailyInsight()],
      [
        "getRecommendations",
        () => backendCoachExperienceService.getRecommendations(),
      ],
      ["getQuickActions", () => backendCoachExperienceService.getQuickActions()],
    ])("%s stays explicitly unsupported by the backend", async (_name, call) => {
      await expect(call()).rejects.toBeInstanceOf(CoachExperienceError);
      await expect(call()).rejects.toThrow(/not supported by the backend/i);
      expect(mockedSendCoachMessage).not.toHaveBeenCalled();
      expect(mockedListCoachConversationMessages).not.toHaveBeenCalled();
    });
  });
});
