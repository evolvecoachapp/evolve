import type { DecisionCandidate } from "../models/DecisionCandidate";
import type { DecisionConstraint } from "../models/DecisionConstraint";
import type { DecisionDependency } from "../models/DecisionDependency";
import type { DecisionEvaluation } from "../models/DecisionEvaluation";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import { freezeEvaluation } from "../utils/FreezeDecisionState";
import { evaluateConfidence } from "./ConfidenceEvaluator";
import { evaluateConsistency } from "./ConsistencyEvaluator";
import { evaluateConstraints } from "./ConstraintEvaluator";
import { evaluateImpact } from "./ImpactEvaluator";
import { evaluatePriority } from "./PriorityEvaluator";
import { evaluateRisk } from "./RiskEvaluator";

export * from "./PriorityEvaluator";
export * from "./ConstraintEvaluator";
export * from "./ConsistencyEvaluator";
export * from "./ConflictEvaluator";
export * from "./DependencyEvaluator";
export * from "./ConfidenceEvaluator";
export * from "./RiskEvaluator";
export * from "./ImpactEvaluator";

/**
 * Full deterministic evaluation of a candidate.
 */
export function evaluateCandidate(input: {
  readonly candidate: DecisionCandidate;
  readonly constraints: readonly DecisionConstraint[];
  readonly dependencies: readonly DecisionDependency[];
  readonly at: string;
}): DecisionEvaluation {
  const { candidate } = input;
  const priority = evaluatePriority(candidate);
  const confidence = evaluateConfidence(candidate);
  const consistency = evaluateConsistency(candidate);
  const risk = evaluateRisk(candidate);
  const impact = evaluateImpact(candidate);
  const violations = evaluateConstraints({
    candidate,
    constraints: input.constraints,
  });
  const total = Math.round(
    (priority.priorityComponent +
      confidence.score +
      consistency +
      risk +
      impact) /
      5,
  );
  return freezeEvaluation({
    id: `eval:${candidate.id}`,
    subjectId: candidate.id,
    score: Object.freeze({
      total,
      priorityComponent: priority.priorityComponent,
      confidenceComponent: confidence.score,
      riskComponent: risk,
      impactComponent: impact,
      consistencyComponent: consistency,
    }),
    confidence,
    passed: violations.length === 0,
    violations,
    notes: Object.freeze([] as string[]),
    metadata: EMPTY_DECISION_METADATA,
    evaluatedAt: input.at,
  });
}
