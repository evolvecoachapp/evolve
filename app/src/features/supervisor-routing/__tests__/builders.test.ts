import { buildRoutingContext } from "../builders/RoutingContextBuilder";
import { buildRoutingGraph } from "../builders/RoutingGraphBuilder";
import { buildRoutingSummary } from "../builders/RoutingSummaryBuilder";
import { createRoutingEngine } from "../routing/RoutingEngine";
import {
  createMockCapabilityRegistry,
  createRoutingRequest,
  createFixedClock,
} from "../testSupport/fixtures";
import { RoutingNodeKinds } from "../models/RoutingNode";

describe("supervisor-routing builders", () => {
  it("builds immutable context / graph / summary", () => {
    const engine = createRoutingEngine({
      registry: createMockCapabilityRegistry(),
      clock: createFixedClock(),
    });
    const request = createRoutingRequest();
    const coordinated = engine.buildPlan(request);
    expect(coordinated.plan).not.toBeNull();

    const context = buildRoutingContext({
      id: "context:test",
      request,
      registryId: "registry:capability:test",
      capabilityIds: ["GenerateWorkout"],
      candidateAgentIds: ["agent:workout"],
      createdAt: createFixedClock()(),
    });
    expect(Object.isFrozen(context)).toBe(true);

    const graph = buildRoutingGraph({
      id: "graph:test",
      planId: coordinated.plan!.id,
      nodes: [
        {
          id: "node:capability:GenerateWorkout",
          kind: RoutingNodeKinds.CAPABILITY,
          label: "GenerateWorkout",
          subjectId: "GenerateWorkout",
          agentId: "agent:workout",
          capabilityId: "GenerateWorkout",
        },
      ],
      edges: [],
    });
    expect(graph.acyclic).toBe(true);
    expect(Object.isFrozen(graph)).toBe(true);

    const summary = buildRoutingSummary({
      id: "summary:test",
      plan: coordinated.plan!,
    });
    expect(summary.agentIds).toContain("agent:workout");
    expect(Object.isFrozen(summary)).toBe(true);
  });
});
