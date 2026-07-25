/**
 * Sprint 22.5 — Explainability Engine generator (part 4: validators, policies, core).
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

// ─── VALIDATORS ───────────────────────────────────────────────────────────────

const validatorBoiler = (name, fnBody) => `import { createExplanationError, ExplanationErrorCodes } from "../models/ExplanationError";
import type { ExplanationError } from "../models/ExplanationError";

${fnBody}
`;

write(
  "validators/validateExplanationIntegrity.ts",
  validatorBoiler(
    "validateExplanationIntegrity",
    `import type { CoachingExplanation } from "../models/CoachingExplanation";

export function validateExplanationIntegrity(
  explanations: readonly CoachingExplanation[],
): readonly ExplanationError[] {
  const errors: ExplanationError[] = [];
  const ids = new Set<string>();
  for (const e of explanations) {
    if (!e.id) errors.push(createExplanationError(ExplanationErrorCodes.INVALID_INPUT, "Explanation id required"));
    if (ids.has(e.id)) errors.push(createExplanationError(ExplanationErrorCodes.VALIDATION_FAILED, "Duplicate explanation id", e.id));
    ids.add(e.id);
    if (!e.decisionId) errors.push(createExplanationError(ExplanationErrorCodes.MISSING_DECISIONS, "Explanation must link decision", e.id));
    if (!e.recommendationId) errors.push(createExplanationError(ExplanationErrorCodes.MISSING_RECOMMENDATIONS, "Explanation must link recommendation", e.id));
    if (e.reasons.length === 0) errors.push(createExplanationError(ExplanationErrorCodes.VALIDATION_FAILED, "Explanation must include reasons", e.id));
  }
  return Object.freeze(errors);
}
`,
  ),
);

write(
  "validators/validateEvidenceConsistency.ts",
  `import type { CoachingExplanation } from "../models/CoachingExplanation";
import { createExplanationError, ExplanationErrorCodes } from "../models/ExplanationError";
import type { ExplanationError } from "../models/ExplanationError";

export function validateEvidenceConsistency(
  explanations: readonly CoachingExplanation[],
): readonly ExplanationError[] {
  const errors: ExplanationError[] = [];
  for (const e of explanations) {
    for (const r of e.reasons) {
      for (const key of r.evidenceKeys) {
        if (!e.evidence.some((ev) => ev.key === key || ev.sourceKey === key)) {
          if (!e.sourceKeys.includes(key)) {
            errors.push(createExplanationError(ExplanationErrorCodes.VALIDATION_FAILED, \`Reason references missing evidence key: \${key}\`, e.id));
          }
        }
      }
    }
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validateTraceConsistency.ts",
  `import type { ExplanationTrace } from "../models/ExplanationTrace";
import { createExplanationError, ExplanationErrorCodes } from "../models/ExplanationError";
import type { ExplanationError } from "../models/ExplanationError";

export function validateTraceConsistency(
  trace: ExplanationTrace | null,
): readonly ExplanationError[] {
  if (!trace) return Object.freeze([]);
  const errors: ExplanationError[] = [];
  if (trace.steps.length === 0) errors.push(createExplanationError(ExplanationErrorCodes.VALIDATION_FAILED, "Trace must include steps", trace.id));
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validateDependencies.ts",
  `import type { ExplanationDependency } from "../models/ExplanationDependency";
import { createExplanationError, ExplanationErrorCodes } from "../models/ExplanationError";
import type { ExplanationError } from "../models/ExplanationError";

export function validateDependencies(
  dependencies: readonly ExplanationDependency[],
): readonly ExplanationError[] {
  const errors: ExplanationError[] = [];
  for (const d of dependencies) {
    if (!d.fromId || !d.toId) errors.push(createExplanationError(ExplanationErrorCodes.VALIDATION_FAILED, "Dependency requires fromId and toId", d.id));
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validateDecisionLinks.ts",
  `import type { CoachingExplanation } from "../models/CoachingExplanation";
import { createExplanationError, ExplanationErrorCodes } from "../models/ExplanationError";
import type { ExplanationError } from "../models/ExplanationError";

export function validateDecisionLinks(
  explanations: readonly CoachingExplanation[],
): readonly ExplanationError[] {
  const errors: ExplanationError[] = [];
  for (const e of explanations) {
    if (e.decisionLink.decisionId !== e.decisionId) {
      errors.push(createExplanationError(ExplanationErrorCodes.VALIDATION_FAILED, "Decision link mismatch", e.id));
    }
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validateRecommendationLinks.ts",
  `import type { CoachingExplanation } from "../models/CoachingExplanation";
import { createExplanationError, ExplanationErrorCodes } from "../models/ExplanationError";
import type { ExplanationError } from "../models/ExplanationError";

export function validateRecommendationLinks(
  explanations: readonly CoachingExplanation[],
): readonly ExplanationError[] {
  const errors: ExplanationError[] = [];
  for (const e of explanations) {
    if (e.recommendationLink.recommendationId !== e.recommendationId) {
      errors.push(createExplanationError(ExplanationErrorCodes.VALIDATION_FAILED, "Recommendation link mismatch", e.id));
    }
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validateGraphIntegrity.ts",
  `import type { ExplanationGraph } from "../models/ExplanationGraph";
import { createExplanationError, ExplanationErrorCodes } from "../models/ExplanationError";
import type { ExplanationError } from "../models/ExplanationError";

export function validateGraphIntegrity(
  graph: ExplanationGraph | null,
): readonly ExplanationError[] {
  if (!graph) return Object.freeze([]);
  const errors: ExplanationError[] = [];
  const nodeIds = new Set(graph.nodes.map((n) => n.id));
  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.fromNodeId) || !nodeIds.has(edge.toNodeId)) {
      errors.push(createExplanationError(ExplanationErrorCodes.VALIDATION_FAILED, "Graph edge references missing node", edge.id));
    }
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validateSnapshot.ts",
  `import type { ExplanationSnapshot } from "../models/ExplanationSnapshot";
import { createExplanationError, ExplanationErrorCodes } from "../models/ExplanationError";
import type { ExplanationError } from "../models/ExplanationError";
import { validateExplanationIntegrity } from "./validateExplanationIntegrity";

export function validateSnapshot(
  snapshot: ExplanationSnapshot | null,
): readonly ExplanationError[] {
  if (!snapshot) return Object.freeze([]);
  return validateExplanationIntegrity(snapshot.explanations);
}
`,
);

write(
  "validators/index.ts",
  `import type { ExplanationPackage } from "../models/ExplanationPackage";
import type { ExplanationValidation } from "../models/ExplanationValidation";
import { freezeValidation } from "../utils/FreezeExplanationState";
import { validateDecisionLinks } from "./validateDecisionLinks";
import { validateDependencies } from "./validateDependencies";
import { validateEvidenceConsistency } from "./validateEvidenceConsistency";
import { validateExplanationIntegrity } from "./validateExplanationIntegrity";
import { validateGraphIntegrity } from "./validateGraphIntegrity";
import { validateRecommendationLinks } from "./validateRecommendationLinks";
import { validateSnapshot } from "./validateSnapshot";
import { validateTraceConsistency } from "./validateTraceConsistency";

export * from "./validateDecisionLinks";
export * from "./validateDependencies";
export * from "./validateEvidenceConsistency";
export * from "./validateExplanationIntegrity";
export * from "./validateGraphIntegrity";
export * from "./validateRecommendationLinks";
export * from "./validateSnapshot";
export * from "./validateTraceConsistency";

export function validateExplanationPackage(
  pkg: ExplanationPackage,
): ExplanationValidation {
  const issues = Object.freeze([
    ...validateExplanationIntegrity(pkg.explanations),
    ...validateEvidenceConsistency(pkg.explanations),
    ...validateDecisionLinks(pkg.explanations),
    ...validateRecommendationLinks(pkg.explanations),
    ...validateGraphIntegrity(pkg.graph),
    ...validateTraceConsistency(pkg.trace),
    ...validateDependencies(pkg.dependencies),
    ...validateSnapshot(pkg.snapshot),
  ]);
  return freezeValidation({ valid: issues.length === 0, issues });
}
`,
);

// ─── POLICIES ─────────────────────────────────────────────────────────────────

write(
  "policies/ExplainabilityPolicy.ts",
  `import type { CoachingExplanation } from "../models/CoachingExplanation";
import { freezeExplanation } from "../utils/FreezeExplanationState";

export function applyExplainabilityPolicy(
  explanations: readonly CoachingExplanation[],
): readonly CoachingExplanation[] {
  return Object.freeze(explanations.map(freezeExplanation));
}
`,
);

write(
  "policies/EvidencePolicy.ts",
  `import type { ExplanationEvidence } from "../models/ExplanationEvidence";
import { freezeEvidence } from "../utils/FreezeExplanationState";

export function applyEvidencePolicy(
  evidence: readonly ExplanationEvidence[],
): readonly ExplanationEvidence[] {
  return Object.freeze(evidence.filter((e) => e.key.length > 0).map(freezeEvidence));
}
`,
);

write(
  "policies/TracePolicy.ts",
  `import type { ExplanationTrace } from "../models/ExplanationTrace";
import { freezeTrace } from "../utils/FreezeExplanationState";

export function applyTracePolicy(trace: ExplanationTrace): ExplanationTrace {
  return freezeTrace(trace);
}
`,
);

write(
  "policies/DependencyPolicy.ts",
  `import type { ExplanationDependency } from "../models/ExplanationDependency";
import { freezeDependency } from "../utils/FreezeExplanationState";

export function applyDependencyPolicy(
  dependencies: readonly ExplanationDependency[],
): readonly ExplanationDependency[] {
  return Object.freeze(dependencies.map(freezeDependency));
}
`,
);

write(
  "policies/ConsistencyPolicy.ts",
  `import type { CoachingExplanation } from "../models/CoachingExplanation";
import { freezeExplanation } from "../utils/FreezeExplanationState";

export function applyConsistencyPolicy(
  explanations: readonly CoachingExplanation[],
): readonly CoachingExplanation[] {
  return Object.freeze(
    explanations.map((e) =>
      e.decisionId && e.recommendationId ? freezeExplanation(e) : e,
    ),
  );
}
`,
);

write(
  "policies/SafetyPolicy.ts",
  `import type { CoachingExplanation } from "../models/CoachingExplanation";
import { freezeExplanation } from "../utils/FreezeExplanationState";

export function applySafetyPolicy(
  explanations: readonly CoachingExplanation[],
): readonly CoachingExplanation[] {
  return Object.freeze(
    explanations.map((e) => {
      if (e.recommendationLink.category !== "safety") return freezeExplanation(e);
      return freezeExplanation({
        ...e,
        priority: Object.freeze({ ...e.priority, ordinal: 0, urgency: 100, label: "critical" }),
      });
    }),
  );
}
`,
);

write(
  "policies/index.ts",
  `export * from "./ConsistencyPolicy";
export * from "./DependencyPolicy";
export * from "./EvidencePolicy";
export * from "./ExplainabilityPolicy";
export * from "./SafetyPolicy";
export * from "./TracePolicy";
`,
);

// ─── SELECTORS ──────────────────────────────────────────────────────────────────

write(
  "selectors/ExplanationSelector.ts",
  `import type { CoachingExplanation } from "../models/CoachingExplanation";

export function selectExplanationById(
  explanations: readonly CoachingExplanation[],
  id: string,
): CoachingExplanation | null {
  return explanations.find((e) => e.id === id) ?? null;
}

export function selectExplanationsByCategory(
  explanations: readonly CoachingExplanation[],
  category: string,
): readonly CoachingExplanation[] {
  return Object.freeze(explanations.filter((e) => e.recommendationLink.category === category));
}
`,
);

write(
  "selectors/EvidenceSelector.ts",
  `import type { ExplanationEvidence } from "../models/ExplanationEvidence";
import type { CoachingExplanation } from "../models/CoachingExplanation";

export function selectEvidenceByKind(
  explanation: CoachingExplanation,
  kind: ExplanationEvidence["kind"],
): readonly ExplanationEvidence[] {
  return Object.freeze(explanation.evidence.filter((e) => e.kind === kind));
}
`,
);

write(
  "selectors/TraceSelector.ts",
  `import type { ExplanationStep } from "../models/ExplanationStep";
import type { ExplanationTrace } from "../models/ExplanationTrace";

export function selectTraceSteps(
  trace: ExplanationTrace,
  operation: string,
): readonly ExplanationStep[] {
  return Object.freeze(trace.steps.filter((s) => s.operation === operation));
}
`,
);

write(
  "selectors/DecisionSelector.ts",
  `import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";

export function selectDecisionById(
  decisions: readonly CoachingDecision[],
  id: string,
): CoachingDecision | null {
  return decisions.find((d) => d.id === id) ?? null;
}
`,
);

write(
  "selectors/RecommendationSelector.ts",
  `import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";

export function selectRecommendationById(
  recommendations: readonly CoachingRecommendation[],
  id: string,
): CoachingRecommendation | null {
  return recommendations.find((r) => r.id === id) ?? null;
}
`,
);

write(
  "selectors/index.ts",
  `export * from "./DecisionSelector";
export * from "./EvidenceSelector";
export * from "./ExplanationSelector";
export * from "./RecommendationSelector";
export * from "./TraceSelector";
`,
);

console.log(`Generated ${fileCount} files (part 4)...`);
