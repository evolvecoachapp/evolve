import type { AdaptationRecommendation } from "../../training-adaptation/models/AdaptationRecommendation";
import type { WorkoutAssemblyExplanation } from "../models/WorkoutAssemblyExplanation";
import type { WorkoutAssemblyRequest } from "../models/WorkoutAssemblyRequest";
import type { WorkoutAssemblyResult } from "../models/WorkoutAssemblyResult";
import type { WorkoutExercise } from "../models/WorkoutExercise";
import type { WorkoutSession } from "../models/WorkoutSession";
import { WorkoutAssemblyError } from "../models/WorkoutAssemblyError";
import { assembleExercises } from "../utils/assembleExercises";
import { buildAssemblyContext } from "../utils/buildAssemblyContext";
import { buildSummary } from "../utils/buildSummary";
import { estimateAssemblyScore } from "../utils/estimateAssemblyScore";
import { estimateDuration } from "../utils/estimateDuration";
import { estimateWorkload } from "../utils/estimateWorkload";
import { freezeWorkoutAssemblyResult } from "../utils/freezeWorkoutSession";
import { groupIntoBlocks } from "../utils/groupIntoBlocks";
import { buildExecutionOrder } from "../utils/normalizeSession";
import { resolveRecommendations } from "../utils/resolveRecommendations";
import { sortExercises } from "../utils/sortExercises";
import {
  assignExercisesToBlocks,
  validateWorkoutAssemblyResult,
} from "../validators";

/**
 * Deterministic Workout Assembly Engine.
 *
 * Assembles the final executable WorkoutSession from prior pipeline outputs.
 *
 * Never generates strategy.
 * Never performs programming.
 * Never performs progression.
 * Never evaluates readiness.
 * Only assembles the final workout.
 */
export class WorkoutAssemblyEngine {
  async assemble(
    request: WorkoutAssemblyRequest,
  ): Promise<WorkoutAssemblyResult> {
    this.assertRequest(request);

    const context = buildAssemblyContext(request);
    const recommendations = resolveRecommendations(request, context.weekNumber);
    const isRecoveryDay = recommendations.some(
      (recommendation) => recommendation.action.kind === "insert_recovery_day",
    );

    const rawExercises = assembleExercises(
      context,
      request.programming.prescriptions,
      request.progression,
      request.selection,
      recommendations,
    );

    const sortedExercises = sortExercises(rawExercises);
    const blocks = groupIntoBlocks(sortedExercises, { isRecoveryDay });

    const blockIdByExerciseId = new Map<string, string>();
    for (const block of blocks) {
      for (const exerciseId of block.exerciseIds) {
        blockIdByExerciseId.set(exerciseId, block.id);
      }
    }

    const exercises = assignExercisesToBlocks(
      sortedExercises,
      blockIdByExerciseId,
    );
    const executionOrder = buildExecutionOrder(exercises, blocks);
    const summary = buildSummary({
      exercises,
      blocks,
      readinessScore: context.readinessScore,
    });

    const day = request.blueprint.days.find((entry) => entry.id === context.dayId);
    const notes = this.buildSessionNotes(
      request,
      recommendations,
      isRecoveryDay,
    );

    const session: WorkoutSession = Object.freeze({
      id: this.buildSessionId(context.adaptationRequestId, context.weekNumber),
      blueprintId: context.blueprintId,
      dayId: context.dayId,
      dayIndex: context.dayIndex,
      weekNumber: context.weekNumber,
      name: day?.name ?? `Day ${context.dayIndex}`,
      focus: context.focus,
      sessionGoal: context.sessionGoal,
      priority: context.priority,
      exercises,
      blocks,
      executionOrder,
      summary,
      notes,
      estimatedDurationSeconds: estimateDuration(exercises),
      estimatedWorkload: estimateWorkload(exercises),
      assembledAt: FIXED_ASSEMBLY_TIMESTAMP,
    });

    const validationIssues = validateWorkoutAssemblyResult(
      request,
      session,
      recommendations,
    );
    const score = estimateAssemblyScore({
      exercises,
      recommendations,
      validationIssueCount: validationIssues.length,
    });

    const explanations = context.includeExplanations
      ? this.buildExplanations(exercises, recommendations)
      : Object.freeze([] as WorkoutAssemblyExplanation[]);

    return freezeWorkoutAssemblyResult({
      requestId: this.buildRequestId(
        context.adaptationRequestId,
        context.weekNumber,
      ),
      context,
      session,
      explanations,
      validationIssues,
      score,
      assembledAt: FIXED_ASSEMBLY_TIMESTAMP,
    });
  }

  /**
   * Preview assembly with explanations always enabled.
   */
  async preview(
    request: WorkoutAssemblyRequest,
  ): Promise<WorkoutAssemblyResult> {
    return this.assemble({
      ...request,
      includeExplanations: true,
    });
  }

