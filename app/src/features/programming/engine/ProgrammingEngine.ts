import type { ExercisePrescription } from "../models/ExercisePrescription";
import { ProgrammingError } from "../models/ProgrammingError";
import type { ProgrammingExplanation } from "../models/ProgrammingExplanation";
import type { ProgrammingRequest } from "../models/ProgrammingRequest";
import type { ProgrammingResult } from "../models/ProgrammingResult";
import type { ProgrammingStrategy } from "../strategies/ProgrammingStrategy";
import { createDefaultStrategies } from "../strategies";
import { buildProgrammingContext } from "../utils/buildProgrammingContext";
import { calculateProgrammingScore } from "../utils/calculateProgrammingScore";
import { estimateDuration } from "../utils/estimateDuration";
import { estimateFatigue } from "../utils/estimateFatigue";
import { freezePrescription, freezeProgrammingResult } from "../utils/freezeProgrammingResult";
import { normalizePrescription } from "../utils/normalizePrescription";
import { sortPrescriptions } from "../utils/sortPrescriptions";
import { validateProgrammingResult } from "../validators";

/**
 * Deterministic Programming Engine.
 *
 * Transforms Exercise Selection candidates into immutable training prescriptions.
 * Never progresses loads. Never adapts across weeks. Never assembles full workouts.
 * Only prescribes HOW each selected exercise should be executed.
 */
export class ProgrammingEngine {
  constructor(
    private readonly strategies: readonly ProgrammingStrategy[] = createDefaultStrategies(),
  ) {}

  async program(request: ProgrammingRequest): Promise<ProgrammingResult> {
    this.assertRequest(request);

    const context = buildProgrammingContext(request);
    const skeletons = request.selection.candidates.map(normalizePrescription);

    const programmed = skeletons.map((prescription) =>
      this.applyStrategies(prescription, context),
    );

    const withEstimates = programmed.map((prescription) =>
      this.applyEstimates(prescription),
    );

    const sorted = sortPrescriptions(withEstimates);
    const ordered = this.renumberOrder(sorted);

    const explanations = context.includeExplanations
      ? this.buildExplanations(ordered)
      : Object.freeze([] as ProgrammingExplanation[]);

    const validationIssues = validateProgrammingResult(request, ordered);
    const score = this.aggregateScore(ordered);

    return freezeProgrammingResult({
      requestId: this.buildRequestId(context.selectionRequestId),
      context,
      prescriptions: ordered,
      explanations,
      validationIssues,
      score,
      programmedAt: FIXED_PROGRAMMING_TIMESTAMP,
    });
  }

  /**
   * Preview prescriptions with explanations always enabled.
   */
  async preview(request: ProgrammingRequest): Promise<ProgrammingResult> {
    return this.program({
      ...request,
      includeExplanations: true,
    });
  }

  /**
   * Return explanations for a prior result (or rebuild from prescriptions).
   */
  explain(result: ProgrammingResult): readonly ProgrammingExplanation[] {
    if (result.explanations.length > 0) {
      return result.explanations;
    }
    return this.buildExplanations(result.prescriptions);
  }

  private assertRequest(request: ProgrammingRequest): void {
    if (!request.blueprint) {
      throw new ProgrammingError(
        "missing_blueprint",
        "Programming request requires a WorkoutBlueprint",
      );
    }
    if (!request.selection) {
      throw new ProgrammingError(
        "missing_selection",
        "Programming request requires an ExerciseSelectionResult",
      );
    }
    if (request.selection.candidates.length === 0) {
      throw new ProgrammingError(
        "empty_selection",
        "Cannot program an empty exercise selection",
        { selectionRequestId: request.selection.requestId },
      );
    }
  }

  private applyStrategies(
    prescription: ExercisePrescription,
    context: ReturnType<typeof buildProgrammingContext>,
  ): ExercisePrescription {
    let current = prescription;
    for (const strategy of this.strategies) {
      current = strategy.apply(current, context);
    }
    return current;
  }

  private applyEstimates(
    prescription: ExercisePrescription,
  ): ExercisePrescription {
    const withDuration = freezePrescription({
      ...prescription,
      fatigueEstimate: estimateFatigue(prescription),
      skillEstimate: prescription.exercise.difficulty.skillScore,
      estimatedDurationSeconds: estimateDuration(prescription),
    });
    return withDuration;
  }

  private renumberOrder(
    prescriptions: readonly ExercisePrescription[],
  ): readonly ExercisePrescription[] {
    return Object.freeze(
      prescriptions.map((prescription, index) =>
        freezePrescription({
          ...prescription,
          order: index + 1,
        }),
      ),
    );
  }

  private buildExplanations(
    prescriptions: readonly ExercisePrescription[],
  ): readonly ProgrammingExplanation[] {
    return Object.freeze(
      prescriptions.map((prescription) =>
        Object.freeze({
          exerciseId: prescription.exerciseId,
          role: prescription.role,
          order: prescription.order,
          summaryCode: `programmed_as_${prescription.role}`,
          reasons: prescription.reasons,
          score: prescription.score,
        }),
      ),
    );
  }

  private aggregateScore(
    prescriptions: readonly ExercisePrescription[],
  ): ReturnType<typeof calculateProgrammingScore> {
    if (prescriptions.length === 0) {
      return calculateProgrammingScore({});
    }

    const totals = prescriptions.reduce(
      (acc, prescription) => ({
        volume: acc.volume + prescription.score.volume,
        intensity: acc.intensity + prescription.score.intensity,
        rest: acc.rest + prescription.score.rest,
        tempo: acc.tempo + prescription.score.tempo,
        order: acc.order + prescription.score.order,
        priority: acc.priority + prescription.score.priority,
      }),
      {
        volume: 0,
        intensity: 0,
        rest: 0,
        tempo: 0,
        order: 0,
        priority: 0,
      },
    );

    const count = prescriptions.length;
    return calculateProgrammingScore({
      volume: Math.round((totals.volume / count) * 1000) / 1000,
      intensity: Math.round((totals.intensity / count) * 1000) / 1000,
      rest: Math.round((totals.rest / count) * 1000) / 1000,
      tempo: Math.round((totals.tempo / count) * 1000) / 1000,
      order: Math.round((totals.order / count) * 1000) / 1000,
      priority: Math.round((totals.priority / count) * 1000) / 1000,
    });
  }

  private buildRequestId(selectionRequestId: string): string {
    return `programming:${selectionRequestId}`;
  }
}

/** Fixed timestamp keeps programming results deterministic across runs. */
export const FIXED_PROGRAMMING_TIMESTAMP = "2026-07-22T12:00:00.000Z";
