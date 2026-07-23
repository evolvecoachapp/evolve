import type { NutritionAgent } from "../models/NutritionAgent";
import type { NutritionAgentMetadata } from "../models/NutritionMetadata";
import type { NutritionAgentResult } from "../models/NutritionAgentResult";
import type { NutritionAgentSnapshot } from "../models/NutritionAgentSnapshot";
import type { NutritionAgentState } from "../models/NutritionAgentState";
import type { NutritionAgentStatistics } from "../models/NutritionStatistics";
import type { NutritionConfidence } from "../models/NutritionConfidence";
import type { NutritionContext } from "../models/NutritionContext";
import type { NutritionConversation } from "../models/NutritionConversation";
import type { NutritionDecision } from "../models/NutritionDecision";
import type { NutritionExecutionContext } from "../models/NutritionExecutionContext";
import type { NutritionExplanation } from "../models/NutritionExplanation";
import type { NutritionPlan } from "../models/NutritionPlan";
import type { NutritionPlanningContext } from "../models/NutritionPlanningContext";
import type { NutritionPlanningResult } from "../models/NutritionPlanningResult";
import type { NutritionReasoning } from "../models/NutritionReasoning";
import type { NutritionRecommendation } from "../models/NutritionRecommendation";
import type { NutritionRequest } from "../models/NutritionRequest";
import type { NutritionStrategy } from "../models/NutritionStrategy";
import type {
  NutritionValidation,
  NutritionValidationIssue,
} from "../models/NutritionValidation";
import type { MacroTargets } from "../models/MacroTargets";
import type { CalorieTargets } from "../models/CalorieTargets";
import type { MealDistribution } from "../models/MealDistribution";
import type { HydrationPlan } from "../models/HydrationPlan";
import type { SupplementPlan } from "../models/SupplementPlan";
import type { BodyCompositionState } from "../models/BodyCompositionState";
import type { NutritionConstraints } from "../models/NutritionConstraints";
import type { NutritionPreferences } from "../models/NutritionPreferences";

