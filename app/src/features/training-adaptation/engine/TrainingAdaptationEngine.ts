import type { AdaptationExplanation } from "../models/AdaptationExplanation";
import type { AdaptationRecommendation } from "../models/AdaptationRecommendation";
import type { ReadinessAssessment } from "../models/ReadinessAssessment";
import type { TrainingAdaptationRequest } from "../models/TrainingAdaptationRequest";
import type { TrainingAdaptationResult } from "../models/TrainingAdaptationResult";
import { TrainingAdaptationError } from "../models/TrainingAdaptationError";
import {
  createDefaultAssessments,
  type DefaultAssessments,
} from "../assessments";
import {
  createDefaultStrategies,
  type AdaptationStrategy,
} from "../strategies";
import { aggregateAssessments } from "../utils/aggregateAssessments";
import { buildAdaptationContext } from "../utils/buildAdaptationContext";
import { estimateAdaptationScore } from "../utils/estimateAdaptationScore";
import { freezeTrainingAdaptationResult } from "../utils/freezeTrainingAdaptationResult";
import { normalizeRecommendations } from "../utils/normalizeRecommendations";
import { sortRecommendations } from "../utils/sortRecommendations";
import { validateTrainingAdaptationResult } from "../validators";

/**
 * Deterministic Training Adaptation Engine.
 *
 * Evaluates whether an existing Progression Plan should be adapted
 * before execution. Produces immutable readiness assessments and
 * adaptation recommendations only.
 *
 * Never generates workouts.
 * Never replaces Programming or Progression.
 * Never integrates wearables, athlete history, or physiological APIs.
 */
export class TrainingAdaptationEngine {
  constructor(
    private readonly assessments: DefaultAssessments = createDefaultAssessments(),
    private readonly strategies: readonly AdaptationStrategy[] = createDefaultStrategies(),
  ) {}

  async evaluate(
    request: TrainingAdaptationRequest,
  ): Promise<TrainingAdaptationResult> {
    this.assertRequest(request);

    const context = buildAdaptationContext(request);
    const plan = request.progression;

    const recovery = this.assessments.recovery.assess(context, plan);
    const fatigue = this.assessments.fatigue.assess(context, plan);
    const constraints = this.assessments.constraint.assess(context, plan);
    const execution = this.assessments.execution.assess(context, plan);

    const readiness: ReadinessAssessment = aggregateAssessments({
      recovery,
      fatigue,
      constraints,
      executionConfidence: execution.executionConfidence,
    });

    const rawRecommendations = this.strategies.flatMap((strategy) =>
      strategy.recommend(context, readiness, plan),
    );
    const recommendations = sortRecommendations(
      normalizeRecommendations(rawRecommendations),
    );

    const explanations = context.includeExplanations
      ? this.buildExplanations(recommendations)
      : Object.freeze([] as AdaptationExplanation[]);

    const validationIssues = validateTrainingAdaptationResult(
      request,
      readiness,
      recommendations,
      context.constraints,
    );
    const score = estimateAdaptationScore(readiness, recommendations);

    const adaptedProgression = Object.freeze({
      sourcePlanRequestId: plan.requestId,
      readinessScore: readiness.overallScore,
      appliedRecommendationIds: Object.freeze(
        recommendations.map((recommendation) => recommendation.id),
      ),
      notes: Object.freeze(
        recommendations.length === 0
          ? (["maintain_progression"] as const)
          : recommendations.map(
              (recommendation) =>
                `${recommendation.action.kind}:${recommendation.id}`,
            ),
      ),
      sourcePlan: plan,
    });

    return freezeTrainingAdaptationResult({
      requestId: this.buildRequestId(plan.requestId),
      context,
      readiness,
      recommendations,
      adaptedProgression,
      explanations,
      validationIssues,
      score,
      adaptedAt: FIXED_ADAPTATION_TIMESTAMP,
    });
  }

  /**
   * Preview adaptations with explanations always enabled.
   */
  async preview(
    request: TrainingAdaptationRequest,
  ): Promise<TrainingAdaptationResult> {
    return this.evaluate({
      ...request,
      includeExplanations: true,
    });
  }

  /**
   * Return explanations for a prior result (or rebuild from recommendations).
   */
  explain(
    result: TrainingAdaptationResult,
  ): readonly AdaptationExplanation[] {
    if (result.explanations.length > 0) {
      return result.explanations;
    }
    return this.buildExplanations(result.recommendations);
  }

  private assertRequest(request: TrainingAdaptationRequest): void {
    if (!request.blueprint) {
      throw new TrainingAdaptationError(
        "missing_blueprint",
        "Training adaptation request requires a WorkoutBlueprint",
      );
    }
    if (!request.progression) {
      throw new TrainingAdaptationError(
        "missing_progression",
        "Training adaptation request requires a ProgressionPlan",
      );
    }
    if (request.progression.exerciseProgressions.length === 0) {
      throw new TrainingAdaptationError(
        "empty_progression",
        "Cannot adapt an empty progression plan",
        { progressionRequestId: request.progression.requestId },
      );
    }
  }

  private buildExplanations(
    recommendations: readonly AdaptationRecommendation[],
  ): readonly AdaptationExplanation[] {
    return Object.freeze(
      recommendations.map((recommendation) =>
        Object.freeze({
          recommendationId: recommendation.id,
          summaryCode: `adapt_${recommendation.action.kind}`,
          reasons: recommendation.reasons,
          score: recommendation.score,
        }),
      ),
    );
  }

  private buildRequestId(progressionRequestId: string): string {
    return `adaptation:${progressionRequestId}`;
  }
}

/** Fixed timestamp keeps adaptation results deterministic across runs. */
export const FIXED_ADAPTATION_TIMESTAMP = "2026-07-22T12:00:00.000Z";
