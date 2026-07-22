import { prepareCoachingContext } from "../application";
import { normalizePriority } from "../utils/normalizePriorities";
import { sortEvidence, sortObjectives } from "../utils/sortEvidence";
import {
  createFullCoachInputs,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("coach-intelligence regression", () => {
  it("keeps objective and evidence order stable across runs", () => {
    const inputs = createFullCoachInputs();
    const a = prepareCoachingContext({
      ...inputs,
      preparedAt: FIXED_TIMESTAMP,
      contextId: "coach:regression",
    });
    const b = prepareCoachingContext({
      ...inputs,
      preparedAt: FIXED_TIMESTAMP,
      contextId: "coach:regression",
    });

    expect(a.context.objectives.map((o) => o.id)).toEqual(
      b.context.objectives.map((o) => o.id),
    );
    expect(a.context.evidence.map((e) => e.id)).toEqual(
      b.context.evidence.map((e) => e.id),
    );

    expect(sortObjectives(a.context.objectives).map((o) => o.id)).toEqual(
      a.context.objectives.map((o) => o.id),
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

  it("never emits prompt/LLM/conversation markers in context statements", () => {
    const inputs = createFullCoachInputs();
    const result = prepareCoachingContext({
      ...inputs,
      preparedAt: FIXED_TIMESTAMP,
    });

    const texts = [
      ...result.context.objectives.map((o) => o.statement),
      ...result.context.instructions.map((i) => i.statement),
      ...result.context.constraints.map((c) => c.statement),
      result.summary.summaryText,
    ].join(" ");

    expect(texts.toLowerCase()).not.toMatch(
      /\b(openai|anthropic|gemini|ollama|system prompt|you are an? ai)\b/,
    );
    expect(result.context.metadata.tags).not.toContain("llm");
  });
});
