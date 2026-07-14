import { createCoachService, mockCoachService, openAIService } from "../index";
import { CoachServiceError } from "../../types/coachService";
import { pickMockCoachResponse } from "../providers/mockResponses";

describe("coachService architecture", () => {
  it("defaults to the mock provider", () => {
    const service = createCoachService("mock");
    expect(service.providerId).toBe("mock");
  });

  it("creates a conversation with a stable seed history", async () => {
    const conversation = await mockCoachService.createConversation();

    expect(conversation.id).toMatch(/^conv-/);
    expect(conversation.messages).toHaveLength(3);
    expect(conversation.messages[0]?.role).toBe("coach");
  });

  it("returns keyword-aware mock replies with conversation id", async () => {
    const conversation = await mockCoachService.createConversation();
    const response = await mockCoachService.sendMessage({
      conversationId: conversation.id,
      message: "Should I increase bench press weight?",
      history: conversation.messages,
    });

    expect(response.conversationId).toBe(conversation.id);
    expect(response.message.role).toBe("coach");
    expect(response.message.content).toContain("2.5kg");
  });

  it("uses deterministic fallback responses", () => {
    const first = pickMockCoachResponse("hello there");
    const second = pickMockCoachResponse("hello there");
    expect(first).toBe(second);
  });

  it("throws when an unconfigured provider is invoked", async () => {
    await expect(openAIService.createConversation()).rejects.toBeInstanceOf(CoachServiceError);
  });
});
