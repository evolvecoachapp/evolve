/**
 * Sprint 22.4 — Recommendation Engine generator part 3
 * (builders, validators, policies, selectors).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("app/src/features/recommendation-engine");

function write(rel, contents) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents.replace(/\r?\n/g, "\n"), "utf8");
}

write(
  "builders/RecommendationBuilder.ts",
  `import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationAction } from "../models/RecommendationAction";
import { RecommendationIntents } from "../models/RecommendationIntent";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import { priorityForCategory } from "../models/RecommendationPriority";
import { RecommendationTypes } from "../models/RecommendationType";
import { RecommendationTargetKinds } from "../models/RecommendationTarget";
import {
  freezeAction,
  freezeRecommendation,
} from "../utils/FreezeRecommendationState";

function mapIntent(
  decisionIntent: string,
): (typeof RecommendationIntents)[keyof typeof RecommendationIntents] {
  switch (decisionIntent) {
    case "block":
      return RecommendationIntents.ESCALATE;
    case "defer":
      return RecommendationIntents.DEFER;
    case "recommend":
    case "continue":
      return RecommendationIntents.ACT;
    case "escalate":
      return RecommendationIntents.ESCALATE;
    default:
      return RecommendationIntents.INFORM;
  }
}

function mapType(
  decisionIntent: string,
): (typeof RecommendationTypes)[keyof typeof RecommendationTypes] {
  if (decisionIntent === "block") return RecommendationTypes.CONSTRAINT;
  if (decisionIntent === "recommend") return RecommendationTypes.ACTION;
  return RecommendationTypes.GUIDANCE;
}

/**
 * Build immutable CoachingRecommendation from CoachingDecision.
 */
