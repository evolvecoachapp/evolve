import { prepareCoachingContext } from "../../coach-intelligence/application";
import { createFullCoachInputs } from "../../coach-intelligence/testSupport/fixtures";
import { prepareConversation } from "../../conversation-orchestrator/application";
import { composePromptPackage } from "../application";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("prompt-composition integration", () => {
  it("consumes ConversationContext and optional CoachingContext / InsightSnapshot", () => {
    const coachInputs = createFullCoachInputs();
    const coaching = prepareCoachingContext({
      ...coachInputs,
      preparedAt: FIXED_TIMESTAMP,
      contextId: "coach:prompt-integration",
    });
    const conversation = prepareConversation({
      coachingContext: coaching.context,
      insightSnapshot: coachInputs.insightSnapshot,
      preparedAt: FIXED_TIMESTAMP,
      contextId: "conversation:prompt-integration",
    });

    const prompt = composePromptPackage({
      conversationContext: conversation.context,
      coachingContext: coaching.context,
      insightSnapshot: coachInputs.insightSnapshot,
      composedAt: FIXED_TIMESTAMP,
      packageId: "prompt-package:integration",
    });

    expect(prompt.promptPackage.context.conversationContextId).toBe(
      "conversation:prompt-integration",
    );
    expect(prompt.promptPackage.context.coachingContextId).toBe(
      "coach:prompt-integration",
    );
    expect(prompt.promptPackage.context.insightSnapshotId).toBe(
      coachInputs.insightSnapshot.id,
    );
    expect(prompt.promptPackage.knowledge.insightIds).toContain(
      coachInputs.insightSnapshot.id,
    );
    expect(prompt.promptPackage.conversation.goalIds.length).toBe(
      conversation.context.goals.length,
    );
  });

  it("does not mutate ConversationContext or optional upstream inputs", () => {
    const coachInputs = createFullCoachInputs();
    const coaching = prepareCoachingContext({
      ...coachInputs,
      preparedAt: FIXED_TIMESTAMP,
      contextId: "coach:prompt-immutability",
    });
    const conversation = prepareConversation({
      coachingContext: coaching.context,
      insightSnapshot: coachInputs.insightSnapshot,
      preparedAt: FIXED_TIMESTAMP,
      contextId: "conversation:prompt-immutability",
    });

    const conversationBefore = JSON.stringify(conversation.context);
    const coachingBefore = JSON.stringify(coaching.context);
    const insightBefore = JSON.stringify(coachInputs.insightSnapshot);

    composePromptPackage({
      conversationContext: conversation.context,
      coachingContext: coaching.context,
      insightSnapshot: coachInputs.insightSnapshot,
      composedAt: FIXED_TIMESTAMP,
    });

    expect(JSON.stringify(conversation.context)).toBe(conversationBefore);
    expect(JSON.stringify(coaching.context)).toBe(coachingBefore);
    expect(JSON.stringify(coachInputs.insightSnapshot)).toBe(insightBefore);
  });
});
