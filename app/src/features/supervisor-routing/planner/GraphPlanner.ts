import { buildRoutingGraph } from "../builders/RoutingGraphBuilder";
import type { RoutingDependency } from "../models/RoutingDependency";
import type { RoutingGraph } from "../models/RoutingGraph";
import type { RoutingNode } from "../models/RoutingNode";
import { RoutingNodeKinds } from "../models/RoutingNode";
import type { RoutingEdge } from "../models/RoutingEdge";
import type { RoutingStep } from "../models/RoutingStep";
import type { RoutingTarget } from "../models/RoutingTarget";
import { freezeEdge, freezeNode } from "../utils/FreezeRoutingState";

/**
 * Plans an immutable dependency graph for the routing plan.
 */
export class GraphPlanner {
  plan(input: {
    readonly planId: string;
    readonly targets: readonly RoutingTarget[];
    readonly steps: readonly RoutingStep[];
    readonly dependencies: readonly RoutingDependency[];
  }): RoutingGraph {
    const nodes: RoutingNode[] = [];
    const edges: RoutingEdge[] = [];

    for (const target of input.targets) {
      nodes.push(
        freezeNode({
          id: `node:capability:${target.capabilityId}`,
          kind: RoutingNodeKinds.CAPABILITY,
          label: target.capabilityId,
          subjectId: target.capabilityId,
          agentId: target.agentId,
          capabilityId: target.capabilityId,
        }),
      );
      nodes.push(
        freezeNode({
          id: `node:agent:${target.agentId}`,
          kind: RoutingNodeKinds.AGENT,
          label: target.agentId,
          subjectId: target.agentId,
          agentId: target.agentId,
          capabilityId: null,
        }),
      );
      edges.push(
        freezeEdge({
          id: `edge:owner:${target.capabilityId}->${target.agentId}`,
          fromNodeId: `node:capability:${target.capabilityId}`,
          toNodeId: `node:agent:${target.agentId}`,
          required: true,
          label: "owned_by",
        }),
      );
    }

    for (const step of input.steps) {
      nodes.push(
        freezeNode({
          id: `node:step:${step.id}`,
          kind: RoutingNodeKinds.STEP,
          label: step.id,
          subjectId: step.id,
          agentId: step.agentId,
          capabilityId: step.capabilityId,
        }),
      );
    }

    for (const dep of input.dependencies) {
      edges.push(
        freezeEdge({
          id: `edge:dep:${dep.id}`,
          fromNodeId: `node:capability:${dep.fromId}`,
          toNodeId: `node:capability:${dep.toId}`,
          required: dep.required,
          label: dep.description,
        }),
      );
    }

    // Deduplicate nodes by id
    const uniqueNodes = [
      ...new Map(nodes.map((node) => [node.id, node])).values(),
    ];

    return buildRoutingGraph({
      id: `graph:${input.planId}`,
      planId: input.planId,
      nodes: uniqueNodes,
      edges,
    });
  }
}

export function createGraphPlanner(): GraphPlanner {
  return new GraphPlanner();
}
