import {
  createCoachSummary,
  createInsights,
  createRecommendations,
  createRiskFlags,
  createSnapshot,
} from "../../testSupport/fixtures";
import { buildAthleteContext } from "../buildAthleteContext";
import { buildCoachContext } from "../buildCoachContext";
import { buildMetadata, PROMPT_SCHEMA_VERSION } from "../buildMetadata";
import { buildPerformanceContext } from "../buildPerformanceContext";
import { buildPromptContext } from "../buildPromptContext";
import { buildSections, PROMPT_SECTION_IDS } from "../buildSections";
import { buildTrainingContext } from "../buildTrainingContext";
import { validatePromptContext } from "../validatePromptContext";

describe("prompt-builder utilities", () => {
  const summary = createCoachSummary();
  const insights = createInsights();
  const riskFlags = createRiskFlags();
  const recommendations = createRecommendations();

  it("buildAthleteContext maps recovery and consistency", () => {
    const result = buildAthleteContext(summary);

    expect(result.recovery.level).toBe("moderate");
    expect(result.consistencyScore).toBe(0.82);
  });

  it("buildTrainingContext maps volume and frequency trends", () => {
    const result = buildTrainingContext(summary);

    expect(result.volumeTrend.direction).toBe("increasing");
    expect(result.frequencyTrend.metric).toBe("frequency");
  });

  it("buildPerformanceContext filters PR and plateau insights", () => {
    const result = buildPerformanceContext({ summary, insights });

    expect(result.progress.recentPRCount).toBe(1);
    expect(result.personalRecordInsights).toHaveLength(1);
    expect(result.personalRecordInsights[0]?.kind).toBe("recent_pr");
    expect(result.plateauInsights).toHaveLength(1);
    expect(result.plateauInsights[0]?.kind).toBe("exercise_plateau");
  });

  it("buildCoachContext freezes risks, recommendations, and insights", () => {
    const result = buildCoachContext({
      riskFlags,
      recommendations,
      insights,
    });

    expect(result.riskFlags).toHaveLength(1);
    expect(result.recommendations[0]?.code).toBe("vary_exercises");
    expect(result.insights).toHaveLength(2);
  });

  it("buildMetadata copies counts and schema version", () => {
    const result = buildMetadata({
      summary,
      generatedAt: "2026-07-21T15:00:00.000Z",
    });

    expect(result.generatedAt).toBe("2026-07-21T15:00:00.000Z");
    expect(result.sourceGeneratedAt).toBe(summary.generatedAt);
    expect(result.insightCount).toBe(2);
    expect(result.riskCount).toBe(1);
    expect(result.recommendationCount).toBe(1);
    expect(result.schemaVersion).toBe(PROMPT_SCHEMA_VERSION);
  });

  it("buildSections returns canonical ordered section ids", () => {
    const sections = buildSections();

    expect(sections.map((section) => section.id)).toEqual([
      ...PROMPT_SECTION_IDS,
    ]);
    expect(sections.every((section) => section.included)).toBe(true);
  });

  it("buildPromptContext assembles a complete structured context", () => {
    const snapshot = createSnapshot();
    const context = buildPromptContext(snapshot, {
      generatedAt: "2026-07-21T15:00:00.000Z",
    });

    expect(context.athlete.consistencyScore).toBe(0.82);
    expect(context.training.volumeTrend.direction).toBe("increasing");
    expect(context.performance.personalRecordInsights).toHaveLength(1);
    expect(context.coach.recommendations).toHaveLength(1);
    expect(context.metadata.schemaVersion).toBe(1);
    expect(context.sections).toHaveLength(PROMPT_SECTION_IDS.length);
    expect(validatePromptContext(context)).toEqual([]);
  });

  it("validatePromptContext reports consistency and count issues", () => {
    const snapshot = createSnapshot();
    const context = buildPromptContext(snapshot, {
      generatedAt: "2026-07-21T15:00:00.000Z",
    });

    const invalid = Object.freeze({
      ...context,
      athlete: Object.freeze({
        ...context.athlete,
        consistencyScore: 1.5,
      }),
      metadata: Object.freeze({
        ...context.metadata,
        insightCount: 99,
      }),
    });

    expect(validatePromptContext(invalid)).toEqual(
      Object.freeze([
        "invalid_consistency_score",
        "metadata_count_mismatch",
      ]),
    );
  });

  it("validatePromptContext reports missing sections", () => {
    const snapshot = createSnapshot();
    const context = buildPromptContext(snapshot, {
      generatedAt: "2026-07-21T15:00:00.000Z",
    });

    const invalid = Object.freeze({
      ...context,
      sections: Object.freeze([
        Object.freeze({ id: "athlete" as const, included: true }),
      ]),
    });

    const issues = validatePromptContext(invalid);
    expect(issues).toContain("missing_required_section");
    expect(issues).toContain("section_order_mismatch");
  });
});