export function buildRecommendation(input: {
  readonly decision: CoachingDecision;
  readonly at: string;
}): CoachingRecommendation {
  const decision = input.decision;
  const category = decision.category as CoachingRecommendation["category"];
  const type = mapType(decision.intent);
  const intent = mapIntent(decision.intent);
  const action: RecommendationAction = freezeAction({
    id: \`action:\${decision.id}\`,
    type,
    key: \`\${category}.\${decision.intent}\`,
    targetKey: decision.category,
    parameters: Object.freeze({
      decisionId: decision.id,
      outcome: decision.outcome,
    }),
    metadata: EMPTY_RECOMMENDATION_METADATA,
  });

  return freezeRecommendation({
    id: \`rec:\${decision.id}\`,
    athleteId: decision.athleteId,
    sessionId: decision.sessionId,
    conversationId: decision.conversationId,
    contextId: decision.contextId,
    decisionId: decision.id,
    category,
    intent,
    type,
    title: decision.title,
    priority: priorityForCategory(category),
    confidence: Object.freeze({
      level:
        decision.confidence.level === "high" ||
        decision.confidence.level === "medium" ||
        decision.confidence.level === "low"
          ? decision.confidence.level
          : "unknown",
      score: decision.confidence.score,
      notes: Object.freeze([...decision.confidence.notes]),
    }),
    actions: Object.freeze([action]),
    sequence: null,
    constraints: Object.freeze([]),
    dependencies: Object.freeze([]),
    targets: Object.freeze([
      Object.freeze({
        id: \`target:athlete:\${decision.athleteId}\`,
        kind: RecommendationTargetKinds.ATHLETE,
        referenceId: decision.athleteId,
        label: "athlete",
        metadata: EMPTY_RECOMMENDATION_METADATA,
      }),
      Object.freeze({
        id: \`target:explainability:\${decision.id}\`,
        kind: RecommendationTargetKinds.EXPLAINABILITY,
        referenceId: decision.id,
        label: "explainability",
        metadata: EMPTY_RECOMMENDATION_METADATA,
      }),
    ]),
    sourceKeys: Object.freeze([...decision.sourceKeys]),
    metadata: EMPTY_RECOMMENDATION_METADATA,
    createdAt: input.at,
  });
}

export function buildRecommendationsFromDecisions(input: {
  readonly decisions: readonly CoachingDecision[];
  readonly at: string;
}): readonly CoachingRecommendation[] {
  return Object.freeze(
    input.decisions.map((decision) =>
      buildRecommendation({ decision, at: input.at }),
    ),
  );
}
`,
);

write(
  "builders/RecommendationContextBuilder.ts",
  `import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import type { RecommendationEngineInput } from "../../decision-engine/models/RecommendationEngineInput";
import type { RecommendationContext } from "../models/RecommendationContext";
import type { RecommendationCategory } from "../models/RecommendationCategory";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import {
  freezeContext,
  freezeReference,
} from "../utils/FreezeRecommendationState";

export function buildRecommendationContext(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly decisions: readonly CoachingDecision[];
  readonly handoff: RecommendationEngineInput | null;
  readonly focusAreas: readonly string[];
  readonly athletePresent: boolean;
  readonly at: string;
}): RecommendationContext {
  const decisionIds = Object.freeze(
    input.handoff?.decisionIds ?? input.decisions.map((d) => d.id),
  );
  const references = Object.freeze(
    (input.handoff?.recommendations ??
      input.decisions.flatMap((d) => d.recommendationRefs)
    ).map((ref) =>
      freezeReference({
        id: ref.id,
        decisionId: ref.decisionId,
        category: ref.category as RecommendationCategory,
        priorityOrdinal: ref.priorityOrdinal,
        intent: ref.intent,
        metadata: EMPTY_RECOMMENDATION_METADATA,
      }),
    ),
  );

  return freezeContext({
    id: input.id,
    athleteId: input.athleteId,
    sessionId: input.sessionId,
    conversationId: input.conversationId,
    contextId: input.contextId,
    decisionIds,
    references,
    focusAreas: Object.freeze([...input.focusAreas]),
    athletePresent: input.athletePresent,
    metadata: EMPTY_RECOMMENDATION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "builders/PackageBuilder.ts",
  `export { packageRecommendations as buildRecommendationPackage } from "../packaging/RecommendationPackager";
`,
);

write(
  "builders/SummaryBuilder.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationSummary } from "../models/RecommendationSummary";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import { freezeSummary } from "../utils/FreezeRecommendationState";
import { sortRecommendationsByPriority } from "../utils/RecommendationHelpers";

export function buildRecommendationSummary(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly recommendations: readonly CoachingRecommendation[];
  readonly groupCount: number;
  readonly conflictCount: number;
  readonly resolutionCount: number;
  readonly focusAreas: readonly string[];
  readonly at: string;
}): RecommendationSummary {
  const ordered = sortRecommendationsByPriority(input.recommendations);
  return freezeSummary({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    recommendationCount: input.recommendations.length,
    groupCount: input.groupCount,
    conflictCount: input.conflictCount,
    resolutionCount: input.resolutionCount,
    topCategory: ordered[0]?.category ?? null,
    focusAreas: Object.freeze([...input.focusAreas]),
    metadata: EMPTY_RECOMMENDATION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "builders/SnapshotBuilder.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationSnapshot } from "../models/RecommendationSnapshot";
import type { RecommendationSummary } from "../models/RecommendationSummary";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import { freezeSnapshot } from "../utils/FreezeRecommendationState";

export function buildRecommendationSnapshot(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly recommendations: readonly CoachingRecommendation[];
  readonly summary: RecommendationSummary | null;
  readonly at: string;
}): RecommendationSnapshot {
  return freezeSnapshot({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    recommendations: input.recommendations,
    summary: input.summary,
    metadata: EMPTY_RECOMMENDATION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "builders/ExplainabilityInputBuilder.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { ExplainabilityInput } from "../models/ExplainabilityInput";
import type { RecommendationSummary } from "../models/RecommendationSummary";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import { freezeExplainabilityInput } from "../utils/FreezeRecommendationState";

export function buildExplainabilityInput(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly recommendations: readonly CoachingRecommendation[];
  readonly decisionIds: readonly string[];
  readonly summary: RecommendationSummary | null;
  readonly at: string;
}): ExplainabilityInput {
  return freezeExplainabilityInput({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    recommendationIds: Object.freeze(input.recommendations.map((r) => r.id)),
    decisionIds: Object.freeze([...input.decisionIds]),
    summary: input.summary,
    metadata: EMPTY_RECOMMENDATION_METADATA,
    createdAt: input.at,
  });
}
`,
);

write(
  "builders/RecommendationDescriptorBuilder.ts",
  `import type { RecommendationDescriptor } from "../models/RecommendationDescriptor";
import { freezeDescriptor } from "../utils/FreezeRecommendationState";

export function buildRecommendationDescriptor(input: {
  readonly id: string;
  readonly createdAt: string;
}): RecommendationDescriptor {
  return freezeDescriptor({
    id: input.id,
    name: "Recommendation Engine",
    version: "0.6.0",
    capabilities: Object.freeze([
      "buildRecommendations",
      "prioritizeRecommendations",
      "packageRecommendations",
      "describeRecommendations",
      "validateRecommendations",
    ]),
    boundaries: Object.freeze([
      "no_ai",
      "no_nl",
      "no_action_execution",
      "no_domain_calculations",
      "no_persistence",
      "no_networking",
      "no_openai_sdk",
      "no_prompt_builder",
      "no_tool_runtime",
    ]),
    createdAt: input.createdAt,
  });
}
`,
);

write(
  "builders/RecommendationResultBuilder.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { ExplainabilityInput } from "../models/ExplainabilityInput";
import type { RecommendationDescriptor } from "../models/RecommendationDescriptor";
import type { RecommendationError } from "../models/RecommendationError";
import type { RecommendationPackage } from "../models/RecommendationPackage";
import type {
  RecommendationOperationKind,
  RecommendationResult,
} from "../models/RecommendationResult";
import type { RecommendationSnapshot } from "../models/RecommendationSnapshot";
import type { RecommendationSummary } from "../models/RecommendationSummary";
import type { RecommendationValidation } from "../models/RecommendationValidation";
import { freezeResult } from "../utils/FreezeRecommendationState";

export function buildRecommendationResult(input: {
  readonly id: string;
  readonly operation: RecommendationOperationKind;
  readonly success: boolean;
  readonly recommendations?: readonly CoachingRecommendation[];
  readonly package?: RecommendationPackage | null;
  readonly summary?: RecommendationSummary | null;
  readonly snapshot?: RecommendationSnapshot | null;
  readonly explainabilityInput?: ExplainabilityInput | null;
  readonly validation?: RecommendationValidation | null;
  readonly descriptor?: RecommendationDescriptor | null;
  readonly errors?: readonly RecommendationError[];
  readonly createdAt: string;
}): RecommendationResult {
  return freezeResult({
    id: input.id,
    operation: input.operation,
    success: input.success,
    recommendations: Object.freeze([...(input.recommendations ?? [])]),
    package: input.package ?? null,
    summary: input.summary ?? null,
    snapshot: input.snapshot ?? null,
    explainabilityInput: input.explainabilityInput ?? null,
    validation: input.validation ?? null,
    descriptor: input.descriptor ?? null,
    errors: Object.freeze([...(input.errors ?? [])]),
    createdAt: input.createdAt,
  });
}
`,
);

write(
  "builders/TimelineBuilder.ts",
  `import type { RecommendationTimeline } from "../models/RecommendationTimeline";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import { freezeTimeline } from "../utils/FreezeRecommendationState";

export function buildRecommendationTimeline(input: {
  readonly id: string;
  readonly steps: readonly string[];
  readonly subjectId: string;
  readonly at: string;
}): RecommendationTimeline {
  return freezeTimeline({
    id: input.id,
    items: Object.freeze(
      input.steps.map((step, index) =>
        Object.freeze({
          id: \`timeline:\${input.id}:\${index}\`,
          at: input.at,
          kind: step,
          subjectId: input.subjectId,
          note: step,
          metadata: EMPTY_RECOMMENDATION_METADATA,
        }),
      ),
    ),
    createdAt: input.at,
  });
}
`,
);

write(
  "builders/index.ts",
  `export * from "./RecommendationBuilder";
export * from "./RecommendationContextBuilder";
export * from "./PackageBuilder";
export * from "./SummaryBuilder";
export * from "./SnapshotBuilder";
export * from "./ExplainabilityInputBuilder";
export * from "./RecommendationDescriptorBuilder";
export * from "./RecommendationResultBuilder";
export * from "./TimelineBuilder";
`,
);

write(
  "validators/validateRecommendationIntegrity.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import {
  createRecommendationError,
  RecommendationErrorCodes,
  type RecommendationError,
} from "../models/RecommendationError";

export function validateRecommendationIntegrity(
  recommendations: readonly CoachingRecommendation[],
): readonly RecommendationError[] {
  const errors: RecommendationError[] = [];
  const ids = new Set<string>();
  for (const r of recommendations) {
    if (!r.id) {
      errors.push(
        createRecommendationError(
          RecommendationErrorCodes.INVALID_INPUT,
          "Recommendation id is required",
        ),
      );
    }
    if (ids.has(r.id)) {
      errors.push(
        createRecommendationError(
          RecommendationErrorCodes.VALIDATION_FAILED,
          "Duplicate recommendation id",
          r.id,
        ),
      );
    }
    ids.add(r.id);
    if (!r.decisionId) {
      errors.push(
        createRecommendationError(
          RecommendationErrorCodes.MISSING_DECISIONS,
          "Recommendation must reference a decision",
          r.id,
        ),
      );
    }
    if (r.actions.length === 0) {
      errors.push(
        createRecommendationError(
          RecommendationErrorCodes.VALIDATION_FAILED,
          "Recommendation must include at least one action",
          r.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validateDependencies.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationDependency } from "../models/RecommendationDependency";
import {
  createRecommendationError,
  RecommendationErrorCodes,
  type RecommendationError,
} from "../models/RecommendationError";

export function validateDependencies(input: {
  readonly recommendations: readonly CoachingRecommendation[];
  readonly dependencies: readonly RecommendationDependency[];
}): readonly RecommendationError[] {
  const ids = new Set(input.recommendations.map((r) => r.id));
  const errors: RecommendationError[] = [];
  for (const dep of input.dependencies) {
    if (!ids.has(dep.fromId) || !ids.has(dep.toId)) {
      errors.push(
        createRecommendationError(
          RecommendationErrorCodes.VALIDATION_FAILED,
          "Dependency references unknown recommendation",
          dep.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validateConflicts.ts",
  `import type { RecommendationConflict } from "../models/RecommendationConflict";
import {
  createRecommendationError,
  RecommendationErrorCodes,
  type RecommendationError,
} from "../models/RecommendationError";

export function validateConflicts(
  conflicts: readonly RecommendationConflict[],
): readonly RecommendationError[] {
  const errors: RecommendationError[] = [];
  for (const conflict of conflicts) {
    if (!conflict.resolved) {
      errors.push(
        createRecommendationError(
          RecommendationErrorCodes.CONFLICT_UNRESOLVED,
          "Conflict is unresolved",
          conflict.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validateOrdering.ts",
  `import type { RecommendationPlan } from "../models/RecommendationPlan";
import {
  createRecommendationError,
  RecommendationErrorCodes,
  type RecommendationError,
} from "../models/RecommendationError";

export function validateOrdering(
  plan: RecommendationPlan | null,
): readonly RecommendationError[] {
  if (!plan) return Object.freeze([]);
  const errors: RecommendationError[] = [];
  const seen = new Set<string>();
  for (const id of plan.orderedIds) {
    if (seen.has(id)) {
      errors.push(
        createRecommendationError(
          RecommendationErrorCodes.VALIDATION_FAILED,
          "Duplicate id in ordering",
          id,
        ),
      );
    }
    seen.add(id);
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validateRecommendationPackage.ts",
  `import type { RecommendationPackage } from "../models/RecommendationPackage";
import type { RecommendationValidation } from "../models/RecommendationValidation";
import { freezeValidation } from "../utils/FreezeRecommendationState";
import { validateConflicts } from "./validateConflicts";
import { validateDependencies } from "./validateDependencies";
import { validateOrdering } from "./validateOrdering";
import { validateRecommendationIntegrity } from "./validateRecommendationIntegrity";
import { validateContextConsistency } from "./validateContextConsistency";

export function validateRecommendationPackage(
  pkg: RecommendationPackage,
): RecommendationValidation {
  const errors = Object.freeze([
    ...validateRecommendationIntegrity(pkg.recommendations),
    ...validateDependencies({
      recommendations: pkg.recommendations,
      dependencies: pkg.dependencies,
    }),
    ...validateConflicts(pkg.conflicts),
    ...validateOrdering(pkg.plan),
    ...validateContextConsistency(pkg),
  ]);
  const warnings: string[] = [];
  if (pkg.recommendations.length === 0) {
    warnings.push("empty_recommendations");
  }
  return freezeValidation({
    valid: errors.length === 0,
    errors,
    warnings: Object.freeze(warnings),
  });
}
`,
);

write(
  "validators/validateSnapshot.ts",
  `import type { RecommendationSnapshot } from "../models/RecommendationSnapshot";
import {
  createRecommendationError,
  RecommendationErrorCodes,
  type RecommendationError,
} from "../models/RecommendationError";

export function validateSnapshot(
  snapshot: RecommendationSnapshot | null,
): readonly RecommendationError[] {
  if (!snapshot) return Object.freeze([]);
  const errors: RecommendationError[] = [];
  if (snapshot.recommendations.length === 0) {
    errors.push(
      createRecommendationError(
        RecommendationErrorCodes.VALIDATION_FAILED,
        "Snapshot has no recommendations",
        snapshot.id,
      ),
    );
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/validateContextConsistency.ts",
  `import type { RecommendationPackage } from "../models/RecommendationPackage";
import {
  createRecommendationError,
  RecommendationErrorCodes,
  type RecommendationError,
} from "../models/RecommendationError";

export function validateContextConsistency(
  pkg: RecommendationPackage,
): readonly RecommendationError[] {
  const errors: RecommendationError[] = [];
  if (pkg.athleteId !== pkg.recommendationContext.athleteId) {
    errors.push(
      createRecommendationError(
        RecommendationErrorCodes.VALIDATION_FAILED,
        "Package athleteId does not match context",
        pkg.id,
      ),
    );
  }
  if (pkg.contextId !== pkg.recommendationContext.contextId) {
    errors.push(
      createRecommendationError(
        RecommendationErrorCodes.VALIDATION_FAILED,
        "Package contextId does not match context",
        pkg.id,
      ),
    );
  }
  for (const r of pkg.recommendations) {
    if (r.contextId !== pkg.contextId) {
      errors.push(
        createRecommendationError(
          RecommendationErrorCodes.VALIDATION_FAILED,
          "Recommendation context mismatch",
          r.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
`,
);

write(
  "validators/index.ts",
  `export * from "./validateRecommendationIntegrity";
export * from "./validateDependencies";
export * from "./validateConflicts";
export * from "./validateOrdering";
export * from "./validateRecommendationPackage";
export * from "./validateSnapshot";
export * from "./validateContextConsistency";
`,
);

write(
  "policies/RecommendationPolicy.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import { freezeRecommendation } from "../utils/FreezeRecommendationState";

/**
 * Deterministic recommendation policy — drop empty-action items.
 */
export function applyRecommendationPolicy(
  recommendations: readonly CoachingRecommendation[],
): readonly CoachingRecommendation[] {
  return Object.freeze(
    recommendations
      .filter((r) => r.actions.length > 0)
      .map((r) => freezeRecommendation(r)),
  );
}
`,
);

write(
  "policies/PriorityPolicy.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import { sortRecommendationsByPriority } from "../utils/RecommendationHelpers";

/**
 * Deterministic priority policy — safety-first ordering.
 */
export function applyPriorityPolicy(
  recommendations: readonly CoachingRecommendation[],
): readonly CoachingRecommendation[] {
  return sortRecommendationsByPriority(recommendations);
}
`,
);

write(
  "policies/DependencyPolicy.ts",
  `import type { RecommendationDependency } from "../models/RecommendationDependency";

/**
 * Deterministic dependency policy — keep required blocking edges.
 */
export function applyDependencyPolicy(
  dependencies: readonly RecommendationDependency[],
): readonly RecommendationDependency[] {
  return Object.freeze(
    dependencies.filter((d) => d.required || d.kind === "follows"),
  );
}
`,
);

write(
  "policies/ConsistencyPolicy.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import { freezeRecommendation } from "../utils/FreezeRecommendationState";

/**
 * Deterministic consistency policy — require source keys.
 */
export function applyConsistencyPolicy(
  recommendations: readonly CoachingRecommendation[],
): readonly CoachingRecommendation[] {
  return Object.freeze(
    recommendations.map((r) => {
      if (r.sourceKeys.length > 0) return freezeRecommendation(r);
      return freezeRecommendation({
        ...r,
        confidence: Object.freeze({
          ...r.confidence,
          level: "low",
          score: Math.min(r.confidence.score, 40),
          notes: Object.freeze([...r.confidence.notes, "missing_source_keys"]),
        }),
      });
    }),
  );
}
`,
);

write(
  "policies/ConflictPolicy.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationConflict } from "../models/RecommendationConflict";
import { RecommendationConflictKinds } from "../models/RecommendationConflict";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import { freezeConflict } from "../utils/FreezeRecommendationState";

/**
 * Deterministic conflict policy — safety escalate vs training act.
 */
export function applyConflictPolicy(
  recommendations: readonly CoachingRecommendation[],
): readonly RecommendationConflict[] {
  const conflicts: RecommendationConflict[] = [];
  const safety = recommendations.find(
    (r) => r.category === "safety" && r.intent === "escalate",
  );
  const training = recommendations.find((r) => r.category === "training");
  if (safety && training) {
    conflicts.push(
      freezeConflict({
        id: "conflict:safety-vs-training",
        kind: RecommendationConflictKinds.MUTUAL_EXCLUSION,
        leftId: safety.id,
        rightId: training.id,
        description: "Safety escalate conflicts with training act",
        resolved: false,
        metadata: EMPTY_RECOMMENDATION_METADATA,
      }),
    );
  }
  const byCategory = new Map<string, CoachingRecommendation[]>();
  for (const r of recommendations) {
    const list = byCategory.get(r.category) ?? [];
    list.push(r);
    byCategory.set(r.category, list);
  }
  for (const [category, list] of byCategory) {
    if (list.length < 2) continue;
    conflicts.push(
      freezeConflict({
        id: \`conflict:\${category}:duplicate\`,
        kind: RecommendationConflictKinds.PRIORITY,
        leftId: list[0]!.id,
        rightId: list[1]!.id,
        description: \`Priority conflict in \${category}\`,
        resolved: false,
        metadata: EMPTY_RECOMMENDATION_METADATA,
      }),
    );
  }
  return Object.freeze(conflicts);
}
`,
);

write(
  "policies/SafetyPolicy.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import { freezeRecommendation } from "../utils/FreezeRecommendationState";

/**
 * Deterministic safety policy — force safety escalate to top urgency.
 */
export function applySafetyPolicy(
  recommendations: readonly CoachingRecommendation[],
): readonly CoachingRecommendation[] {
  return Object.freeze(
    recommendations.map((r) => {
      if (r.category !== "safety") return freezeRecommendation(r);
      return freezeRecommendation({
        ...r,
        intent: "escalate",
        priority: Object.freeze({
          ...r.priority,
          ordinal: 0,
          urgency: 100,
          label: "safety",
        }),
      });
    }),
  );
}
`,
);

write(
  "policies/index.ts",
  `export * from "./RecommendationPolicy";
export * from "./PriorityPolicy";
export * from "./DependencyPolicy";
export * from "./ConsistencyPolicy";
export * from "./ConflictPolicy";
export * from "./SafetyPolicy";
`,
);

write(
  "selectors/RecommendationSelector.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationCategory } from "../models/RecommendationCategory";

export function selectByCategory(
  recommendations: readonly CoachingRecommendation[],
  category: RecommendationCategory,
): readonly CoachingRecommendation[] {
  return Object.freeze(recommendations.filter((r) => r.category === category));
}

export function selectPrimary(
  recommendations: readonly CoachingRecommendation[],
): CoachingRecommendation | null {
  return recommendations[0] ?? null;
}
`,
);

write(
  "selectors/PrioritySelector.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import { sortRecommendationsByPriority } from "../utils/RecommendationHelpers";

export function selectHighestPriority(
  recommendations: readonly CoachingRecommendation[],
): CoachingRecommendation | null {
  return sortRecommendationsByPriority(recommendations)[0] ?? null;
}
`,
);

write(
  "selectors/ActionSelector.ts",
  `import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationAction } from "../models/RecommendationAction";

export function selectActions(
  recommendations: readonly CoachingRecommendation[],
): readonly RecommendationAction[] {
  return Object.freeze(recommendations.flatMap((r) => r.actions));
}
`,
);

write(
  "selectors/PackageSelector.ts",
  `import type { RecommendationPackage } from "../models/RecommendationPackage";
import type { CoachingRecommendation } from "../models/CoachingRecommendation";

export function selectPackageRecommendations(
  pkg: RecommendationPackage | null,
): readonly CoachingRecommendation[] {
  return pkg?.recommendations ?? Object.freeze([]);
}
`,
);

write(
  "selectors/ContextSelector.ts",
  `import type { RecommendationContext } from "../models/RecommendationContext";

export function selectFocusAreas(
  context: RecommendationContext | null,
): readonly string[] {
  return context?.focusAreas ?? Object.freeze([]);
}

export function selectDecisionIds(
  context: RecommendationContext | null,
): readonly string[] {
  return context?.decisionIds ?? Object.freeze([]);
}
`,
);

write(
  "selectors/index.ts",
  `export * from "./RecommendationSelector";
export * from "./PrioritySelector";
export * from "./ActionSelector";
export * from "./PackageSelector";
export * from "./ContextSelector";
`,
);

console.log("recommendation-engine part 3 written");
