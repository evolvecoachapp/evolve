/**
 * Sprint 22.5 — Explainability Engine generator (part 6: testSupport + tests).
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

write(
  "testSupport/fixtures.ts",
  `import { createMockAthleteStatePort } from "../contracts/AthleteStatePort";
import { createMockCoachSupervisorPort } from "../contracts/CoachSupervisorPort";
import { createMockContextFusionPort } from "../contracts/ContextFusionPort";
import { createMockDecisionEnginePort } from "../contracts/DecisionEnginePort";
import { createMockRecommendationEnginePort } from "../contracts/RecommendationEnginePort";
import { ExplanationInputKinds } from "../models/ExplanationInput";
import type { ExplanationInput } from "../models/ExplanationInput";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import {
  createExplainabilityEngineService,
  type ExplainabilityEngineService,
} from "../services/ExplainabilityEngineService";
import { freezeInput } from "../utils/FreezeExplanationState";

export const FIXED_TIMESTAMP = "2026-07-25T12:00:00.000Z";

export function createFixedClock(ts = FIXED_TIMESTAMP): () => string {
  return () => ts;
}

export function createExplanationInput(
  overrides: Partial<ExplanationInput> = {},
): ExplanationInput {
  return freezeInput({
    id: overrides.id ?? "request:explainability-engine:test",
    kind: overrides.kind ?? ExplanationInputKinds.BUILD,
    athleteId: overrides.athleteId ?? "athlete:1",
    sessionId: overrides.sessionId ?? "session:1",
    conversationId: overrides.conversationId ?? "conversation:1",
    contextId: overrides.contextId ?? "context:1",
    decisions: overrides.decisions ?? Object.freeze([]),
    recommendations: overrides.recommendations ?? Object.freeze([]),
    recommendationPackage: overrides.recommendationPackage ?? null,
    explainabilityHandoff: overrides.explainabilityHandoff ?? null,
    reason: overrides.reason ?? "test",
    metadata: overrides.metadata ?? EMPTY_EXPLANATION_METADATA,
    createdAt: overrides.createdAt ?? FIXED_TIMESTAMP,
  });
}

export function createTestExplainabilityEngineService(
  overrides: {
    readonly clock?: () => string;
    readonly withMocks?: boolean;
  } = {},
): ExplainabilityEngineService {
  const withMocks = overrides.withMocks ?? true;
  return createExplainabilityEngineService({
    decisionEnginePort: withMocks ? createMockDecisionEnginePort() : undefined,
    recommendationEnginePort: withMocks ? createMockRecommendationEnginePort() : undefined,
    contextFusionPort: withMocks ? createMockContextFusionPort() : undefined,
    athleteStatePort: withMocks ? createMockAthleteStatePort() : undefined,
    supervisorPort: withMocks ? createMockCoachSupervisorPort() : undefined,
    clock: overrides.clock ?? createFixedClock(),
  });
}
`,
);

write(
  "__tests__/reasoning.test.ts",
  `import { deriveDecisionReasons } from "../reasoning/DecisionReasoning";
import { deriveRecommendationReasons } from "../reasoning/RecommendationReasoning";
import { createMockDecisionEnginePort } from "../contracts/DecisionEnginePort";
import { createMockRecommendationEnginePort } from "../contracts/RecommendationEnginePort";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("explainability-engine reasoning", () => {
  it("derives structured decision reasons", () => {
    const decisions = createMockDecisionEnginePort().loadDecisions({
      athleteId: "athlete:1",
      sessionId: null,
      conversationId: null,
      contextId: "context:1",
      at: FIXED_TIMESTAMP,
    });
    const reasons = deriveDecisionReasons({ decision: decisions[0]! });
    expect(reasons.length).toBeGreaterThan(0);
    expect(reasons.every((r) => r.statementKey.startsWith("decision."))).toBe(true);
    expect(Object.isFrozen(reasons)).toBe(true);
  });

  it("derives structured recommendation reasons", () => {
    const recs = createMockRecommendationEnginePort().loadRecommendations({
      athleteId: "athlete:1",
      sessionId: null,
      conversationId: null,
      contextId: "context:1",
      at: FIXED_TIMESTAMP,
    });
    const reasons = deriveRecommendationReasons({ recommendation: recs[0]! });
    expect(reasons.some((r) => r.statementKey.startsWith("recommendation."))).toBe(true);
  });
});
`,
);

write(
  "__tests__/evidence.test.ts",
  `import { buildDecisionEvidence } from "../evidence/DecisionEvidence";
import { buildRecommendationEvidence } from "../evidence/RecommendationEvidence";
import { createMockDecisionEnginePort } from "../contracts/DecisionEnginePort";
import { createMockRecommendationEnginePort } from "../contracts/RecommendationEnginePort";
import { ExplanationEvidenceKinds } from "../models/ExplanationEvidence";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("explainability-engine evidence", () => {
  it("builds decision evidence with structured keys", () => {
    const decision = createMockDecisionEnginePort().loadDecisions({
      athleteId: "athlete:1",
      sessionId: null,
      conversationId: null,
      contextId: "context:1",
      at: FIXED_TIMESTAMP,
    })[0]!;
    const evidence = buildDecisionEvidence({ decision });
    expect(evidence[0]!.kind).toBe(ExplanationEvidenceKinds.DECISION);
    expect(Object.isFrozen(evidence)).toBe(true);
  });

  it("builds recommendation evidence", () => {
    const rec = createMockRecommendationEnginePort().loadRecommendations({
      athleteId: "athlete:1",
      sessionId: null,
      conversationId: null,
      contextId: "context:1",
      at: FIXED_TIMESTAMP,
    })[0]!;
    const evidence = buildRecommendationEvidence({ recommendation: rec });
    expect(evidence[0]!.kind).toBe(ExplanationEvidenceKinds.RECOMMENDATION);
  });
});
`,
);

write(
  "__tests__/trace.test.ts",
  `import { buildDecisionTrace } from "../trace/DecisionTraceBuilder";
import { buildExplanationGraph } from "../trace/GraphTraceBuilder";
import { buildExplanation } from "../builders/ExplanationBuilder";
import { createMockDecisionEnginePort } from "../contracts/DecisionEnginePort";
import { createMockRecommendationEnginePort } from "../contracts/RecommendationEnginePort";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("explainability-engine trace", () => {
  it("builds decision trace steps", () => {
    const decision = createMockDecisionEnginePort().loadDecisions({
      athleteId: "athlete:1",
      sessionId: null,
      conversationId: null,
      contextId: "context:1",
      at: FIXED_TIMESTAMP,
    })[0]!;
    const trace = buildDecisionTrace({ decision, at: FIXED_TIMESTAMP });
    expect(trace.steps.length).toBeGreaterThan(0);
    expect(Object.isFrozen(trace)).toBe(true);
  });

  it("builds explanation graph with nodes and edges", () => {
    const portInput = { athleteId: "athlete:1", sessionId: null, conversationId: null, contextId: "context:1", at: FIXED_TIMESTAMP };
    const decision = createMockDecisionEnginePort().loadDecisions(portInput)[0]!;
    const rec = createMockRecommendationEnginePort().loadRecommendations(portInput)[0]!;
    const explanation = buildExplanation({ decision, recommendation: rec, focusAreaKeys: Object.freeze(["training"]), at: FIXED_TIMESTAMP });
    const graph = buildExplanationGraph({ id: "graph:test", explanations: Object.freeze([explanation]), at: FIXED_TIMESTAMP });
    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(graph.edges.length).toBeGreaterThan(0);
  });
});
`,
);

write(
  "__tests__/builders.test.ts",
  `import { buildExplanationsFromPairs } from "../builders/ExplanationBuilder";
import { buildLLMFormatterInput } from "../builders/LLMFormatterInputBuilder";
import { buildExplanationSummary } from "../builders/SummaryBuilder";
import { createMockDecisionEnginePort } from "../contracts/DecisionEnginePort";
import { createMockRecommendationEnginePort } from "../contracts/RecommendationEnginePort";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("explainability-engine builders", () => {
  const portInput = { athleteId: "athlete:1", sessionId: null, conversationId: null, contextId: "context:1", at: FIXED_TIMESTAMP };

  it("builds explanations from decision/recommendation pairs", () => {
    const decisions = createMockDecisionEnginePort().loadDecisions(portInput);
    const recommendations = createMockRecommendationEnginePort().loadRecommendations(portInput);
    const explanations = buildExplanationsFromPairs({
      decisions,
      recommendations,
      focusAreaKeys: Object.freeze(["training"]),
      at: FIXED_TIMESTAMP,
    });
    expect(explanations.length).toBe(recommendations.length);
    expect(Object.isFrozen(explanations[0])).toBe(true);
  });

  it("builds LLMFormatterInput with structured keys only", () => {
    const decisions = createMockDecisionEnginePort().loadDecisions(portInput);
    const recommendations = createMockRecommendationEnginePort().loadRecommendations(portInput);
    const explanations = buildExplanationsFromPairs({ decisions, recommendations, focusAreaKeys: Object.freeze([]), at: FIXED_TIMESTAMP });
    const summary = buildExplanationSummary({ id: "summary:1", athleteId: "athlete:1", contextId: "context:1", explanations, focusAreaKeys: Object.freeze([]), at: FIXED_TIMESTAMP });
    const llm = buildLLMFormatterInput({ id: "llm:1", athleteId: "athlete:1", contextId: "context:1", explanations, summary, at: FIXED_TIMESTAMP });
    expect(llm.reasonCodes.length).toBeGreaterThan(0);
    expect(llm.evidenceKeys.length).toBeGreaterThan(0);
    expect(Object.isFrozen(llm)).toBe(true);
  });
});
`,
);

write(
  "__tests__/validators.test.ts",
  `import { buildExplanationsFromPairs } from "../builders/ExplanationBuilder";
import { buildExplanationPackage } from "../builders/PackageBuilder";
import { createMockDecisionEnginePort } from "../contracts/DecisionEnginePort";
import { createMockRecommendationEnginePort } from "../contracts/RecommendationEnginePort";
import { validateExplanationPackage } from "../validators";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("explainability-engine validators", () => {
  it("validates a complete explanation package", () => {
    const portInput = { athleteId: "athlete:1", sessionId: null, conversationId: null, contextId: "context:1", at: FIXED_TIMESTAMP };
    const explanations = buildExplanationsFromPairs({
      decisions: createMockDecisionEnginePort().loadDecisions(portInput),
      recommendations: createMockRecommendationEnginePort().loadRecommendations(portInput),
      focusAreaKeys: Object.freeze([]),
      at: FIXED_TIMESTAMP,
    });
    const pkg = buildExplanationPackage({
      id: "pkg:1",
      athleteId: "athlete:1",
      contextId: "context:1",
      explanations,
      summary: null,
      snapshot: null,
      graph: null,
      trace: null,
      timeline: null,
      llmFormatterInput: null,
      at: FIXED_TIMESTAMP,
    });
    const validation = validateExplanationPackage(pkg);
    expect(validation.valid).toBe(true);
  });
});
`,
);

write(
  "__tests__/policies.test.ts",
  `import { buildExplanationsFromPairs } from "../builders/ExplanationBuilder";
import { applySafetyPolicy } from "../policies/SafetyPolicy";
import { createMockDecisionEnginePort } from "../contracts/DecisionEnginePort";
import { createMockRecommendationEnginePort } from "../contracts/RecommendationEnginePort";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("explainability-engine policies", () => {
  it("elevates safety explanation priority", () => {
    const portInput = { athleteId: "athlete:1", sessionId: null, conversationId: null, contextId: "context:1", at: FIXED_TIMESTAMP };
    const explanations = buildExplanationsFromPairs({
      decisions: createMockDecisionEnginePort().loadDecisions(portInput),
      recommendations: createMockRecommendationEnginePort().loadRecommendations(portInput),
      focusAreaKeys: Object.freeze([]),
      at: FIXED_TIMESTAMP,
    });
    const adjusted = applySafetyPolicy(explanations);
    const safety = adjusted.find((e) => e.recommendationLink.category === "safety");
    expect(safety!.priority.ordinal).toBe(0);
  });
});
`,
);

write(
  "__tests__/application.test.ts",
  `import {
  buildExplanation,
  createExplanationSnapshot,
  describeExplanation,
  packageExplanation,
  validateExplanation,
} from "../application";
import { ExplanationInputKinds } from "../models/ExplanationInput";
import { ExplanationOperationKinds } from "../models/ExplanationResult";
import {
  createExplanationInput,
  createTestExplainabilityEngineService,
} from "../testSupport/fixtures";

describe("explainability-engine application", () => {
  it("exposes public API build → validate → snapshot → package → describe", () => {
    const service = createTestExplainabilityEngineService();

    const built = buildExplanation({
      service,
      input: createExplanationInput({ kind: ExplanationInputKinds.BUILD }),
    });
    expect(built.success).toBe(true);
    expect(built.operation).toBe(ExplanationOperationKinds.BUILD);
    expect(built.llmFormatterInput).not.toBeNull();
    expect(Object.isFrozen(built.explanations[0])).toBe(true);

    const validated = validateExplanation({
      service,
      input: createExplanationInput({ id: "request:validate", kind: ExplanationInputKinds.VALIDATE }),
    });
    expect(validated.success).toBe(true);

    const snap = createExplanationSnapshot({
      service,
      input: createExplanationInput({ id: "request:snapshot", kind: ExplanationInputKinds.SNAPSHOT }),
    });
    expect(snap.success).toBe(true);

    const packaged = packageExplanation({
      service,
      input: createExplanationInput({ id: "request:package", kind: ExplanationInputKinds.PACKAGE }),
    });
    expect(packaged.success).toBe(true);

    const caps = describeExplanation({ service });
    expect(caps.name).toBe("Explainability Engine");
    expect(caps.capabilities).toEqual(
      expect.arrayContaining([
        "buildExplanation",
        "validateExplanation",
        "describeExplanation",
        "createExplanationSnapshot",
        "packageExplanation",
      ]),
    );
  });
});
`,
);

write(
  "__tests__/integration.test.ts",
  `import { buildDecision } from "../../decision-engine/application";
import { DecisionInputKinds } from "../../decision-engine/models/DecisionInput";
import {
  createDecisionInput,
  createTestDecisionEngineService,
} from "../../decision-engine/testSupport/fixtures";
import { buildRecommendations } from "../../recommendation-engine/application";
import { RecommendationInputKinds } from "../../recommendation-engine/models/RecommendationInput";
import {
  createRecommendationInput,
  createTestRecommendationEngineService,
} from "../../recommendation-engine/testSupport/fixtures";
import { buildExplanation } from "../application";
import { ExplanationInputKinds } from "../models/ExplanationInput";
import {
  createExplanationInput,
  createTestExplainabilityEngineService,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("explainability-engine integration", () => {
  it("consumes recommendation-engine output and produces CoachingExplanation + LLMFormatterInput", () => {
    const decisionService = createTestDecisionEngineService();
    const decided = buildDecision({
      service: decisionService,
      input: createDecisionInput({ kind: DecisionInputKinds.BUILD }),
    });
    expect(decided.success).toBe(true);

    const recService = createTestRecommendationEngineService({ withMocks: false });
    const recResult = buildRecommendations({
      service: recService,
      input: createRecommendationInput({
        kind: RecommendationInputKinds.BUILD,
        decisions: decided.decisions,
        decisionHandoff: decided.recommendationInput,
        athleteId: decided.decisions[0]!.athleteId,
        contextId: decided.decisions[0]!.contextId,
      }),
    });
    expect(recResult.success).toBe(true);
    expect(recResult.explainabilityInput).not.toBeNull();

    const explainService = createTestExplainabilityEngineService({ withMocks: false });
    const explainResult = buildExplanation({
      service: explainService,
      input: createExplanationInput({
        kind: ExplanationInputKinds.BUILD,
        decisions: decided.decisions,
        recommendations: recResult.recommendations,
        explainabilityHandoff: recResult.explainabilityInput,
        athleteId: decided.decisions[0]!.athleteId,
        contextId: decided.decisions[0]!.contextId,
        createdAt: FIXED_TIMESTAMP,
      }),
    });

    expect(explainResult.success).toBe(true);
    expect(explainResult.explanations.length).toBe(recResult.recommendations.length);
    expect(explainResult.llmFormatterInput).not.toBeNull();
    expect(explainResult.llmFormatterInput!.reasonCodes.length).toBeGreaterThan(0);
    expect(
      explainResult.explanations.every((e) =>
        e.reasons.every((r) => !r.statementKey.includes(" ")),
      ),
    ).toBe(true);
  });
});
`,
);

write(
  "__tests__/regression.test.ts",
  `import {
  buildExplanation,
  describeExplanation,
} from "../application";
import { createMockDecisionEnginePort } from "../contracts/DecisionEnginePort";
import { createMockRecommendationEnginePort } from "../contracts/RecommendationEnginePort";
import {
  createExplanationInput,
  createTestExplainabilityEngineService,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("explainability-engine regression", () => {
  it("is deterministic for identical inputs", () => {
    const a = createTestExplainabilityEngineService();
    const b = createTestExplainabilityEngineService();
    const input = createExplanationInput();
    const left = a.buildExplanation(input);
    const right = b.buildExplanation(input);
    expect(left.explanations.map((e) => e.id)).toEqual(
      right.explanations.map((e) => e.id),
    );
    expect(left.package!.statistics).toEqual(right.package!.statistics);
  });

  it("freezes all output models", () => {
    const service = createTestExplainabilityEngineService();
    const result = service.buildExplanation(createExplanationInput());
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.explanations)).toBe(true);
    expect(Object.isFrozen(result.explanations[0])).toBe(true);
    expect(Object.isFrozen(result.package)).toBe(true);
    expect(Object.isFrozen(result.llmFormatterInput)).toBe(true);
  });

  it("does not mutate upstream decisions or recommendations", () => {
    const portInput = { athleteId: "athlete:1", sessionId: null, conversationId: null, contextId: "context:1", at: FIXED_TIMESTAMP };
    const decisions = createMockDecisionEnginePort().loadDecisions(portInput);
    const recommendations = createMockRecommendationEnginePort().loadRecommendations(portInput);
    const decisionSnapshot = JSON.stringify(decisions);
    const recSnapshot = JSON.stringify(recommendations);

    buildExplanation({
      input: createExplanationInput({ decisions, recommendations }),
    });

    expect(JSON.stringify(decisions)).toBe(decisionSnapshot);
    expect(JSON.stringify(recommendations)).toBe(recSnapshot);
  });

  it("uses structured codes/keys only — no NL prose fields", () => {
    const result = buildExplanation({ input: createExplanationInput() });
    const serialized = JSON.stringify(result);
    expect(serialized).not.toMatch(/openai|anthropic|http:\\/\\/|https:\\/\\//i);
    for (const e of result.explanations) {
      for (const r of e.reasons) {
        expect(r.statementKey).toMatch(/^[a-z0-9_.]+$/);
      }
    }
  });

  it("public API surface matches spec", () => {
    const caps = describeExplanation();
    expect(caps.capabilities).toHaveLength(5);
    expect(caps.boundaries).toContain("No NL generation");
  });
});
`,
);

console.log(`Generated ${fileCount} files (part 6)...`);
