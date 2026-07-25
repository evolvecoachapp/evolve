import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import type { CoachingExplanation } from "../models/CoachingExplanation";
import { ExplanationSectionKinds } from "../models/ExplanationSection";
import { priorityForOrdinal } from "../models/ExplanationPriority";
import {
  ExplanationConfidenceLevels,
  type ExplanationConfidenceLevel,
} from "../models/ExplanationConfidence";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { buildConstraintEvidence, buildDecisionEvidence, buildDependencyEvidence, buildRecommendationEvidence } from "../evidence";
import { deriveConfidenceReasons, deriveConsistencyReasons, deriveConstraintReasons, deriveDecisionReasons, deriveDependencyReasons, derivePriorityReasons, deriveRecommendationReasons } from "../reasoning";
import { freezeExplanation, freezeSection } from "../utils/FreezeExplanationState";

function mapConfidenceLevel(level: string): ExplanationConfidenceLevel {
  if (level === ExplanationConfidenceLevels.HIGH) return ExplanationConfidenceLevels.HIGH;
  if (level === ExplanationConfidenceLevels.MEDIUM) return ExplanationConfidenceLevels.MEDIUM;
  return ExplanationConfidenceLevels.LOW;
}

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
    freezeSection({ id: `section:reasons:${recommendation.id}`, kind: ExplanationSectionKinds.REASONS, key: "reasons", subjectId: recommendation.id, itemKeys: Object.freeze(reasons.map((r) => r.id)), metadata: EMPTY_EXPLANATION_METADATA }),
    freezeSection({ id: `section:evidence:${recommendation.id}`, kind: ExplanationSectionKinds.EVIDENCE, key: "evidence", subjectId: recommendation.id, itemKeys: Object.freeze(evidence.map((e) => e.key)), metadata: EMPTY_EXPLANATION_METADATA }),
  ]);

  return freezeExplanation({
    id: `explanation:${recommendation.id}`,
    athleteId: recommendation.athleteId,
    sessionId: recommendation.sessionId,
    conversationId: recommendation.conversationId,
    contextId: recommendation.contextId,
    recommendationId: recommendation.id,
    decisionId: decision.id,
    reasons,
    evidence,
    sections,
    confidence: Object.freeze({
      level: mapConfidenceLevel(recommendation.confidence.level),
      score: recommendation.confidence.score,
      evidenceCount: evidence.length,
      notes: Object.freeze([]),
    }),
    priority: priorityForOrdinal(recommendation.priority.ordinal),
    decisionLink: Object.freeze({ id: `link:dec:${decision.id}`, decisionId: decision.id, explanationId: `explanation:${recommendation.id}`, category: decision.category, intent: decision.intent, outcome: decision.outcome, metadata: EMPTY_EXPLANATION_METADATA }),
    recommendationLink: Object.freeze({ id: `link:rec:${recommendation.id}`, recommendationId: recommendation.id, explanationId: `explanation:${recommendation.id}`, category: recommendation.category, intent: recommendation.intent, type: recommendation.type, metadata: EMPTY_EXPLANATION_METADATA }),
    contextReference: Object.freeze({ id: `ctxref:${recommendation.contextId}`, contextId: recommendation.contextId, athleteId: recommendation.athleteId, focusAreaKeys: Object.freeze([...input.focusAreaKeys]), metadata: EMPTY_EXPLANATION_METADATA }),
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
      if (!decision) throw new Error(`Missing decision for recommendation ${r.id}`);
      return buildExplanation({ decision, recommendation: r, focusAreaKeys: input.focusAreaKeys, at: input.at });
    }),
  );
}
