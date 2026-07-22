import { DecisionRecorder } from "../recorder";
import { buildGraph, normalizeGraph } from "../utils";
import { DecisionGraphService } from "../graph";
import { validateDecisionGraph } from "../validators";
import type { DecisionContext } from "../models";

function context(
  generationId: string,
  overrides: Partial<DecisionContext> = {},
): DecisionContext {
  return Object.freeze({
    generationId,
    stage: "selection",
    pipelineStep: "selection",
    athleteId: "athlete-1",
    dayId: "day-1",
    weekNumber: 1,
    subjectId: "subject-1",
    ...overrides,
  });
}

describe("DecisionRecorder", () => {
  it("records domain decisions and parent relationships", () => {
    const recorder = new DecisionRecorder("gen-1");
    const root = recorder.record({
      id: "d1",
      category: "orchestration",
      summaryCode: "root",
      title: "Root",
      context: context("gen-1", { stage: "orchestration", pipelineStep: null }),
    });
    const child = recorder.record({
      id: "d2",
      category: "selection",
      summaryCode: "picked",
      title: "Picked",
      parentIds: [root.id],
      reasons: [{ code: "fit", weight: 1 }],
      evidence: [{ code: "count", source: "selection", value: 3 }],
      context: context("gen-1"),
    });

    expect(child.parentIds).toEqual([root.id]);
    expect(recorder.getDecisionCount()).toBe(2);

    const graph = recorder.buildGraph();
    expect(graph.nodes).toHaveLength(2);
    expect(graph.rootIds).toContain("d1");
    expect(graph.edges.some((edge) => edge.kind === "derived_from")).toBe(true);
    expect(recorder.isSealed).toBe(true);
  });

  it("rejects duplicate ids and sealed mutations", () => {
    const recorder = new DecisionRecorder("gen-1");
    recorder.record({
      id: "d1",
      category: "blueprint",
      summaryCode: "bp",
      title: "BP",
      context: context("gen-1", { stage: "blueprint", pipelineStep: "blueprint" }),
    });
    expect(() =>
      recorder.record({
        id: "d1",
        category: "blueprint",
        summaryCode: "bp",
        title: "BP",
        context: context("gen-1", { stage: "blueprint", pipelineStep: "blueprint" }),
      }),
    ).toThrow(/duplicate/);

    recorder.buildGraph();
    expect(() =>
      recorder.record({
        id: "d2",
        category: "selection",
        summaryCode: "x",
        title: "X",
        context: context("gen-1"),
      }),
    ).toThrow(/sealed/);
  });

  it("rejects invalid confidence", () => {
    const recorder = new DecisionRecorder("gen-1");
    expect(() =>
      recorder.record({
        id: "d1",
        category: "selection",
        summaryCode: "x",
        title: "X",
        confidence: 1.5,
        context: context("gen-1"),
      }),
    ).toThrow(/confidence/);
  });
});

describe("DecisionGraph", () => {
  it("normalizes and validates dependency chains", () => {
    const recorder = new DecisionRecorder("gen-g");
    recorder.record({
      id: "a",
      category: "blueprint",
      summaryCode: "a",
      title: "A",
      context: context("gen-g", { stage: "blueprint", pipelineStep: "blueprint" }),
    });
    recorder.record({
      id: "b",
      category: "selection",
      summaryCode: "b",
      title: "B",
      parentIds: ["a"],
      context: context("gen-g"),
    });
    const graph = normalizeGraph(recorder.buildGraph());
    expect(validateDecisionGraph(graph)).toEqual([]);

    const service = new DecisionGraphService();
    expect(service.getChildren(graph, "a").map((n) => n.id)).toEqual(["b"]);
    expect(service.getAncestors(graph, "b").map((n) => n.id)).toEqual(["a"]);
    expect(service.propagateReasons(graph, "b")).toEqual(["a", "b"]);
  });

  it("detects missing parents and invalid edges", () => {
    const graph = buildGraph(
      "gen-bad",
      [
        {
          id: "orphan",
          category: "selection",
          summaryCode: "o",
          title: "O",
          severity: "info",
          confidence: 1,
          reasons: [],
          evidence: [],
          context: context("gen-bad"),
          metadata: { tags: [], attributes: {} },
          parentIds: ["missing"],
          sequence: 0,
        },
      ],
      [
        {
          id: "edge:bad",
          fromId: "missing",
          toId: "orphan",
          kind: "depends_on",
          reasonCode: null,
        },
      ],
    );

    const issues = validateDecisionGraph(graph);
    expect(issues.some((issue) => issue.startsWith("missing_parent"))).toBe(
      true,
    );
    expect(issues.some((issue) => issue.startsWith("invalid_edge"))).toBe(true);
  });
});