export function freezeMetadata(
  metadata: NutritionAgentMetadata,
): NutritionAgentMetadata {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezeConfidence(
  confidence: NutritionConfidence,
): NutritionConfidence {
  return Object.freeze({ ...confidence });
}

export function freezeStrategy(strategy: NutritionStrategy): NutritionStrategy {
  return Object.freeze({
    ...strategy,
    tags: Object.freeze([...strategy.tags]),
  });
}

export function freezeMacroTargets(targets: MacroTargets): MacroTargets {
  return Object.freeze({ ...targets });
}

export function freezeCalorieTargets(targets: CalorieTargets): CalorieTargets {
  return Object.freeze({ ...targets });
}

export function freezeMealDistribution(
  meals: MealDistribution,
): MealDistribution {
  return Object.freeze({
    ...meals,
    distribution: Object.freeze([...meals.distribution]),
  });
}

export function freezeHydrationPlan(plan: HydrationPlan): HydrationPlan {
  return Object.freeze({
    ...plan,
    notes: Object.freeze([...plan.notes]),
  });
}

export function freezeSupplementPlan(plan: SupplementPlan): SupplementPlan {
  return Object.freeze({
    ...plan,
    items: Object.freeze([...plan.items]),
    notes: Object.freeze([...plan.notes]),
  });
}

export function freezeBodyComposition(
  state: BodyCompositionState,
): BodyCompositionState {
  return Object.freeze({
    ...state,
    notes: Object.freeze([...state.notes]),
  });
}

export function freezeConstraints(
  constraints: NutritionConstraints,
): NutritionConstraints {
  return Object.freeze({
    allergies: Object.freeze([...constraints.allergies]),
    medicalNotes: Object.freeze([...constraints.medicalNotes]),
    minCalories: constraints.minCalories,
    maxCalories: constraints.maxCalories,
    flags: Object.freeze([...constraints.flags]),
  });
}

export function freezePreferences(
  preferences: NutritionPreferences,
): NutritionPreferences {
  return Object.freeze({
    ...preferences,
    preferredFoods: Object.freeze([...preferences.preferredFoods]),
    avoidedFoods: Object.freeze([...preferences.avoidedFoods]),
  });
}

export function freezeRequest(request: NutritionRequest): NutritionRequest {
  return Object.freeze({
    ...request,
    constraints: Object.freeze([...request.constraints]),
    preferences: request.preferences
      ? freezePreferences(request.preferences)
      : null,
    metadata: freezeMetadata(request.metadata),
  });
}

export function freezeContext(context: NutritionContext): NutritionContext {
  return Object.freeze({
    ...context,
    constraints: freezeConstraints(context.constraints),
    preferences: freezePreferences(context.preferences),
    bodyComposition: freezeBodyComposition(context.bodyComposition),
    toolResultIds: Object.freeze([...context.toolResultIds]),
    attributes: Object.freeze({ ...context.attributes }),
    strategy: context.strategy ? freezeStrategy(context.strategy) : null,
    metadata: freezeMetadata(context.metadata),
  });
}

export function freezeReasoning(
  reasoning: NutritionReasoning,
): NutritionReasoning {
  return Object.freeze({
    ...reasoning,
    findings: Object.freeze([...reasoning.findings]),
    signals: Object.freeze({ ...reasoning.signals }),
    notes: Object.freeze([...reasoning.notes]),
  });
}

export function freezePlanningContext(
  ctx: NutritionPlanningContext,
): NutritionPlanningContext {
  return Object.freeze({
    ...ctx,
    reasoning: Object.freeze(ctx.reasoning.map(freezeReasoning)),
    metadata: freezeMetadata(ctx.metadata),
  });
}

export function freezePlan(plan: NutritionPlan): NutritionPlan {
  return Object.freeze({
    ...plan,
    calorieTargets: freezeCalorieTargets(plan.calorieTargets),
    macroTargets: freezeMacroTargets(plan.macroTargets),
    mealDistribution: freezeMealDistribution(plan.mealDistribution),
    hydrationPlan: freezeHydrationPlan(plan.hydrationPlan),
    supplementPlan: freezeSupplementPlan(plan.supplementPlan),
    rationale: Object.freeze([...plan.rationale]),
    confidence: freezeConfidence(plan.confidence),
    metadata: freezeMetadata(plan.metadata),
  });
}

export function freezePlanningResult(
  result: NutritionPlanningResult,
): NutritionPlanningResult {
  return Object.freeze({
    ...result,
    planningContext: freezePlanningContext(result.planningContext),
    plan: freezePlan(result.plan),
    plannerIds: Object.freeze([...result.plannerIds]),
  });
}

export function freezeDecision(decision: NutritionDecision): NutritionDecision {
  return Object.freeze({
    ...decision,
    plan: decision.plan ? freezePlan(decision.plan) : null,
    confidence: freezeConfidence(decision.confidence),
    reasons: Object.freeze([...decision.reasons]),
    policyFlags: Object.freeze([...decision.policyFlags]),
    metadata: freezeMetadata(decision.metadata),
  });
}

export function freezeRecommendation(
  recommendation: NutritionRecommendation,
): NutritionRecommendation {
  return Object.freeze({
    ...recommendation,
    confidence: freezeConfidence(recommendation.confidence),
  });
}

export function freezeExplanation(
  explanation: NutritionExplanation,
): NutritionExplanation {
  return Object.freeze({
    ...explanation,
    bullets: Object.freeze([...explanation.bullets]),
    policyNotes: Object.freeze([...explanation.policyNotes]),
  });
}

export function freezeConversation(
  conversation: NutritionConversation,
): NutritionConversation {
  return Object.freeze({ ...conversation });
}

export function freezeExecutionContext(
  ctx: NutritionExecutionContext,
): NutritionExecutionContext {
  return Object.freeze({
    ...ctx,
    context: freezeContext(ctx.context),
    pendingToolIds: Object.freeze([...ctx.pendingToolIds]),
    metadata: freezeMetadata(ctx.metadata),
  });
}

export function freezeStatistics(
  stats: NutritionAgentStatistics,
): NutritionAgentStatistics {
  return Object.freeze({ ...stats });
}

export function freezeValidationIssue(
  issue: NutritionValidationIssue,
): NutritionValidationIssue {
  return Object.freeze({ ...issue });
}

export function freezeValidation(
  validation: NutritionValidation,
): NutritionValidation {
  return Object.freeze({
    valid: validation.valid,
    issues: Object.freeze(validation.issues.map(freezeValidationIssue)),
  });
}

export function freezeAgentState(
  state: NutritionAgentState,
): NutritionAgentState {
  return Object.freeze({ ...state });
}

export function freezeSnapshot(
  snapshot: NutritionAgentSnapshot,
): NutritionAgentSnapshot {
  return Object.freeze({
    ...snapshot,
    decision: snapshot.decision ? freezeDecision(snapshot.decision) : null,
    plan: snapshot.plan ? freezePlan(snapshot.plan) : null,
    explanation: snapshot.explanation
      ? freezeExplanation(snapshot.explanation)
      : null,
    statistics: freezeStatistics(snapshot.statistics),
  });
}

export function freezeAgent(agent: NutritionAgent): NutritionAgent {
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
  result: NutritionAgentResult,
): NutritionAgentResult {
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
    statistics: freezeStatistics(result.statistics),
    metadata: freezeMetadata(result.metadata),
  });
}

/** Alias matching sprint utility naming. */
export const FreezeNutritionState = Object.freeze({
  freezeAgentState,
  freezeAgentResult,
  freezeContext,
  freezeDecision,
  freezePlan,
});