  /**
   * Return explanations for a prior result (or rebuild from session).
   */
  explain(result: WorkoutAssemblyResult): readonly WorkoutAssemblyExplanation[] {
    if (result.explanations.length > 0) {
      return result.explanations;
    }
    return this.buildExplanations(
      result.session.exercises,
      result.context.recommendationCount > 0
        ? this.rebuildRecommendationStubs(result)
        : Object.freeze([]),
    );
  }

  private assertRequest(request: WorkoutAssemblyRequest): void {
    if (!request.blueprint) {
      throw new WorkoutAssemblyError(
        "missing_blueprint",
        "Workout assembly request requires a WorkoutBlueprint",
      );
    }
    if (!request.selection) {
      throw new WorkoutAssemblyError(
        "missing_selection",
        "Workout assembly request requires an ExerciseSelectionResult",
      );
    }
    if (!request.programming) {
      throw new WorkoutAssemblyError(
        "missing_programming",
        "Workout assembly request requires a ProgrammingResult",
      );
    }
    if (!request.progression) {
      throw new WorkoutAssemblyError(
        "missing_progression",
        "Workout assembly request requires a ProgressionPlan",
      );
    }
    if (!request.adaptation) {
      throw new WorkoutAssemblyError(
        "missing_adaptation",
        "Workout assembly request requires a TrainingAdaptationResult",
      );
    }
    if (request.programming.prescriptions.length === 0) {
      throw new WorkoutAssemblyError(
        "empty_programming",
        "Cannot assemble a workout from empty programming prescriptions",
        { programmingRequestId: request.programming.requestId },
      );
    }
  }

  private buildExplanations(
    exercises: readonly WorkoutExercise[],
    recommendations: readonly AdaptationRecommendation[],
  ): readonly WorkoutAssemblyExplanation[] {
    const recommendationExplanations = recommendations.map((recommendation) =>
      Object.freeze({
        subjectId: recommendation.id,
        summaryCode: `assemble_${recommendation.action.kind}`,
        reasons: Object.freeze(
          recommendation.reasons.map((reason) => Object.freeze({ ...reason })),
        ),
        score: Object.freeze({
          total: recommendation.score.total,
          ordering: 0,
          prescription: 0,
          adaptation: recommendation.score.adaptation,
          integrity: 0,
          workload: 0,
        }),
      }),
    );

    const exerciseExplanations = exercises.map((exercise) =>
      Object.freeze({
        subjectId: exercise.id,
        summaryCode: `assemble_exercise_${exercise.role}`,
        reasons: Object.freeze([
          Object.freeze({
            code: "exercise_assembled",
            weight: 1,
            detail: `order_${exercise.order}`,
          }),
        ]),
        score: Object.freeze({
          total: 1,
          ordering: 1,
          prescription: 1,
          adaptation: exercise.appliedRecommendationIds.length > 0 ? 1 : 0,
          integrity: 1,
          workload: Math.min(1, exercise.estimatedWorkload / 100),
        }),
      }),
    );

    return Object.freeze([...recommendationExplanations, ...exerciseExplanations]);
  }

  private rebuildRecommendationStubs(
    result: WorkoutAssemblyResult,
  ): readonly AdaptationRecommendation[] {
    const ids = new Set(
      result.session.exercises.flatMap(
        (exercise) => exercise.appliedRecommendationIds,
      ),
    );
    return Object.freeze(
      [...ids].map((id) =>
        Object.freeze({
          id,
          strategyId: "resolved",
          action: Object.freeze({
            kind: "maintain" as const,
            magnitude: 0,
            priority: 100,
          }),
          reasons: Object.freeze([]),
          score: Object.freeze({
            total: 0,
            readiness: 0,
            recovery: 0,
            fatigue: 0,
            constraints: 0,
            adaptation: 0,
          }),
        }),
      ),
    );
  }

  private buildSessionNotes(
    request: WorkoutAssemblyRequest,
    recommendations: readonly AdaptationRecommendation[],
    isRecoveryDay: boolean,
  ): readonly string[] {
    const notes: string[] = [
      ...request.adaptation.adaptedProgression.notes,
    ];
    if (isRecoveryDay) {
      notes.push("session_mode:recovery");
    }
    for (const recommendation of recommendations) {
      notes.push(`resolved:${recommendation.action.kind}:${recommendation.id}`);
    }
    return Object.freeze(notes);
  }

  private buildRequestId(
    adaptationRequestId: string,
    weekNumber: number,
  ): string {
    return `assembly:${adaptationRequestId}:w${weekNumber}`;
  }

  private buildSessionId(
    adaptationRequestId: string,
    weekNumber: number,
  ): string {
    return `session:${adaptationRequestId}:w${weekNumber}`;
  }
}

/** Fixed timestamp keeps assembly results deterministic across runs. */
export const FIXED_ASSEMBLY_TIMESTAMP = "2026-07-22T12:00:00.000Z";
