/**
 * Sprint 22.5 — Explainability Engine generator (part 2: implementation).
 * Run after part 1: node scripts/generate-explainability-engine-part2.mjs
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

// ─── FREEZE UTILS ─────────────────────────────────────────────────────────────

write(
  "utils/FreezeExplanationState.ts",
  `import type { CoachingExplanation } from "../models/CoachingExplanation";
import type { ExplanationConfidence } from "../models/ExplanationConfidence";
import type { ExplanationConflict } from "../models/ExplanationConflict";
import type { ExplanationConstraint } from "../models/ExplanationConstraint";
import type { ExplanationContextReference } from "../models/ExplanationContextReference";
import type { ExplanationDecisionLink } from "../models/ExplanationDecisionLink";
import type { ExplanationDependency } from "../models/ExplanationDependency";
import type { ExplanationDescriptor } from "../models/ExplanationDescriptor";
import type { ExplanationDiagnostics } from "../models/ExplanationDiagnostics";
import type { ExplanationEdge } from "../models/ExplanationEdge";
import type { ExplanationEvidence } from "../models/ExplanationEvidence";
import type { ExplanationGraph } from "../models/ExplanationGraph";
import type { ExplanationInput } from "../models/ExplanationInput";
import type { ExplanationMetadata } from "../models/ExplanationMetadata";
import type { ExplanationNode } from "../models/ExplanationNode";
import type { ExplanationPackage } from "../models/ExplanationPackage";
import type { ExplanationPriority } from "../models/ExplanationPriority";
import type { ExplanationReason } from "../models/ExplanationReason";
import type { ExplanationRecommendationLink } from "../models/ExplanationRecommendationLink";
import type { ExplanationReference } from "../models/ExplanationReference";
import type { ExplanationResolution } from "../models/ExplanationResolution";
import type { ExplanationResult } from "../models/ExplanationResult";
import type { ExplanationSection } from "../models/ExplanationSection";
import type { ExplanationSnapshot } from "../models/ExplanationSnapshot";
import type { ExplanationState } from "../models/ExplanationState";
import type { ExplanationStatistics } from "../models/ExplanationStatistics";
import type { ExplanationStep } from "../models/ExplanationStep";
import type { ExplanationSummary } from "../models/ExplanationSummary";
import type { ExplanationTimeline, ExplanationTimelineItem } from "../models/ExplanationTimeline";
import type { ExplanationTrace } from "../models/ExplanationTrace";
import type { ExplanationValidation } from "../models/ExplanationValidation";
import type { LLMFormatterInput } from "../models/LLMFormatterInput";

export function freezeMetadata(m: ExplanationMetadata): ExplanationMetadata {
  return Object.freeze({ tags: Object.freeze([...m.tags]), attributes: Object.freeze({ ...m.attributes }) });
}

export function freezeConfidence(c: ExplanationConfidence): ExplanationConfidence {
  return Object.freeze({ ...c, notes: Object.freeze([...c.notes]) });
}

export function freezePriority(p: ExplanationPriority): ExplanationPriority {
  return Object.freeze({ ...p });
}

export function freezeReason(r: ExplanationReason): ExplanationReason {
  return Object.freeze({ ...r, evidenceKeys: Object.freeze([...r.evidenceKeys]), metadata: freezeMetadata(r.metadata) });
}

export function freezeEvidence(e: ExplanationEvidence): ExplanationEvidence {
  return Object.freeze({ ...e, valueKeys: Object.freeze([...e.valueKeys]), metadata: freezeMetadata(e.metadata) });
}

export function freezeSection(s: ExplanationSection): ExplanationSection {
  return Object.freeze({ ...s, itemKeys: Object.freeze([...s.itemKeys]), metadata: freezeMetadata(s.metadata) });
}

export function freezeDecisionLink(l: ExplanationDecisionLink): ExplanationDecisionLink {
  return Object.freeze({ ...l, metadata: freezeMetadata(l.metadata) });
}

export function freezeRecommendationLink(l: ExplanationRecommendationLink): ExplanationRecommendationLink {
  return Object.freeze({ ...l, metadata: freezeMetadata(l.metadata) });
}

export function freezeContextReference(r: ExplanationContextReference): ExplanationContextReference {
  return Object.freeze({ ...r, focusAreaKeys: Object.freeze([...r.focusAreaKeys]), metadata: freezeMetadata(r.metadata) });
}

export function freezeExplanation(e: CoachingExplanation): CoachingExplanation {
  return Object.freeze({
    ...e,
    reasons: Object.freeze(e.reasons.map(freezeReason)),
    evidence: Object.freeze(e.evidence.map(freezeEvidence)),
    sections: Object.freeze(e.sections.map(freezeSection)),
    confidence: freezeConfidence(e.confidence),
    priority: freezePriority(e.priority),
    decisionLink: freezeDecisionLink(e.decisionLink),
    recommendationLink: freezeRecommendationLink(e.recommendationLink),
    contextReference: freezeContextReference(e.contextReference),
    sourceKeys: Object.freeze([...e.sourceKeys]),
    metadata: freezeMetadata(e.metadata),
  });
}

export function freezeStep(s: ExplanationStep): ExplanationStep {
  return Object.freeze({ ...s, inputKeys: Object.freeze([...s.inputKeys]), outputKeys: Object.freeze([...s.outputKeys]), metadata: freezeMetadata(s.metadata) });
}

export function freezeTrace(t: ExplanationTrace): ExplanationTrace {
  return Object.freeze({ ...t, steps: Object.freeze(t.steps.map(freezeStep)), metadata: freezeMetadata(t.metadata) });
}

export function freezeNode(n: ExplanationNode): ExplanationNode {
  return Object.freeze({ ...n, metadata: freezeMetadata(n.metadata) });
}

export function freezeEdge(e: ExplanationEdge): ExplanationEdge {
  return Object.freeze({ ...e, metadata: freezeMetadata(e.metadata) });
}

export function freezeGraph(g: ExplanationGraph): ExplanationGraph {
  return Object.freeze({ ...g, nodes: Object.freeze(g.nodes.map(freezeNode)), edges: Object.freeze(g.edges.map(freezeEdge)), metadata: freezeMetadata(g.metadata) });
}

export function freezeSummary(s: ExplanationSummary): ExplanationSummary {
  return Object.freeze({ ...s, reasonCodeKeys: Object.freeze([...s.reasonCodeKeys]), focusAreaKeys: Object.freeze([...s.focusAreaKeys]), metadata: freezeMetadata(s.metadata) });
}

export function freezeSnapshot(s: ExplanationSnapshot): ExplanationSnapshot {
  return Object.freeze({ ...s, explanations: Object.freeze(s.explanations.map(freezeExplanation)), summary: s.summary ? freezeSummary(s.summary) : null, metadata: freezeMetadata(s.metadata) });
}

export function freezeStatistics(s: ExplanationStatistics): ExplanationStatistics {
  return Object.freeze({ ...s, byCategory: Object.freeze({ ...s.byCategory }), byReasonCode: Object.freeze({ ...s.byReasonCode }) });
}

export function freezeDiagnostics(d: ExplanationDiagnostics): ExplanationDiagnostics {
  return Object.freeze({ notes: Object.freeze([...d.notes]), warnings: Object.freeze([...d.warnings]), processingSteps: Object.freeze([...d.processingSteps]) });
}

export function freezeTimelineItem(i: ExplanationTimelineItem): ExplanationTimelineItem {
  return Object.freeze({ ...i, metadata: freezeMetadata(i.metadata) });
}

export function freezeTimeline(t: ExplanationTimeline): ExplanationTimeline {
  return Object.freeze({ ...t, items: Object.freeze(t.items.map(freezeTimelineItem)) });
}

export function freezeLLMFormatterInput(i: LLMFormatterInput): LLMFormatterInput {
  return Object.freeze({ ...i, explanationIds: Object.freeze([...i.explanationIds]), sectionKeys: Object.freeze([...i.sectionKeys]), reasonCodes: Object.freeze([...i.reasonCodes]), evidenceKeys: Object.freeze([...i.evidenceKeys]), summary: i.summary ? freezeSummary(i.summary) : null, metadata: freezeMetadata(i.metadata) });
}

export function freezeDependency(d: ExplanationDependency): ExplanationDependency {
  return Object.freeze({ ...d, metadata: freezeMetadata(d.metadata) });
}

export function freezeConstraint(c: ExplanationConstraint): ExplanationConstraint {
  return Object.freeze({ ...c, subjectKeys: Object.freeze([...c.subjectKeys]), metadata: freezeMetadata(c.metadata) });
}

export function freezeConflict(c: ExplanationConflict): ExplanationConflict {
  return Object.freeze({ ...c, subjectIds: Object.freeze([...c.subjectIds]), metadata: freezeMetadata(c.metadata) });
}

export function freezeResolution(r: ExplanationResolution): ExplanationResolution {
  return Object.freeze({ ...r, loserIds: Object.freeze([...r.loserIds]), notes: Object.freeze([...r.notes]), metadata: freezeMetadata(r.metadata) });
}

export function freezeReference(r: ExplanationReference): ExplanationReference {
  return Object.freeze({ ...r, metadata: freezeMetadata(r.metadata) });
}

export function freezePackage(p: ExplanationPackage): ExplanationPackage {
  return Object.freeze({
    ...p,
    explanations: Object.freeze(p.explanations.map(freezeExplanation)),
    summary: p.summary ? freezeSummary(p.summary) : null,
    snapshot: p.snapshot ? freezeSnapshot(p.snapshot) : null,
    graph: p.graph ? freezeGraph(p.graph) : null,
    trace: p.trace ? freezeTrace(p.trace) : null,
    timeline: p.timeline ? freezeTimeline(p.timeline) : null,
    statistics: freezeStatistics(p.statistics),
    diagnostics: freezeDiagnostics(p.diagnostics),
    llmFormatterInput: p.llmFormatterInput ? freezeLLMFormatterInput(p.llmFormatterInput) : null,
    dependencies: Object.freeze(p.dependencies.map(freezeDependency)),
    constraints: Object.freeze(p.constraints.map(freezeConstraint)),
    conflicts: Object.freeze(p.conflicts.map(freezeConflict)),
    resolutions: Object.freeze(p.resolutions.map(freezeResolution)),
    metadata: freezeMetadata(p.metadata),
  });
}

export function freezeInput(i: ExplanationInput): ExplanationInput {
  return Object.freeze({ ...i, decisions: Object.freeze([...i.decisions]), recommendations: Object.freeze([...i.recommendations]), metadata: freezeMetadata(i.metadata) });
}

export function freezeResult(r: ExplanationResult): ExplanationResult {
  return Object.freeze({
    ...r,
    explanations: Object.freeze(r.explanations.map(freezeExplanation)),
    package: r.package ? freezePackage(r.package) : null,
    summary: r.summary ? freezeSummary(r.summary) : null,
    snapshot: r.snapshot ? freezeSnapshot(r.snapshot) : null,
    llmFormatterInput: r.llmFormatterInput ? freezeLLMFormatterInput(r.llmFormatterInput) : null,
    validation: r.validation ? freezeValidation(r.validation) : null,
    descriptor: r.descriptor ? freezeDescriptor(r.descriptor) : null,
    errors: Object.freeze([...r.errors]),
  });
}

export function freezeState(s: ExplanationState): ExplanationState {
  return Object.freeze({ ...s, package: s.package ? freezePackage(s.package) : null, explanations: Object.freeze(s.explanations.map(freezeExplanation)) });
}

export function freezeDescriptor(d: ExplanationDescriptor): ExplanationDescriptor {
  return Object.freeze({ ...d, capabilities: Object.freeze([...d.capabilities]), boundaries: Object.freeze([...d.boundaries]) });
}

export function freezeValidation(v: ExplanationValidation): ExplanationValidation {
  return Object.freeze({ ...v, issues: Object.freeze([...v.issues]) });
}
`,
);

write(
  "utils/ExplanationHelpers.ts",
  `import type { CoachingExplanation } from "../models/CoachingExplanation";

export function explanationIds(explanations: readonly CoachingExplanation[]): readonly string[] {
  return Object.freeze(explanations.map((e) => e.id));
}

export function collectReasonCodes(explanations: readonly CoachingExplanation[]): readonly string[] {
  const codes = new Set<string>();
  for (const e of explanations) {
    for (const r of e.reasons) codes.add(r.code);
  }
  return Object.freeze([...codes]);
}

export function collectEvidenceKeys(explanations: readonly CoachingExplanation[]): readonly string[] {
  const keys = new Set<string>();
  for (const e of explanations) {
    for (const ev of e.evidence) keys.add(ev.key);
  }
  return Object.freeze([...keys]);
}
`,
);

write(
  "utils/TraceHelpers.ts",
  `import type { ExplanationStep } from "../models/ExplanationStep";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";

export function createTraceStep(input: {
  readonly id: string;
  readonly operation: string;
  readonly subjectId: string;
  readonly inputKeys?: readonly string[];
  readonly outputKeys?: readonly string[];
}): ExplanationStep {
  return Object.freeze({
    id: input.id,
    operation: input.operation,
    subjectId: input.subjectId,
    inputKeys: Object.freeze(input.inputKeys ?? []),
    outputKeys: Object.freeze(input.outputKeys ?? []),
    metadata: EMPTY_EXPLANATION_METADATA,
  });
}
`,
);

write(
  "utils/EvidenceHelpers.ts",
  `import type { ExplanationEvidence } from "../models/ExplanationEvidence";

export function evidenceKeys(evidence: readonly ExplanationEvidence[]): readonly string[] {
  return Object.freeze(evidence.map((e) => e.key));
}
`,
);

write(
  "utils/GraphHelpers.ts",
  `import type { ExplanationEdge } from "../models/ExplanationEdge";
import type { ExplanationNode } from "../models/ExplanationNode";

export function nodeIds(nodes: readonly ExplanationNode[]): readonly string[] {
  return Object.freeze(nodes.map((n) => n.id));
}

export function edgeCount(edges: readonly ExplanationEdge[]): number {
  return edges.length;
}
`,
);

write(
  "utils/FormattingHelpers.ts",
  `export function formatExplanationKey(prefix: string, id: string): string {
  return \`\${prefix}:\${id}\`;
}
`,
);

write(
  "utils/index.ts",
  `export * from "./EvidenceHelpers";
export * from "./ExplanationHelpers";
export * from "./FormattingHelpers";
export * from "./FreezeExplanationState";
export * from "./GraphHelpers";
export * from "./TraceHelpers";
`,
);

// ─── REASONING ────────────────────────────────────────────────────────────────

const reasoningTemplate = (name, fnBody) => `import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import { ExplanationReasonCodes } from "../models/ExplanationReason";
import type { ExplanationReason } from "../models/ExplanationReason";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeReason } from "../utils/FreezeExplanationState";

${fnBody}
`;

write(
  "reasoning/DecisionReasoning.ts",
  reasoningTemplate(
    "DecisionReasoning",
    `export function deriveDecisionReasons(input: {
  readonly decision: CoachingDecision;
}): readonly ExplanationReason[] {
  const d = input.decision;
  return Object.freeze([
    freezeReason({
      id: \`reason:decision:\${d.id}:outcome\`,
      code: ExplanationReasonCodes.DECISION_OUTCOME,
      subjectId: d.id,
      category: d.category,
      statementKey: \`decision.outcome.\${d.outcome}\`,
      evidenceKeys: Object.freeze([...d.sourceKeys]),
      metadata: EMPTY_EXPLANATION_METADATA,
    }),
    freezeReason({
      id: \`reason:decision:\${d.id}:intent\`,
      code: ExplanationReasonCodes.DECISION_INTENT,
      subjectId: d.id,
      category: d.category,
      statementKey: \`decision.intent.\${d.intent}\`,
      evidenceKeys: Object.freeze([...d.sourceKeys]),
      metadata: EMPTY_EXPLANATION_METADATA,
    }),
  ]);
}
`,
  ),
);

write(
  "reasoning/RecommendationReasoning.ts",
  `import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import { ExplanationReasonCodes } from "../models/ExplanationReason";
import type { ExplanationReason } from "../models/ExplanationReason";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeReason } from "../utils/FreezeExplanationState";

export function deriveRecommendationReasons(input: {
  readonly recommendation: CoachingRecommendation;
}): readonly ExplanationReason[] {
  const r = input.recommendation;
  return Object.freeze([
    freezeReason({
      id: \`reason:rec:\${r.id}:intent\`,
      code: ExplanationReasonCodes.RECOMMENDATION_INTENT,
      subjectId: r.id,
      category: r.category,
      statementKey: \`recommendation.intent.\${r.intent}\`,
      evidenceKeys: Object.freeze([...r.sourceKeys]),
      metadata: EMPTY_EXPLANATION_METADATA,
    }),
    freezeReason({
      id: \`reason:rec:\${r.id}:category\`,
      code: ExplanationReasonCodes.RECOMMENDATION_CATEGORY,
      subjectId: r.id,
      category: r.category,
      statementKey: \`recommendation.category.\${r.category}\`,
      evidenceKeys: Object.freeze([...r.sourceKeys]),
      metadata: EMPTY_EXPLANATION_METADATA,
    }),
  ]);
}
`,
);

write(
  "reasoning/DependencyReasoning.ts",
  `import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import { ExplanationReasonCodes } from "../models/ExplanationReason";
import type { ExplanationReason } from "../models/ExplanationReason";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeReason } from "../utils/FreezeExplanationState";

export function deriveDependencyReasons(input: {
  readonly recommendation: CoachingRecommendation;
}): readonly ExplanationReason[] {
  const r = input.recommendation;
  if (r.dependencies.length === 0) return Object.freeze([]);
  return Object.freeze(
    r.dependencies.map((dep) =>
      freezeReason({
        id: \`reason:dep:\${r.id}:\${dep.id}\`,
        code: ExplanationReasonCodes.DEPENDENCY_REQUIRED,
        subjectId: r.id,
        category: r.category,
        statementKey: \`dependency.\${dep.kind}\`,
        evidenceKeys: Object.freeze([dep.id]),
        metadata: EMPTY_EXPLANATION_METADATA,
      }),
    ),
  );
}
`,
);

write(
  "reasoning/ConstraintReasoning.ts",
  `import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import { ExplanationReasonCodes } from "../models/ExplanationReason";
import type { ExplanationReason } from "../models/ExplanationReason";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeReason } from "../utils/FreezeExplanationState";

export function deriveConstraintReasons(input: {
  readonly recommendation: CoachingRecommendation;
}): readonly ExplanationReason[] {
  const r = input.recommendation;
  if (r.constraints.length === 0) return Object.freeze([]);
  return Object.freeze(
    r.constraints.map((c) =>
      freezeReason({
        id: \`reason:constraint:\${r.id}:\${c.id}\`,
        code: ExplanationReasonCodes.CONSTRAINT_APPLIED,
        subjectId: r.id,
        category: r.category,
        statementKey: \`constraint.\${c.kind}\`,
        evidenceKeys: Object.freeze([...c.subjectKeys]),
        metadata: EMPTY_EXPLANATION_METADATA,
      }),
    ),
  );
}
`,
);

write(
  "reasoning/PriorityReasoning.ts",
  `import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import { ExplanationReasonCodes } from "../models/ExplanationReason";
import type { ExplanationReason } from "../models/ExplanationReason";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeReason } from "../utils/FreezeExplanationState";

export function derivePriorityReasons(input: {
  readonly recommendation: CoachingRecommendation;
}): readonly ExplanationReason[] {
  const r = input.recommendation;
  return Object.freeze([
    freezeReason({
      id: \`reason:priority:\${r.id}\`,
      code: ExplanationReasonCodes.PRIORITY_ORDERING,
      subjectId: r.id,
      category: r.category,
      statementKey: \`priority.ordinal.\${r.priority.ordinal}\`,
      evidenceKeys: Object.freeze([r.id]),
      metadata: EMPTY_EXPLANATION_METADATA,
    }),
  ]);
}
`,
);

write(
  "reasoning/ConsistencyReasoning.ts",
  `import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import { ExplanationReasonCodes } from "../models/ExplanationReason";
import type { ExplanationReason } from "../models/ExplanationReason";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeReason } from "../utils/FreezeExplanationState";

export function deriveConsistencyReasons(input: {
  readonly decision: CoachingDecision;
  readonly recommendation: CoachingRecommendation;
}): readonly ExplanationReason[] {
  const { decision, recommendation } = input;
  return Object.freeze([
    freezeReason({
      id: \`reason:consistency:\${recommendation.id}\`,
      code: ExplanationReasonCodes.CONSISTENCY_CHECK,
      subjectId: recommendation.id,
      category: recommendation.category,
      statementKey: \`consistency.decision.\${decision.id}.recommendation.\${recommendation.id}\`,
      evidenceKeys: Object.freeze([decision.id, recommendation.id]),
      metadata: EMPTY_EXPLANATION_METADATA,
    }),
  ]);
}
`,
);

write(
  "reasoning/ConfidenceReasoning.ts",
  `import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import { ExplanationReasonCodes } from "../models/ExplanationReason";
import type { ExplanationReason } from "../models/ExplanationReason";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeReason } from "../utils/FreezeExplanationState";

export function deriveConfidenceReasons(input: {
  readonly recommendation: CoachingRecommendation;
}): readonly ExplanationReason[] {
  const r = input.recommendation;
  return Object.freeze([
    freezeReason({
      id: \`reason:confidence:\${r.id}\`,
      code: ExplanationReasonCodes.CONFIDENCE_LEVEL,
      subjectId: r.id,
      category: r.category,
      statementKey: \`confidence.level.\${r.confidence.level}\`,
      evidenceKeys: Object.freeze([r.id]),
      metadata: EMPTY_EXPLANATION_METADATA,
    }),
  ]);
}
`,
);

write(
  "reasoning/index.ts",
  `export * from "./ConfidenceReasoning";
export * from "./ConsistencyReasoning";
export * from "./ConstraintReasoning";
export * from "./DecisionReasoning";
export * from "./DependencyReasoning";
export * from "./PriorityReasoning";
export * from "./RecommendationReasoning";
`,
);

// ─── EVIDENCE ─────────────────────────────────────────────────────────────────

write(
  "evidence/DecisionEvidence.ts",
  `import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import { ExplanationEvidenceKinds } from "../models/ExplanationEvidence";
import type { ExplanationEvidence } from "../models/ExplanationEvidence";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeEvidence } from "../utils/FreezeExplanationState";

export function buildDecisionEvidence(input: {
  readonly decision: CoachingDecision;
}): readonly ExplanationEvidence[] {
  const d = input.decision;
  return Object.freeze([
    freezeEvidence({
      id: \`evidence:decision:\${d.id}\`,
      kind: ExplanationEvidenceKinds.DECISION,
      key: \`decision:\${d.id}\`,
      subjectId: d.id,
      sourceKey: d.sourceKeys[0] ?? d.id,
      valueKeys: Object.freeze([\`outcome:\${d.outcome}\`, \`intent:\${d.intent}\`, \`category:\${d.category}\`]),
      metadata: EMPTY_EXPLANATION_METADATA,
    }),
  ]);
}
`,
);

write(
  "evidence/RecommendationEvidence.ts",
  `import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import { ExplanationEvidenceKinds } from "../models/ExplanationEvidence";
import type { ExplanationEvidence } from "../models/ExplanationEvidence";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeEvidence } from "../utils/FreezeExplanationState";

export function buildRecommendationEvidence(input: {
  readonly recommendation: CoachingRecommendation;
}): readonly ExplanationEvidence[] {
  const r = input.recommendation;
  return Object.freeze([
    freezeEvidence({
      id: \`evidence:rec:\${r.id}\`,
      kind: ExplanationEvidenceKinds.RECOMMENDATION,
      key: \`recommendation:\${r.id}\`,
      subjectId: r.id,
      sourceKey: r.sourceKeys[0] ?? r.id,
      valueKeys: Object.freeze([\`intent:\${r.intent}\`, \`type:\${r.type}\`, \`category:\${r.category}\`]),
      metadata: EMPTY_EXPLANATION_METADATA,
    }),
  ]);
}
`,
);

write(
  "evidence/ContextEvidence.ts",
  `import { ExplanationEvidenceKinds } from "../models/ExplanationEvidence";
import type { ExplanationEvidence } from "../models/ExplanationEvidence";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeEvidence } from "../utils/FreezeExplanationState";

export function buildContextEvidence(input: {
  readonly contextId: string;
  readonly athleteId: string;
  readonly focusAreaKeys: readonly string[];
}): readonly ExplanationEvidence[] {
  return Object.freeze([
    freezeEvidence({
      id: \`evidence:context:\${input.contextId}\`,
      kind: ExplanationEvidenceKinds.CONTEXT,
      key: \`context:\${input.contextId}\`,
      subjectId: input.contextId,
      sourceKey: input.contextId,
      valueKeys: Object.freeze([...input.focusAreaKeys]),
      metadata: EMPTY_EXPLANATION_METADATA,
    }),
  ]);
}
`,
);

write(
  "evidence/ConstraintEvidence.ts",
  `import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import { ExplanationEvidenceKinds } from "../models/ExplanationEvidence";
import type { ExplanationEvidence } from "../models/ExplanationEvidence";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeEvidence } from "../utils/FreezeExplanationState";

export function buildConstraintEvidence(input: {
  readonly recommendation: CoachingRecommendation;
}): readonly ExplanationEvidence[] {
  return Object.freeze(
    input.recommendation.constraints.map((c) =>
      freezeEvidence({
        id: \`evidence:constraint:\${c.id}\`,
        kind: ExplanationEvidenceKinds.CONSTRAINT,
        key: \`constraint:\${c.id}\`,
        subjectId: input.recommendation.id,
        sourceKey: c.id,
        valueKeys: Object.freeze([...c.subjectKeys]),
        metadata: EMPTY_EXPLANATION_METADATA,
      }),
    ),
  );
}
`,
);

write(
  "evidence/DependencyEvidence.ts",
  `import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import { ExplanationEvidenceKinds } from "../models/ExplanationEvidence";
import type { ExplanationEvidence } from "../models/ExplanationEvidence";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeEvidence } from "../utils/FreezeExplanationState";

export function buildDependencyEvidence(input: {
  readonly recommendation: CoachingRecommendation;
}): readonly ExplanationEvidence[] {
  return Object.freeze(
    input.recommendation.dependencies.map((d) =>
      freezeEvidence({
        id: \`evidence:dependency:\${d.id}\`,
        kind: ExplanationEvidenceKinds.DEPENDENCY,
        key: \`dependency:\${d.id}\`,
        subjectId: input.recommendation.id,
        sourceKey: d.id,
        valueKeys: Object.freeze([d.fromId, d.toId]),
        metadata: EMPTY_EXPLANATION_METADATA,
      }),
    ),
  );
}
`,
);

write(
  "evidence/StateEvidence.ts",
  `import { ExplanationEvidenceKinds } from "../models/ExplanationEvidence";
import type { ExplanationEvidence } from "../models/ExplanationEvidence";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeEvidence } from "../utils/FreezeExplanationState";

export function buildStateEvidence(input: {
  readonly athleteId: string;
  readonly present: boolean;
}): readonly ExplanationEvidence[] {
  return Object.freeze([
    freezeEvidence({
      id: \`evidence:state:\${input.athleteId}\`,
      kind: ExplanationEvidenceKinds.STATE,
      key: \`state:\${input.athleteId}\`,
      subjectId: input.athleteId,
      sourceKey: input.athleteId,
      valueKeys: Object.freeze([input.present ? "present" : "absent"]),
      metadata: EMPTY_EXPLANATION_METADATA,
    }),
  ]);
}
`,
);

write(
  "evidence/index.ts",
  `export * from "./ConstraintEvidence";
export * from "./ContextEvidence";
export * from "./DecisionEvidence";
export * from "./DependencyEvidence";
export * from "./RecommendationEvidence";
export * from "./StateEvidence";
`,
);

console.log(`Generated ${fileCount} implementation files (part 2a)...`);
