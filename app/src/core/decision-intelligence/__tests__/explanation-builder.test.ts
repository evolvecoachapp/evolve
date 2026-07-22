import { ExplanationBuilder } from "../builders";
import { DecisionRecorder } from "../recorder";
import type { DecisionContext } from "../models";

function context(generationId: string): DecisionContext {
  return Object.freeze({
    generationId,
    stage: "programming",
    pipelineStep: "programming",
    athleteId: "athlete-1",
    dayId: "day-1",
    weekNumber: 1,
    subjectId: "ex-1",
  });
}

describe("ExplanationBuilder", () => {
  it("builds human, developer, compact, and detailed explanations", () => {
    const recorder = new DecisionRecorder("gen-e");
    recorder.record({
      id: "d1",
      category: "programming",
      summaryCode: "volume_set",
      title: "Set volume",
      reasons: [{ code: "role_volume", weight: 0.8, detail: "primary" }],
      evidence: [{ code: "sets", source: "programming", value: 3 }],
      context: context("gen-e"),
      metadata: { tags: ["programming"], attributes: { sets: 3 } },
    });
    const graph = recorder.buildGraph();
    const builder = new ExplanationBuilder();

    const human = builder.explainDecision(graph.nodes[0]!, "human");
    const developer = builder.explainDecision(graph.nodes[0]!, "developer");
    const compact = builder.explainDecision(graph.nodes[0]!, "compact");
    const detailed = builder.explainDecision(graph.nodes[0]!, "detailed");

    expect(human.text).toContain("Set volume");
    expect(developer.text).toContain("volume_set");
    expect(compact.text).toBe("volume_set@programming");
    expect(detailed.text).toContain("Confidence:");

    const report = builder.buildReport(graph);
    expect(report.human).toHaveLength(1);
    expect(report.developer).toHaveLength(1);
    expect(report.compact).toHaveLength(1);
    expect(report.detailed).toHaveLength(1);
    expect(report.summaryText).toContain("1 domain decisions");
  });
});
