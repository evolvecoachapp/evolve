import {
  BACKEND_COACH_CONVERSATION_TITLE,
  BACKEND_PENDING_CONVERSATION_ID,
  buildEmptyBackendCoachExperience,
  mapBackendChatMessageToCoachMessageDto,
  mapBackendCoachMessagesToExperienceDto,
  mapBackendCoachReplyToSendResult,
} from "../mapBackendCoachToExperienceDto";
import type { ChatMessageReadDto, CoachMessageReadDto } from "../../../../types/api";

function buildChatMessage(
  overrides: Partial<ChatMessageReadDto> = {},
): ChatMessageReadDto {
  return {
    id: "msg-1",
    conversation_id: "11111111-1111-4111-8111-111111111111",
    role: "user",
    content: "How should I train today?",
    created_at: "2026-08-12T10:00:00.000Z",
    ...overrides,
  };
}

function buildReply(
  overrides: Partial<CoachMessageReadDto> = {},
): CoachMessageReadDto {
  return {
    conversation_id: "11111111-1111-4111-8111-111111111111",
    message: "Keep intensity moderate and reassess after warm-up.",
    intent: "workout",
    engines_invoked: ["workout_coach_engine"],
    artifacts: null,
    ...overrides,
  };
}

describe("mapBackendCoachToExperienceDto", () => {
  it("returns the empty experience when no conversation page is available", () => {
    const dto = buildEmptyBackendCoachExperience();
    expect(dto.conversation.id).toBe(BACKEND_PENDING_CONVERSATION_ID);
    expect(dto.conversation.title).toBe(BACKEND_COACH_CONVERSATION_TITLE);
    expect(dto.conversation.messages).toEqual([]);
    expect(dto.empty).toBe(true);
    expect(dto.dailyInsight).toBeNull();
    expect(dto.pinnedInsight).toBeNull();
    expect(dto.recommendations).toEqual([]);
    expect(dto.quickActions).toEqual([]);
    expect(dto.memorySummary).toBeNull();
    expect(dto.conversationHistory).toEqual([]);
  });

  it("maps assistant turns to coach and does not invent insights", () => {
    const conversationId = "11111111-1111-4111-8111-111111111111";
    const dto = mapBackendCoachMessagesToExperienceDto({
      conversationId,
      page: {
        items: [
          buildChatMessage(),
          buildChatMessage({
            id: "msg-2",
            role: "assistant",
            content: "Train upper body today.",
            created_at: "2026-08-12T10:00:05.000Z",
          }),
        ],
        total: 2,
        limit: 100,
        offset: 0,
      },
    });

    expect(dto.conversation.id).toBe(conversationId);
    expect(dto.conversation.title).toBe(BACKEND_COACH_CONVERSATION_TITLE);
    expect(dto.conversation.messages).toHaveLength(2);
    expect(dto.conversation.messages[0]?.role).toBe("user");
    expect(dto.conversation.messages[1]?.role).toBe("coach");
    expect(dto.conversation.messages[1]?.content).toBe("Train upper body today.");
    expect(dto.conversation.createdAt).toBe("2026-08-12T10:00:00.000Z");
    expect(dto.conversation.updatedAt).toBe("2026-08-12T10:00:05.000Z");
    expect(dto.empty).toBe(false);
    expect(dto.dailyInsight).toBeNull();
    expect(dto.recommendations).toEqual([]);
    expect(dto.quickActions).toEqual([]);
    expect(dto.conversationHistory).toEqual([]);
  });

  it("maps system roles through and leaves citations off persisted turns", () => {
    const mapped = mapBackendChatMessageToCoachMessageDto(
      buildChatMessage({ role: "system", content: "Session started." }),
    );
    expect(mapped.role).toBe("system");
    expect(mapped.citations).toBeUndefined();
  });

  it("maps POST reply engines_invoked onto coach citations without fabricating a user id from the backend", () => {
    const result = mapBackendCoachReplyToSendResult({
      reply: buildReply(),
      userContent: "How should I train today?",
      createdAt: "2026-08-12T10:01:00.000Z",
    });

    expect(result.conversationId).toBe("11111111-1111-4111-8111-111111111111");
    expect(result.userMessage.role).toBe("user");
    expect(result.userMessage.content).toBe("How should I train today?");
    expect(result.coachMessage.role).toBe("coach");
    expect(result.coachMessage.content).toBe(
      "Keep intensity moderate and reassess after warm-up.",
    );
    expect(result.coachMessage.citations).toEqual(["workout_coach_engine"]);
  });

  it("omits citations when the orchestrator invoked no engines", () => {
    const result = mapBackendCoachReplyToSendResult({
      reply: buildReply({ intent: "general", engines_invoked: [] }),
      userContent: "Hello",
      createdAt: "2026-08-12T10:01:00.000Z",
    });
    expect(result.coachMessage.citations).toBeUndefined();
  });
});
