import { ProgressionError } from "../models/ProgressionError";
import type { ProgressionExplanation } from "../models/ProgressionExplanation";
import type { ProgressionPlan } from "../models/ProgressionPlan";
import type { ProgressionRequest } from "../models/ProgressionRequest";
import type { ExerciseProgression } from "../models/ExerciseProgression";
import type { ProgressionStrategy } from "../strategies/ProgressionStrategy";
import { createDefaultStrategies } from "../strategies";
import { buildProgressionContext } from "../utils/buildProgressionContext";
import { estimateProgressionScore } from "../utils/estimateProgressionScore";
import { freezeProgressionPlan } from "../utils/freezeProgressionPlan";
import {
  normalizeExerciseProgression,
  normalizeTimeline,
} from "../utils/normalizeTimeline";
import { validateProgressionPlan } from "../validators";

/**
 * Deterministic Progression Engine.
 *
 * Transforms immutable ProgrammingResult objects into immutable Progression Plans.
 * Defines how prescriptions evolve over time only.
 *
 * Never adapts to athlete feedback.
 * Never calculates loads.
 * Never autoregulates.
 * Never performs fatigue management.
 */
export class ProgressionEngine {
  constructor(
    private readonly strategies: readonly ProgressionStrategy[] = createDefaultStrategies(),
  ) {}

  async generate(request: ProgressionRequest): Promise<ProgressionPlan> {
    this.assertRequest(request);

    const context = buildProgressionContext(request);
    const skeletons = request.programming.prescriptions.map((prescription) =>
      normalizeExerciseProgression(prescription, context),
    );

    const progressed = skeletons.map((progression) =>
      this.applyStrategies(progression, context),
    );

    const timeline = normalizeTimeline(progressed);
    const explanations = context.includeExplanations
      ? this.buildExplanations(progressed)
      : Object.freeze([] as ProgressionExplanation[]);

    const validationIssues = validateProgressionPlan(
      request,
      progressed,
      timeline,
      context.window,
    );
    const score = estimateProgressionScore(progressed);

    return freezeProgressionPlan({
      requestId: this.buildRequestId(context.programmingRequestId),
      context,
      exerciseProgressions: Object.freeze(progressed),
      timeline,
      explanations,
      validationIssues,
      score,
      progressedAt: FIXED_PROGRESSION_TIMESTAMP,
    });
  }

  /**
   * Preview progression with explanations always enabled.
   */
  async preview(request: ProgressionRequest): Promise<ProgressionPlan> {
    return this.generate({
      ...request,
      includeExplanations: true,
    });
  }

  /**
   * Return explanations for a prior plan (or rebuild from progressions).
   */
  explain(plan: ProgressionPlan): readonly ProgressionExplanation[] {
    if (plan.explanations.length > 0) {
      return plan.explanations;
    }
    return this.buildExplanations(plan.exerciseProgressions);
  }

  private assertRequest(request: ProgressionRequest): void {
    if (!request.blueprint) {
      throw new ProgressionError(
        "missing_blueprint",
        "Progression request requires a WorkoutBlueprint",
      );
    }
    if (!request.programming) {
      throw new ProgressionError(
        "missing_programming",
        "Progression request requires a ProgrammingResult",
      );
    }
    if (request.programming.prescriptions.length === 0) {
      throw new ProgressionError(
        "empty_programming",
        "Cannot progress an empty programming result",
        { programmingRequestId: request.programming.requestId },
      );
    }
  }

  private applyStrategies(
    progression: ExerciseProgression,
    context: ReturnType<typeof buildProgressionContext>,
  ): ExerciseProgression {
    let current = progression;
    for (const strategy of this.strategies) {
      current = strategy.apply(current, context);
    }
    return current;
  }

  private buildExplanations(
    progressions: readonly ExerciseProgression[],
  ): readonly ProgressionExplanation[] {
    return Object.freeze(
      progressions.map((progression) =>
        Object.freeze({
          exerciseId: progression.exerciseId,
          role: progression.role,
          prescriptionOrder: progression.prescriptionOrder,
          summaryCode: `progressed_as_${progression.role}`,
          reasons: progression.reasons,
          score: progression.score,
        }),
      ),
    );
  }

  private buildRequestId(programmingRequestId: string): string {
    return `progression:${programmingRequestId}`;
  }
}

/** Fixed timestamp keeps progression plans deterministic across runs. */
export const FIXED_PROGRESSION_TIMESTAMP = "2026-07-22T12:00:00.000Z";
