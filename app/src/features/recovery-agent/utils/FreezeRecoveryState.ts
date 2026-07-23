import type { RecoveryAgent } from "../models/RecoveryAgent";
import type { RecoveryAgentMetadata } from "../models/RecoveryMetadata";
import type { RecoveryAgentResult } from "../models/RecoveryAgentResult";
import type { RecoveryAgentSnapshot } from "../models/RecoveryAgentSnapshot";
import type { RecoveryAgentState } from "../models/RecoveryAgentState";
import type { RecoveryConfidence } from "../models/RecoveryConfidence";
import type { RecoveryContext } from "../models/RecoveryContext";
import type { RecoveryConversation } from "../models/RecoveryConversation";
import type { RecoveryDecision } from "../models/RecoveryDecision";
import type { RecoveryExplanation } from "../models/RecoveryExplanation";
import type { RecoveryPlan } from "../models/RecoveryPlan";
import type { RecoveryPlanningContext } from "../models/RecoveryPlanningContext";
import type { RecoveryPlanningResult } from "../models/RecoveryPlanningResult";
import type { RecoveryReasoning } from "../models/RecoveryReasoning";
import type { RecoveryRecommendation } from "../models/RecoveryRecommendation";
import type { RecoveryRequest } from "../models/RecoveryRequest";
import type { RecoveryStrategy } from "../models/RecoveryStrategy";
import type {
  RecoveryValidation,
  RecoveryValidationIssue,
} from "../models/RecoveryValidation";
import type { RecoveryAssessment } from "../models/RecoveryAssessment";
import type { RecoveryConstraints } from "../models/RecoveryConstraints";
import type { RecoveryIndicators } from "../models/RecoveryIndicators";
import type { RecoveryProfile } from "../models/RecoveryProfile";
import type { FatigueState } from "../models/FatigueState";
import type { ReadinessState } from "../models/ReadinessState";
import type { SleepProfile } from "../models/SleepProfile";
import type { StressProfile } from "../models/StressProfile";
import type { TrainingLoad } from "../models/TrainingLoad";
import type { RecoveryScore } from "../models/RecoveryScore";
import type { DeloadRecommendation } from "../models/DeloadRecommendation";
import type { RecoverySnapshot } from "../models/RecoverySnapshot";

