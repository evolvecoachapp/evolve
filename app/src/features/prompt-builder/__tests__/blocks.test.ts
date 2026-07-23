import {
  AthleteBlockBuilder,
  CapabilitiesBlockBuilder,
  ConstraintBlockBuilder,
  ConversationBlockBuilder,
  FormattingBlockBuilder,
  InsightBlockBuilder,
  KnowledgeBlockBuilder,
  PersonaBlockBuilder,
  RecoveryBlockBuilder,
  SafetyBlockBuilder,
  SummaryBlockBuilder,
  SystemBlockBuilder,
  ToolBlockBuilder,
} from "../blocks";
import { PromptBlockTypes } from "../models/PromptBlockType";
import {
  createFullPromptBuilderInputs,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("prompt-builder blocks", () => {
  const { conversationContext } = createFullPromptBuilderInputs();

  const cases = [
    [new SystemBlockBuilder(), PromptBlockTypes.SYSTEM],
    [new PersonaBlockBuilder(), PromptBlockTypes.PERSONA],
    [new CapabilitiesBlockBuilder(), PromptBlockTypes.CAPABILITIES],
    [new KnowledgeBlockBuilder(), PromptBlockTypes.KNOWLEDGE],
    [new ConversationBlockBuilder(), PromptBlockTypes.CONVERSATION],
    [new AthleteBlockBuilder(), PromptBlockTypes.ATHLETE],
    [new RecoveryBlockBuilder(), PromptBlockTypes.RECOVERY],
    [new InsightBlockBuilder(), PromptBlockTypes.INSIGHT],
    [new ConstraintBlockBuilder(), PromptBlockTypes.CONSTRAINT],
    [new FormattingBlockBuilder(), PromptBlockTypes.FORMATTING],
    [new ToolBlockBuilder(), PromptBlockTypes.TOOL],
    [new SafetyBlockBuilder(), PromptBlockTypes.SAFETY],
    [new SummaryBlockBuilder(), PromptBlockTypes.SUMMARY],
  ] as const;

  it.each(cases)("builds independent frozen %s block", (builder, type) => {
    const block = builder.build(conversationContext);
    expect(Object.isFrozen(block)).toBe(true);
    expect(block.type).toBe(type);
    expect(block.statement.length).toBeGreaterThan(0);
    expect(block.refs).toContain(conversationContext.id);
  });

  it("is deterministic for the same context", () => {
    const a = new SystemBlockBuilder().build(conversationContext);
    const b = new SystemBlockBuilder().build(conversationContext);
    expect(a).toEqual(b);
    expect(FIXED_TIMESTAMP).toBeTruthy();
  });
});
