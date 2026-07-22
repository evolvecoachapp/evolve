import type { DecisionCategory } from "../models/DecisionCategory";
import type { DecisionConfidence } from "../models/DecisionConfidence";
import { isValidDecisionConfidence } from "../models/DecisionConfidence";
import type { DecisionContext } from "../models/DecisionContext";
import type { DecisionEdge, DecisionEdgeKind } from "../models/DecisionEdge";
import type { DecisionEvidence } from "../models/DecisionEvidence";
import type { DecisionGraph } from "../models/DecisionGraph";
import type { DecisionMetadata } from "../models/DecisionMetadata";
import type { DecisionNode } from "../models/DecisionNode";
import type { DecisionReason } from "../models/DecisionReason";
import type { DecisionSeverity } from "../models/DecisionSeverity";
import { buildGraph } from "../utils/buildGraph";
import { freezeDecisionEdge, freezeDecisionNode } from "../utils/freezeReports";
import { normalizeGraph } from "../utils/normalizeGraph";

export interface RecordDecisionInput {
  readonly id: string;
  readonly category: DecisionCategory;
  readonly summaryCode: string;
  readonly title: string;
  readonly severity?: DecisionSeverity;
  readonly confidence?: DecisionConfidence;
  readonly reasons?: readonly DecisionReason[];
  readonly evidence?: readonly DecisionEvidence[];
  readonly context: DecisionContext;
  readonly metadata?: DecisionMetadata;
  readonly parentIds?: readonly string[];
}

/**
 * Records domain decisions and builds an immutable decision graph.
 *
 * Never records implementation details — only domain decisions.
 */
export class DecisionRecorder {
  private readonly generationId: string;
  private readonly nodes: DecisionNode[] = [];
  private readonly edges: DecisionEdge[] = [];
  private sequence = 0;
  private sealed = false;

  constructor(generationId: string) {
    this.generationId = generationId;
  }

  get isSealed(): boolean {
    return this.sealed;
  }

  getDecisionCount(): number {
    return this.nodes.length;
  }

  /**
   * Record a domain decision associated with a pipeline stage.
   */
  record(input: RecordDecisionInput): DecisionNode {
    this.assertOpen();

    const confidence = input.confidence ?? 1;
    if (!isValidDecisionConfidence(confidence)) {
      throw new Error(
        `DecisionRecorder: confidence out of range for ${input.id}`,
      );
    }

    if (this.nodes.some((node) => node.id === input.id)) {
      throw new Error(`DecisionRecorder: duplicate decision id ${input.id}`);
    }

    const parentIds = Object.freeze([...(input.parentIds ?? [])]);
    const node = freezeDecisionNode({
      id: input.id,
      category: input.category,
      summaryCode: input.summaryCode,
      title: input.title,
      severity: input.severity ?? "info",
      confidence,
      reasons: Object.freeze([...(input.reasons ?? [])].map((r) => Object.freeze({ ...r }))),
      evidence: Object.freeze(
        [...(input.evidence ?? [])].map((e) => Object.freeze({ ...e })),
      ),
      context: Object.freeze({ ...input.context }),
      metadata: Object.freeze({
        tags: Object.freeze([...(input.metadata?.tags ?? [])]),
        attributes: Object.freeze({ ...(input.metadata?.attributes ?? {}) }),
      }),
      parentIds,
      sequence: this.sequence++,
    });

    this.nodes.push(node);

    for (const parentId of parentIds) {
      this.link(parentId, node.id, "derived_from", input.summaryCode);
    }

    return node;
  }

  /**
   * Create a directed relationship between decisions.
   */
  link(
    fromId: string,
    toId: string,
    kind: DecisionEdgeKind = "depends_on",
    reasonCode: string | null = null,
  ): DecisionEdge {
    this.assertOpen();
    const edge = freezeDecisionEdge({
      id: `edge:${fromId}:${toId}:${kind}`,
      fromId,
      toId,
      kind,
      reasonCode,
    });

    if (!this.edges.some((existing) => existing.id === edge.id)) {
      this.edges.push(edge);
    }
    return edge;
  }

  /**
   * Seal the recorder and return an immutable normalized graph.
   */
  buildGraph(): DecisionGraph {
    this.sealed = true;
    return normalizeGraph(
      buildGraph(this.generationId, this.nodes, this.edges),
    );
  }

  /**
   * Snapshot current graph without sealing (for progressive inspection).
   */
  snapshot(): DecisionGraph {
    return normalizeGraph(
      buildGraph(this.generationId, this.nodes, this.edges),
    );
  }

  private assertOpen(): void {
    if (this.sealed) {
      throw new Error("DecisionRecorder is sealed and cannot accept changes");
    }
  }
}