export function freezeMetadata(
  metadata: RecoveryAgentMetadata,
): RecoveryAgentMetadata {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezeConfidence(
  confidence: RecoveryConfidence,
): RecoveryConfidence {
  return Object.freeze({ ...confidence });
}

export function freezeStrategy(strategy: RecoveryStrategy): RecoveryStrategy {
  return Object.freeze({
    ...strategy,
    tags: Object.freeze([...strategy.tags]),
  });
}

export function freezeConstraints(
  constraints: RecoveryConstraints,
): RecoveryConstraints {
  return Object.freeze({
    ...constraints,
    notes: Object.freeze([...constraints.notes]),
  });
}

export function freezeIndicators(
  indicators: RecoveryIndicators,
): RecoveryIndicators {
  return Object.freeze({ ...indicators });
}

export function freezeProfile(profile: RecoveryProfile): RecoveryProfile {
  return Object.freeze({
    ...profile,
    notes: Object.freeze([...profile.notes]),
  });
}

export function freezeFatigue(state: FatigueState): FatigueState {
  return Object.freeze({
    ...state,
    notes: Object.freeze([...state.notes]),
  });
}

export function freezeReadiness(state: ReadinessState): ReadinessState {
  return Object.freeze({
    ...state,
    notes: Object.freeze([...state.notes]),
  });
}

export function freezeSleep(profile: SleepProfile): SleepProfile {
  return Object.freeze({
    ...profile,
    notes: Object.freeze([...profile.notes]),
  });
}

export function freezeStress(profile: StressProfile): StressProfile {
  return Object.freeze({
    ...profile,
    notes: Object.freeze([...profile.notes]),
  });
}

export function freezeTrainingLoad(load: TrainingLoad): TrainingLoad {
  return Object.freeze({
    ...load,
    notes: Object.freeze([...load.notes]),
  });
}

export function freezeRecoveryScore(score: RecoveryScore): RecoveryScore {
  return Object.freeze({
    ...score,
    components: Object.freeze({ ...score.components }),
  });
}

export function freezeDeload(
  deload: DeloadRecommendation,
): DeloadRecommendation {
  return Object.freeze({ ...deload });
}

export function freezeAssessment(
  assessment: RecoveryAssessment,
): RecoveryAssessment {
  return Object.freeze({
    ...assessment,
    recoveryScore: freezeRecoveryScore(assessment.recoveryScore),
    readiness: freezeReadiness(assessment.readiness),
    fatigue: freezeFatigue(assessment.fatigue),
    sleep: freezeSleep(assessment.sleep),
    stress: freezeStress(assessment.stress),
    trainingLoad: freezeTrainingLoad(assessment.trainingLoad),
    indicators: freezeIndicators(assessment.indicators),
    deload: freezeDeload(assessment.deload),
    confidence: freezeConfidence(assessment.confidence),
  });
}

export function freezeRequest(request: RecoveryRequest): RecoveryRequest {
  return Object.freeze({
    ...request,
    constraints: Object.freeze([...request.constraints]),
    metadata: freezeMetadata(request.metadata),
  });
}

export function freezeContext(context: RecoveryContext): RecoveryContext {
  return Object.freeze({
    ...context,
    strategy: context.strategy ? freezeStrategy(context.strategy) : null,
    profile: freezeProfile(context.profile),
    indicators: freezeIndicators(context.indicators),
    fatigue: freezeFatigue(context.fatigue),
    readiness: freezeReadiness(context.readiness),
    sleep: freezeSleep(context.sleep),
    stress: freezeStress(context.stress),
    trainingLoad: freezeTrainingLoad(context.trainingLoad),
    constraints: freezeConstraints(context.constraints),
    toolResultIds: Object.freeze([...context.toolResultIds]),
    attributes: Object.freeze({ ...context.attributes }),
    metadata: freezeMetadata(context.metadata),
  });
}

export function freezeReasoning(
  reasoning: RecoveryReasoning,
): RecoveryReasoning {
  return Object.freeze({
    ...reasoning,
    findings: Object.freeze([...reasoning.findings]),
    signals: Object.freeze({ ...reasoning.signals }),
    notes: Object.freeze([...reasoning.notes]),
  });
}

export function freezePlanningContext(
  ctx: RecoveryPlanningContext,
): RecoveryPlanningContext {
  return Object.freeze({
    ...ctx,
    constraints: Object.freeze([...ctx.constraints]),
  });
}

export function freezePlan(plan: RecoveryPlan): RecoveryPlan {
  return Object.freeze({
    ...plan,
    deloadRecommendation: freezeDeload(plan.deloadRecommendation),
    assessment: freezeAssessment(plan.assessment),
    sessionNotes: Object.freeze([...plan.sessionNotes]),
    confidence: freezeConfidence(plan.confidence),
    rationale: Object.freeze([...plan.rationale]),
    metadata: freezeMetadata(plan.metadata),
  });
}

export function freezePlanningResult(
  result: RecoveryPlanningResult,
): RecoveryPlanningResult {
  return Object.freeze({
    planningContext: freezePlanningContext(result.planningContext),
    plan: freezePlan(result.plan),
    plannerIds: Object.freeze([...result.plannerIds]),
    notes: Object.freeze([...result.notes]),
  });
}

export function freezeDecision(decision: RecoveryDecision): RecoveryDecision {
  return Object.freeze({
    ...decision,
    plan: decision.plan ? freezePlan(decision.plan) : null,
    assessment: decision.assessment
      ? freezeAssessment(decision.assessment)
      : null,
    confidence: freezeConfidence(decision.confidence),
    reasons: Object.freeze([...decision.reasons]),
    policyFlags: Object.freeze([...decision.policyFlags]),
    metadata: freezeMetadata(decision.metadata),
  });
}

export function freezeRecommendation(
  rec: RecoveryRecommendation,
): RecoveryRecommendation {
  return Object.freeze({ ...rec });
}

export function freezeExplanation(
  explanation: RecoveryExplanation,
): RecoveryExplanation {
  return Object.freeze({
    ...explanation,
    bullets: Object.freeze([...explanation.bullets]),
    policyNotes: Object.freeze([...explanation.policyNotes]),
  });
}

export function freezeConversation(
  conversation: RecoveryConversation,
): RecoveryConversation {
  return Object.freeze({ ...conversation });
}

export function freezeValidationIssue(
  issue: RecoveryValidationIssue,
): RecoveryValidationIssue {
  return Object.freeze({ ...issue });
}

export function freezeValidation(
  validation: RecoveryValidation,
): RecoveryValidation {
  return Object.freeze({
    valid: validation.valid,
    issues: Object.freeze(validation.issues.map(freezeValidationIssue)),
  });
}

export function freezeAgentState(
  state: RecoveryAgentState,
): RecoveryAgentState {
  return Object.freeze({ ...state });
}

export function freezeSnapshot(
  snapshot: RecoveryAgentSnapshot,
): RecoveryAgentSnapshot {
  return Object.freeze({
    ...snapshot,
    decision: freezeDecision(snapshot.decision),
    plan: snapshot.plan ? freezePlan(snapshot.plan) : null,
    assessment: snapshot.assessment
      ? freezeAssessment(snapshot.assessment)
      : null,
    explanation: freezeExplanation(snapshot.explanation),
    statistics: Object.freeze({ ...snapshot.statistics }),
  });
}

export function freezeRecoverySnapshot(
  snapshot: RecoverySnapshot,
): RecoverySnapshot {
  return Object.freeze({
    ...snapshot,
    assessment: freezeAssessment(snapshot.assessment),
    plan: snapshot.plan ? freezePlan(snapshot.plan) : null,
    indicators: freezeIndicators(snapshot.indicators),
  });
}

export function freezeAgent(agent: RecoveryAgent): RecoveryAgent {
  return Object.freeze({
    ...agent,
    capabilities: Object.freeze([...agent.capabilities]),
    strategyIds: Object.freeze([...agent.strategyIds]),
    policyIds: Object.freeze([...agent.policyIds]),
    reasonerIds: Object.freeze([...agent.reasonerIds]),
    plannerIds: Object.freeze([...agent.plannerIds]),
    metadata: freezeMetadata(agent.metadata),
  });
}

export function freezeAgentResult(
  result: RecoveryAgentResult,
): RecoveryAgentResult {
  return Object.freeze({
    ...result,
    request: freezeRequest(result.request),
    context: freezeContext(result.context),
    conversation: freezeConversation(result.conversation),
    reasoning: Object.freeze(result.reasoning.map(freezeReasoning)),
    decision: freezeDecision(result.decision),
    recommendations: Object.freeze(
      result.recommendations.map(freezeRecommendation),
    ),
    explanation: freezeExplanation(result.explanation),
    validation: freezeValidation(result.validation),
    snapshot: freezeSnapshot(result.snapshot),
    statistics: Object.freeze({ ...result.statistics }),
    metadata: freezeMetadata(result.metadata),
  });
}

export const FreezeRecoveryState = Object.freeze({
  freezeAgentState,
  freezeAgentResult,
  freezeContext,
  freezeDecision,
  freezePlan,
  freezeAssessment,
});
