import { prepareConversation } from "../application";
import { normalizePriority } from "../utils/normalizePriorities";
import { sortEvidence, sortGoals } from "../utils/sortEvidence";
import {
  createFullConversationInputs,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("conversation-orchestrator regression", () => {
  it("keeps goal and evidence order stable across runs", () => {
    const inputs = createFullConversationInputs();
    const a = prepareConversation({
      ...inputs,
      preparedAt: FIXED_TIMESTAMP,
      contextId: "conversation:regression",
    });
    const b = prepareConversation({
      ...inputs,
      preparedAt: FIXED_TIMESTAMP,
      contextId: "conversation:regression",
    });

    expect(a.context.goals.map((g) => g.id)).toEqual(
      b.context.goals.map((g) => g.id),
    );
    expect(a.context.evidence.map((e) => e.id)).toEqual(
      b.context.evidence.map((e) => e.id),
    );

    expect(sortGoals(a.context.goals).map((g) => g.id)).toEqual(
      a.context.goals.map((g) => g.id),
    );
    expect(sortEvidence(a.context.evidence).map((e) => e.id)).toEqual(
      a.context.evidence.map((e) => e.id),
    );
  });

  it("normalizes out-of-range priorities", () => {
    expect(normalizePriority(0)).toBe(1);
    expect(normalizePriority(101)).toBe(100);
    expect(normalizePriority(Number.NaN)).toBe(50);
  });

  it("never emits prompt/LLM/provider markers in context statements", () => {
    const inputs = createFullConversationInputs();
    const result = prepareConversation({
      ...inputs,
      preparedAt: FIXED_TIMESTAMP,
    });

    const texts = [
      ...result.context.goals.map((g) => g.statement),
      ...result.context.constraints.map((c) => c.statement),
      ...result.context.messages.map((m) => m.statement),
      result.context.request.statement,
      result.summary.summaryText,
    ].join(" ");

    expect(texts.toLowerCase()).not.toMatch(
      /\b(openai|anthropic|gemini|ollama|system prompt|you are an? ai)\b/,
    );
    expect(result.context.responsePlaceholder.provider).toBeNull();
    expect(result.context.responsePlaceholder.content).toBeNull();
  });
});
