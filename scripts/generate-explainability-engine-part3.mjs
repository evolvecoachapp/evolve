/**
 * Sprint 22.5 — Explainability Engine generator (part 3: trace, builders, core).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("app/src/features/explainability-engine");
let fileCount = 0;

function write(rel, contents) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents.replace(/\r?\n/g, "\n"), "utf8");
  fileCount++;
}

// ─── TRACE ────────────────────────────────────────────────────────────────────

write(
  "trace/DecisionTraceBuilder.ts",
  `import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import type { ExplanationTrace } from "../models/ExplanationTrace";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { createTraceStep } from "../utils/TraceHelpers";
import { freezeTrace } from "../utils/FreezeExplanationState";

export function buildDecisionTrace(input: {
  readonly decision: CoachingDecision;
  readonly at: string;
}): ExplanationTrace {
  return freezeTrace({
    id: \`trace:decision:\${input.decision.id}\`,
    steps: Object.freeze([
      createTraceStep({ id: \`step:decision:load:\${input.decision.id}\`, operation: "load_decision", subjectId: input.decision.id, outputKeys: Object.freeze([input.decision.id]) }),
      createTraceStep({ id: \`step:decision:reason:\${input.decision.id}\`, operation: "derive_reasons", subjectId: input.decision.id, inputKeys: Object.freeze([input.decision.id]) }),
    ]),
    subjectId: input.decision.id,
    metadata: EMPTY_EXPLANATION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "trace/RecommendationTraceBuilder.ts",
  `import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import type { ExplanationTrace } from "../models/ExplanationTrace";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { createTraceStep } from "../utils/TraceHelpers";
import { freezeTrace } from "../utils/FreezeExplanationState";

export function buildRecommendationTrace(input: {
  readonly recommendation: CoachingRecommendation;
  readonly at: string;
}): ExplanationTrace {
  return freezeTrace({
    id: \`trace:rec:\${input.recommendation.id}\`,
    steps: Object.freeze([
      createTraceStep({ id: \`step:rec:load:\${input.recommendation.id}\`, operation: "load_recommendation", subjectId: input.recommendation.id, outputKeys: Object.freeze([input.recommendation.id]) }),
      createTraceStep({ id: \`step:rec:reason:\${input.recommendation.id}\`, operation: "derive_reasons", subjectId: input.recommendation.id, inputKeys: Object.freeze([input.recommendation.decisionId]) }),
    ]),
    subjectId: input.recommendation.id,
    metadata: EMPTY_EXPLANATION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "trace/DependencyTraceBuilder.ts",
  `import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import type { ExplanationTrace } from "../models/ExplanationTrace";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { createTraceStep } from "../utils/TraceHelpers";
import { freezeTrace } from "../utils/FreezeExplanationState";

export function buildDependencyTrace(input: {
  readonly recommendation: CoachingRecommendation;
  readonly at: string;
}): ExplanationTrace {
  const depIds = input.recommendation.dependencies.map((d) => d.id);
  return freezeTrace({
    id: \`trace:dep:\${input.recommendation.id}\`,
    steps: Object.freeze([
      createTraceStep({ id: \`step:dep:resolve:\${input.recommendation.id}\`, operation: "resolve_dependencies", subjectId: input.recommendation.id, inputKeys: Object.freeze(depIds), outputKeys: Object.freeze(depIds) }),
    ]),
    subjectId: input.recommendation.id,
    metadata: EMPTY_EXPLANATION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "trace/TimelineTraceBuilder.ts",
  `import type { ExplanationTimeline } from "../models/ExplanationTimeline";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeTimeline, freezeTimelineItem } from "../utils/FreezeExplanationState";

export function buildExplanationTimeline(input: {
  readonly id: string;
  readonly subjectIds: readonly string[];
  readonly at: string;
}): ExplanationTimeline {
  return freezeTimeline({
    id: input.id,
    items: Object.freeze(
      input.subjectIds.map((subjectId, i) =>
        freezeTimelineItem({
          id: \`timeline:\${subjectId}:\${i}\`,
          subjectId,
          operation: "explain",
          at: input.at,
          metadata: EMPTY_EXPLANATION_METADATA,
        }),
      ),
    ),
    createdAt: input.at,
  });
}
`,
);

write(
  "trace/GraphTraceBuilder.ts",
  `import type { CoachingExplanation } from "../models/CoachingExplanation";
import { ExplanationEdgeKinds } from "../models/ExplanationEdge";
import { ExplanationNodeKinds } from "../models/ExplanationNode";
import type { ExplanationGraph } from "../models/ExplanationGraph";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeEdge, freezeGraph, freezeNode } from "../utils/FreezeExplanationState";

export function buildExplanationGraph(input: {
  readonly id: string;
  readonly explanations: readonly CoachingExplanation[];
  readonly at: string;
}): ExplanationGraph {
  const nodes = [];
  const edges = [];
  for (const e of input.explanations) {
    nodes.push(freezeNode({ id: \`node:rec:\${e.recommendationId}\`, kind: ExplanationNodeKinds.RECOMMENDATION, subjectId: e.recommendationId, labelKey: \`recommendation.\${e.recommendationLink.category}\`, metadata: EMPTY_EXPLANATION_METADATA }));
    nodes.push(freezeNode({ id: \`node:dec:\${e.decisionId}\`, kind: ExplanationNodeKinds.DECISION, subjectId: e.decisionId, labelKey: \`decision.\${e.decisionLink.category}\`, metadata: EMPTY_EXPLANATION_METADATA }));
    edges.push(freezeEdge({ id: \`edge:\${e.id}:derives\`, kind: ExplanationEdgeKinds.DERIVES_FROM, fromNodeId: \`node:dec:\${e.decisionId}\`, toNodeId: \`node:rec:\${e.recommendationId}\`, metadata: EMPTY_EXPLANATION_METADATA }));
    for (const r of e.reasons) {
      nodes.push(freezeNode({ id: \`node:reason:\${r.id}\`, kind: ExplanationNodeKinds.REASON, subjectId: r.subjectId, labelKey: r.statementKey, metadata: EMPTY_EXPLANATION_METADATA }));
      edges.push(freezeEdge({ id: \`edge:\${r.id}:supports\`, kind: ExplanationEdgeKinds.SUPPORTS, fromNodeId: \`node:reason:\${r.id}\`, toNodeId: \`node:rec:\${e.recommendationId}\`, metadata: EMPTY_EXPLANATION_METADATA }));
    }
  }
  return freezeGraph({ id: input.id, nodes: Object.freeze(nodes), edges: Object.freeze(edges), metadata: EMPTY_EXPLANATION_METADATA, createdAt: input.at });
}
`,
);

write(
  "trace/index.ts",
  `export * from "./DecisionTraceBuilder";
export * from "./DependencyTraceBuilder";
export * from "./GraphTraceBuilder";
export * from "./RecommendationTraceBuilder";
export * from "./TimelineTraceBuilder";
`,
);

// ─── BUILDERS ─────────────────────────────────────────────────────────────────

write(
  "builders/ExplanationBuilder.ts",
  `import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import type { CoachingExplanation } from "../models/CoachingExplanation";
import { ExplanationSectionKinds } from "../models/ExplanationSection";
import { priorityForOrdinal } from "../models/ExplanationPriority";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { buildConstraintEvidence, buildDecisionEvidence, buildDependencyEvidence, buildRecommendationEvidence } from "../evidence";
import { deriveConfidenceReasons, deriveConsistencyReasons, deriveConstraintReasons, deriveDecisionReasons, deriveDependencyReasons, derivePriorityReasons, deriveRecommendationReasons } from "../reasoning";
import { freezeExplanation, freezeSection } from "../utils/FreezeExplanationState";

export function buildExplanation(input: {
  readonly decision: CoachingDecision;
  readonly recommendation: CoachingRecommendation;
  readonly focusAreaKeys: readonly string[];
  readonly at: string;
}): CoachingExplanation {
  const { decision, recommendation, at } = input;
  const decisionReasons = deriveDecisionReasons({ decision });
  const recReasons = deriveRecommendationReasons({ recommendation });
  const depReasons = deriveDependencyReasons({ recommendation });
  const constraintReasons = deriveConstraintReasons({ recommendation });
  const priorityReasons = derivePriorityReasons({ recommendation });
  const consistencyReasons = deriveConsistencyReasons({ decision, recommendation });
  const confidenceReasons = deriveConfidenceReasons({ recommendation });
  const reasons = Object.freeze([...decisionReasons, ...recReasons, ...depReasons, ...constraintReasons, ...priorityReasons, ...consistencyReasons, ...confidenceReasons]);

  const evidence = Object.freeze([
    ...buildDecisionEvidence({ decision }),
    ...buildRecommendationEvidence({ recommendation }),
    ...buildConstraintEvidence({ recommendation }),
    ...buildDependencyEvidence({ recommendation }),
  ]);

  const sections = Object.freeze([
    freezeSection({ id: \`section:reasons:\${recommendation.id}\`, kind: ExplanationSectionKinds.REASONS, key: "reasons", subjectId: recommendation.id, itemKeys: Object.freeze(reasons.map((r) => r.id)), metadata: EMPTY_EXPLANATION_METADATA }),
    freezeSection({ id: \`section:evidence:\${recommendation.id}\`, kind: ExplanationSectionKinds.EVIDENCE, key: "evidence", subjectId: recommendation.id, itemKeys: Object.freeze(evidence.map((e) => e.key)), metadata: EMPTY_EXPLANATION_METADATA }),
  ]);

  return freezeExplanation({
    id: \`explanation:\${recommendation.id}\`,
    athleteId: recommendation.athleteId,
    sessionId: recommendation.sessionId,
    conversationId: recommendation.conversationId,
    contextId: recommendation.contextId,
    recommendationId: recommendation.id,
    decisionId: decision.id,
    reasons,
    evidence,
    sections,
    confidence: Object.freeze({ level: recommendation.confidence.level, score: recommendation.confidence.score, evidenceCount: evidence.length, notes: Object.freeze([]) }),
    priority: priorityForOrdinal(recommendation.priority.ordinal),
    decisionLink: Object.freeze({ id: \`link:dec:\${decision.id}\`, decisionId: decision.id, explanationId: \`explanation:\${recommendation.id}\`, category: decision.category, intent: decision.intent, outcome: decision.outcome, metadata: EMPTY_EXPLANATION_METADATA }),
    recommendationLink: Object.freeze({ id: \`link:rec:\${recommendation.id}\`, recommendationId: recommendation.id, explanationId: \`explanation:\${recommendation.id}\`, category: recommendation.category, intent: recommendation.intent, type: recommendation.type, metadata: EMPTY_EXPLANATION_METADATA }),
    contextReference: Object.freeze({ id: \`ctxref:\${recommendation.contextId}\`, contextId: recommendation.contextId, athleteId: recommendation.athleteId, focusAreaKeys: Object.freeze([...input.focusAreaKeys]), metadata: EMPTY_EXPLANATION_METADATA }),
    sourceKeys: Object.freeze([...new Set([...decision.sourceKeys, ...recommendation.sourceKeys])]),
    metadata: EMPTY_EXPLANATION_METADATA,
    createdAt: at,
  });
}

export function buildExplanationsFromPairs(input: {
  readonly decisions: readonly CoachingDecision[];
  readonly recommendations: readonly CoachingRecommendation[];
  readonly focusAreaKeys: readonly string[];
  readonly at: string;
}): readonly CoachingExplanation[] {
  const decisionById = new Map(input.decisions.map((d) => [d.id, d]));
  return Object.freeze(
    input.recommendations.map((r) => {
      const decision = decisionById.get(r.decisionId);
      if (!decision) throw new Error(\`Missing decision for recommendation \${r.id}\`);
      return buildExplanation({ decision, recommendation: r, focusAreaKeys: input.focusAreaKeys, at: input.at });
    }),
  );
}
`,
);

write(
  "builders/SummaryBuilder.ts",
  `import type { CoachingExplanation } from "../models/CoachingExplanation";
import type { ExplanationSummary } from "../models/ExplanationSummary";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { collectReasonCodes } from "../utils/ExplanationHelpers";
import { freezeSummary } from "../utils/FreezeExplanationState";

export function buildExplanationSummary(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly explanations: readonly CoachingExplanation[];
  readonly focusAreaKeys: readonly string[];
  readonly at: string;
}): ExplanationSummary {
  const reasonCodes = collectReasonCodes(input.explanations);
  let evidenceCount = 0;
  for (const e of input.explanations) evidenceCount += e.evidence.length;
  return freezeSummary({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    explanationCount: input.explanations.length,
    reasonCodeKeys: reasonCodes,
    evidenceKeyCount: evidenceCount,
    focusAreaKeys: Object.freeze([...input.focusAreaKeys]),
    metadata: EMPTY_EXPLANATION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "builders/SnapshotBuilder.ts",
  `import type { CoachingExplanation } from "../models/CoachingExplanation";
import type { ExplanationSnapshot } from "../models/ExplanationSnapshot";
import type { ExplanationSummary } from "../models/ExplanationSummary";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeSnapshot } from "../utils/FreezeExplanationState";

export function buildExplanationSnapshot(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly explanations: readonly CoachingExplanation[];
  readonly summary: ExplanationSummary | null;
  readonly at: string;
}): ExplanationSnapshot {
  return freezeSnapshot({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    explanations: input.explanations,
    summary: input.summary,
    metadata: EMPTY_EXPLANATION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "builders/GraphBuilder.ts",
  `export { buildExplanationGraph } from "../trace/GraphTraceBuilder";
`,
);

write(
  "builders/TimelineBuilder.ts",
  `export { buildExplanationTimeline } from "../trace/TimelineTraceBuilder";
`,
);

write(
  "builders/LLMFormatterInputBuilder.ts",
  `import type { CoachingExplanation } from "../models/CoachingExplanation";
import type { ExplanationSummary } from "../models/ExplanationSummary";
import type { LLMFormatterInput } from "../models/LLMFormatterInput";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { collectEvidenceKeys, collectReasonCodes, explanationIds } from "../utils/ExplanationHelpers";
import { freezeLLMFormatterInput } from "../utils/FreezeExplanationState";

export function buildLLMFormatterInput(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly explanations: readonly CoachingExplanation[];
  readonly summary: ExplanationSummary | null;
  readonly at: string;
}): LLMFormatterInput {
  const sectionKeys = Object.freeze(input.explanations.flatMap((e) => e.sections.map((s) => s.key)));
  return freezeLLMFormatterInput({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    explanationIds: explanationIds(input.explanations),
    sectionKeys,
    reasonCodes: collectReasonCodes(input.explanations),
    evidenceKeys: collectEvidenceKeys(input.explanations),
    summary: input.summary,
    metadata: EMPTY_EXPLANATION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "builders/DescriptorBuilder.ts",
  `import type { ExplanationDescriptor } from "../models/ExplanationDescriptor";
import { freezeDescriptor } from "../utils/FreezeExplanationState";

export function buildExplanationDescriptor(input: {
  readonly id: string;
  readonly createdAt: string;
}): ExplanationDescriptor {
  return freezeDescriptor({
    id: input.id,
    name: "Explainability Engine",
    version: "22.5.0",
    capabilities: Object.freeze([
      "buildExplanation",
      "validateExplanation",
      "describeExplanation",
      "createExplanationSnapshot",
      "packageExplanation",
    ]),
    boundaries: Object.freeze([
      "No AI reasoning",
      "No NL generation",
      "No decision mutation",
      "Structured explanations only",
    ]),
    createdAt: input.createdAt,
  });
}
`,
);

write(
  "builders/ResultBuilder.ts",
  `import type { ExplanationResult } from "../models/ExplanationResult";
import { freezeResult } from "../utils/FreezeExplanationState";

export function buildExplanationResult(
  result: Omit<ExplanationResult, never> & Partial<ExplanationResult>,
): ExplanationResult {
  return freezeResult({
    id: result.id,
    operation: result.operation,
    success: result.success,
    explanations: result.explanations ?? Object.freeze([]),
    package: result.package ?? null,
    summary: result.summary ?? null,
    snapshot: result.snapshot ?? null,
    llmFormatterInput: result.llmFormatterInput ?? null,
    validation: result.validation ?? null,
    descriptor: result.descriptor ?? null,
    errors: result.errors ?? Object.freeze([]),
    createdAt: result.createdAt,
  });
}
`,
);

write(
  "builders/PackageBuilder.ts",
  `import type { CoachingExplanation } from "../models/CoachingExplanation";
import type { ExplanationPackage } from "../models/ExplanationPackage";
import type { ExplanationSummary } from "../models/ExplanationSummary";
import type { ExplanationGraph } from "../models/ExplanationGraph";
import type { ExplanationTrace } from "../models/ExplanationTrace";
import type { ExplanationTimeline } from "../models/ExplanationTimeline";
import type { LLMFormatterInput } from "../models/LLMFormatterInput";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezePackage } from "../utils/FreezeExplanationState";

export function buildExplanationPackage(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly explanations: readonly CoachingExplanation[];
  readonly summary: ExplanationSummary | null;
  readonly snapshot: ExplanationPackage["snapshot"];
  readonly graph: ExplanationGraph | null;
  readonly trace: ExplanationTrace | null;
  readonly timeline: ExplanationTimeline | null;
  readonly llmFormatterInput: LLMFormatterInput | null;
  readonly at: string;
}): ExplanationPackage {
  const byCategory: Record<string, number> = {};
  const byReasonCode: Record<string, number> = {};
  let evidenceCount = 0;
  for (const e of input.explanations) {
    byCategory[e.recommendationLink.category] = (byCategory[e.recommendationLink.category] ?? 0) + 1;
    evidenceCount += e.evidence.length;
    for (const r of e.reasons) byReasonCode[r.code] = (byReasonCode[r.code] ?? 0) + 1;
  }
  return freezePackage({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    explanations: input.explanations,
    summary: input.summary,
    snapshot: input.snapshot,
    graph: input.graph,
    trace: input.trace,
    timeline: input.timeline,
    statistics: Object.freeze({ totalExplanations: input.explanations.length, byCategory: Object.freeze(byCategory), byReasonCode: Object.freeze(byReasonCode), evidenceCount }),
    diagnostics: Object.freeze({ notes: Object.freeze(["explainability pipeline complete"]), warnings: Object.freeze([]), processingSteps: Object.freeze(["resolve_inputs", "gather_evidence", "build_reasoning", "build_traces", "build_explanations", "build_graph", "package"]) }),
    llmFormatterInput: input.llmFormatterInput,
    dependencies: Object.freeze([]),
    constraints: Object.freeze([]),
    conflicts: Object.freeze([]),
    resolutions: Object.freeze([]),
    metadata: EMPTY_EXPLANATION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "builders/index.ts",
  `export * from "./DescriptorBuilder";
export * from "./ExplanationBuilder";
export * from "./GraphBuilder";
export * from "./LLMFormatterInputBuilder";
export * from "./PackageBuilder";
export * from "./ResultBuilder";
export * from "./SnapshotBuilder";
export * from "./SummaryBuilder";
export * from "./TimelineBuilder";
`,
);

console.log(`Generated ${fileCount} files (part 3)...`);
