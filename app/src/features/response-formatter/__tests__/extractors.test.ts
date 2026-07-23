import { ConfidenceExtractor } from "../extractors/ConfidenceExtractor";
import { InsightExtractor } from "../extractors/InsightExtractor";
import { ReasoningExtractor } from "../extractors/ReasoningExtractor";
import { ReferenceExtractor } from "../extractors/ReferenceExtractor";
import { SectionExtractor } from "../extractors/SectionExtractor";
import { ToolCallExtractor } from "../extractors/ToolCallExtractor";
import { parseSections } from "../parsers/sectionHelpers";
import { STRUCTURED_COACH_CONTENT } from "../testSupport/fixtures";

describe("response-formatter extractors", () => {
  const sections = parseSections(STRUCTURED_COACH_CONTENT);

  it("ReasoningExtractor reads reasoning section", () => {
    const reasoning = new ReasoningExtractor().extract(
      sections,
      STRUCTURED_COACH_CONTENT,
    );
    expect(reasoning).toContain("Volume can increase");
  });

  it("InsightExtractor merges insights and reasoning", () => {
    const insights = new InsightExtractor().extract(
      sections,
      "Volume can increase",
    );
    expect(insights.length).toBeGreaterThanOrEqual(2);
    expect(insights.some((i) => i.kind === "reasoning")).toBe(true);
  });

  it("ConfidenceExtractor reads explicit confidence", () => {
    const confidence = new ConfidenceExtractor().extract(
      sections,
      STRUCTURED_COACH_CONTENT,
    );
    expect(confidence.score).toBeCloseTo(0.82);
    expect(confidence.source).toBe("explicit");
  });

  it("ToolCallExtractor finds tool markers", () => {
    const calls = new ToolCallExtractor().extract(
      "tool_call: get_workout_history(days=7)",
    );
    expect(calls).toHaveLength(1);
    expect(calls[0].name).toBe("get_workout_history");
  });

  it("ReferenceExtractor finds markdown links", () => {
    const refs = new ReferenceExtractor().extract(
      "See [Guide](https://example.com/guide) for details.",
    );
    expect(refs[0].title).toBe("Guide");
    expect(refs[0].url).toBe("https://example.com/guide");
  });

  it("SectionExtractor returns frozen sections", () => {
    const extracted = new SectionExtractor().extract(STRUCTURED_COACH_CONTENT);
    expect(extracted.length).toBeGreaterThan(5);
    expect(Object.isFrozen(extracted[0])).toBe(true);
  });
});
