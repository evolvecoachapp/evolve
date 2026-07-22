import {
  createConstraintComposer,
  createConversationComposer,
  createIdentityComposer,
  createKnowledgeComposer,
  createMemoryComposer,
  createSafetyComposer,
  createSummaryComposer,
  createSystemComposer,
  createUserInputComposer,
} from "../composers";
import { PromptBlockTypes } from "../models/PromptBlockType";
import { PromptSections } from "../models/PromptSection";
import {
  createFullPromptCompositionInputs,
} from "../testSupport/fixtures";

describe("prompt-composition composers", () => {
  const inputs = createFullPromptCompositionInputs();
  const context = inputs.conversationContext;

  it("SystemComposer emits system block + instructions", () => {
    const result = createSystemComposer().compose(context);
    expect(result.block.type).toBe(PromptBlockTypes.SYSTEM);
    expect(result.block.section).toBe(PromptSections.SYSTEM);
    expect(result.instructions.length).toBe(1);
  });

  it("IdentityComposer emits identity model + block", () => {
    const result = createIdentityComposer().compose(context);
    expect(result.identity.audience).toBe(context.audience);
    expect(result.block.type).toBe(PromptBlockTypes.IDENTITY);
  });

  it("KnowledgeComposer includes optional insight snapshot ref", () => {
    const result = createKnowledgeComposer().compose(
      context,
      inputs.insightSnapshot,
    );
    expect(result.knowledge.insightIds).toContain(inputs.insightSnapshot.id);
    expect(result.block.type).toBe(PromptBlockTypes.KNOWLEDGE);
  });

  it("ConversationComposer maps goals and turns", () => {
    const result = createConversationComposer().compose(context);
    expect(result.conversation.goalIds.length).toBe(context.goals.length);
    expect(result.conversation.turnIds.length).toBe(context.turns.length);
  });

  it("MemoryComposer remains valid with empty refs", () => {
    const result = createMemoryComposer().compose(context);
    expect(result.block.type).toBe(PromptBlockTypes.MEMORY);
    expect(result.memory.conversationContextId).toBe(context.id);
  });

  it("ConstraintComposer and SafetyComposer link constraints", () => {
    const constraints = createConstraintComposer().compose(context);
    const safety = createSafetyComposer().compose(context);
    expect(constraints.constraints.constraintIds.length).toBe(
      context.constraints.length,
    );
    expect(safety.safety.codes).toContain("safety_composition");
  });

  it("UserInputComposer and SummaryComposer produce summaries", () => {
    const userInput = createUserInputComposer().compose(context);
    expect(userInput.userInput.requestId).toBe(context.request.id);

    const summary = createSummaryComposer().compose({
      packageId: "pkg:1",
      conversationContextId: context.id,
      athleteId: context.session.athleteId,
      blocks: [userInput.block],
      sections: [PromptSections.USER_INPUT],
      instructions: [],
      primaryIntent: context.intent,
    });
    expect(summary.blockCount).toBe(1);
    expect(summary.summaryText).toContain("prompt block");
  });
});
