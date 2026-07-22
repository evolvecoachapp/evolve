import type { ExerciseSelectionService } from "../../exercise-selection/services/ExerciseSelectionService";
import type { ProgrammingService } from "../../programming/services/ProgrammingService";
import type { ProgressionService } from "../../progression/services/ProgressionService";
import type { TrainingAdaptationService } from "../../training-adaptation/services/TrainingAdaptationService";
import type { WorkoutAssemblyService } from "../../workout-assembly/services/WorkoutAssemblyService";
import type { WorkoutBlueprintService } from "../../workout-blueprint/services/WorkoutBlueprintService";
import { ProgramGenerationError } from "../models/PipelineExecutionError";
import type { PipelineExecutionContext } from "../models/PipelineExecutionContext";
import type { PipelineExecutionStep } from "../models/PipelineExecutionStep";
import type { WorkoutGenerationExplanation } from "../models/WorkoutGenerationExplanation";
import type { WorkoutGenerationRequest } from "../models/WorkoutGenerationRequest";
import type { WorkoutGenerationResult } from "../models/WorkoutGenerationResult";
import {
  aggregateSummaries,
  buildExecutionContext,
  buildExecutionTrace,
  buildGenerationId,
  createFailedStep,
  createSucceededStep,
  FIXED_GENERATION_TIMESTAMP,
  freezeWorkoutGenerationResult,
  resolveAvailableEquipment,
} from "../utils";
import {
  validateWorkoutGenerationRequest,
  validateWorkoutGenerationResult,
} from "../validators";

/**
 * Injected engine services — orchestrator coordinates only; never owns engine logic.
 */
export interface ProgramGenerationDependencies {
  readonly blueprintService: WorkoutBlueprintService;
  readonly selectionService: ExerciseSelectionService;
  readonly programmingService: ProgrammingService;
  readonly progressionService: ProgressionService;
  readonly adaptationService: TrainingAdaptationService;
  readonly assemblyService: WorkoutAssemblyService;
}

/**
 * Program Generation Orchestrator.
 *
 * Single coordinator for the workout generation pipeline:
 * Validate → Context → Blueprint → Selection → Programming →
 * Progression → Training Adaptation → Workout Assembly → Freeze.
 *
 * Never duplicates engine business logic.
 * Never calls AI.
 * Never persists or caches.
 * Engines never call each other — only this orchestrator sequences them.
 */
export class ProgramGenerationOrchestrator {
  constructor(private readonly deps: ProgramGenerationDependencies) {}

  async generate(
    request: WorkoutGenerationRequest,
  ): Promise<WorkoutGenerationResult> {
    const steps: PipelineExecutionStep[] = [];

    // 1. Validate (before touching nested request fields)
    const requestIssues = validateWorkoutGenerationRequest(request);
    if (requestIssues.length > 0) {
      steps.push(
        createFailedStep("validate", steps.length, {
          code: "invalid_request",
          message: `Invalid workout generation request: ${requestIssues.join(",")}`,
          step: "validate",
          details: Object.freeze({ issues: requestIssues }),
        }),
      );
      throw new ProgramGenerationError(
        "invalid_request",
        `Invalid workout generation request: ${requestIssues.join(",")}`,
        { step: "validate", details: { issues: requestIssues } },
      );
    }

    const generationId = buildGenerationId(
      request.athleteContext,
      request.conversationContext,
      request.workflowContext,
    );
    steps.push(
      createSucceededStep("validate", steps.length, {
        validationIssues: requestIssues,
      }),
    );

    // 2. Create context
    let context = buildExecutionContext(request, generationId);
    steps.push(
      createSucceededStep("create_context", steps.length, {
        outputId: generationId,
      }),
    );

    try {
      // 3. Blueprint
      const blueprintResult = await this.deps.blueprintService.generate(
        request.blueprintSource,
        {
          athleteId: request.athleteContext.profile.id,
        },
      );
      const blueprint = blueprintResult.blueprint;
      context = Object.freeze({
        ...context,
        blueprintId: blueprint.id,
      });
      steps.push(
        createSucceededStep("blueprint", steps.length, {
          outputId: blueprint.id,
          validationIssues: blueprintResult.validationIssues,
        }),
      );

      // 4. Selection
      const selection = await this.deps.selectionService.selectExercises({
        blueprint,
        dayId: request.dayId,
        availableEquipment: resolveAvailableEquipment(request),
        maxDifficulty: request.maxDifficulty,
        excludedExerciseIds: request.excludedExerciseIds,
        includeExplanations: context.includeExplanations,
      });
      context = Object.freeze({
        ...context,
        dayId: selection.context.dayId,
        selectionRequestId: selection.requestId,
      });
      steps.push(
        createSucceededStep("selection", steps.length, {
          outputId: selection.requestId,
          validationIssues: selection.validationIssues,
        }),
      );

      // 5. Programming
      const programming = await this.deps.programmingService.programExercises({
        blueprint,
        selection,
        dayId: request.dayId,
        includeExplanations: context.includeExplanations,
      });
      context = Object.freeze({
        ...context,
        programmingRequestId: programming.requestId,
      });
      steps.push(
        createSucceededStep("programming", steps.length, {
          outputId: programming.requestId,
          validationIssues: programming.validationIssues,
        }),
      );

      // 6. Progression
      const progression = await this.deps.progressionService.generateProgression({
        blueprint,
        programming,
        window: request.progressionWindow,
        includeExplanations: context.includeExplanations,
      });
      context = Object.freeze({
        ...context,
        progressionRequestId: progression.requestId,
      });
      steps.push(
        createSucceededStep("progression", steps.length, {
          outputId: progression.requestId,
          validationIssues: progression.validationIssues,
        }),
      );

      // 7. Training Adaptation
      const adaptation =
        await this.deps.adaptationService.evaluateTrainingReadiness({
          blueprint,
          progression,
          includeExplanations: context.includeExplanations,
        });
      context = Object.freeze({
        ...context,
        adaptationRequestId: adaptation.requestId,
      });
      steps.push(
        createSucceededStep("training_adaptation", steps.length, {
          outputId: adaptation.requestId,
          validationIssues: adaptation.validationIssues,
        }),
      );

      // 8. Workout Assembly
      const assembly = await this.deps.assemblyService.assembleWorkout({
        blueprint,
        selection,
        programming,
        progression,
        adaptation,
        weekNumber: request.weekNumber,
        includeExplanations: context.includeExplanations,
      });
      context = Object.freeze({
        ...context,
        weekNumber: assembly.context.weekNumber,
        assemblyRequestId: assembly.requestId,
        sessionId: assembly.session.id,
      });
      steps.push(
        createSucceededStep("workout_assembly", steps.length, {
          outputId: assembly.requestId,
          validationIssues: assembly.validationIssues,
        }),
      );

      // 9. Freeze result
      const explanations = context.includeExplanations
        ? this.buildExplanations(context, steps)
        : Object.freeze([] as WorkoutGenerationExplanation[]);

      const engineValidationIssues = Object.freeze([
        ...blueprintResult.validationIssues,
        ...selection.validationIssues,
        ...programming.validationIssues,
        ...progression.validationIssues,
        ...adaptation.validationIssues,
        ...assembly.validationIssues,
      ]);

      const draft: WorkoutGenerationResult = {
        requestId: generationId,
        context,
        session: assembly.session,
        blueprint,
        selection,
        programming,
        progression,
        adaptation,
        assembly,
        summary: aggregateSummaries({
          generationId,
          steps,
          validationIssues: engineValidationIssues,
          explanationCount: explanations.length,
          engineOutputCount: 6,
        }),
        trace: buildExecutionTrace(generationId, steps),
        explanations,
        validationIssues: engineValidationIssues,
        generatedAt: FIXED_GENERATION_TIMESTAMP,
      };

      const pipelineIssues = validateWorkoutGenerationResult(draft, [
        ...steps,
        createSucceededStep("freeze_result", steps.length),
      ]);

      steps.push(
        createSucceededStep("freeze_result", steps.length, {
          outputId: generationId,
          validationIssues: pipelineIssues,
        }),
      );

      const allIssues = Object.freeze([
        ...new Set([...engineValidationIssues, ...pipelineIssues]),
      ]);

      const finalExplanations = context.includeExplanations
        ? this.buildExplanations(context, steps)
        : explanations;

      return freezeWorkoutGenerationResult({
        ...draft,
        context,
        summary: aggregateSummaries({
          generationId,
          steps,
          validationIssues: allIssues,
          explanationCount: finalExplanations.length,
          engineOutputCount: 6,
        }),
        trace: buildExecutionTrace(generationId, steps),
        explanations: finalExplanations,
        validationIssues: allIssues,
        generatedAt: FIXED_GENERATION_TIMESTAMP,
      });
    } catch (error) {
      if (error instanceof ProgramGenerationError) {
        throw error;
      }
      const failedStep = this.inferFailedStep(steps);
      steps.push(
        createFailedStep(failedStep, steps.length, {
          code: "pipeline_step_failed",
          message: error instanceof Error ? error.message : String(error),
          step: failedStep,
          details: Object.freeze({
            cause: error instanceof Error ? error.name : typeof error,
          }),
        }),
      );
      throw new ProgramGenerationError(
        "pipeline_step_failed",
        error instanceof Error ? error.message : String(error),
        {
          step: failedStep,
          details: {
            cause: error instanceof Error ? error.name : typeof error,
          },
        },
      );
    }
  }

  /**
   * Preview generation with explanations always enabled.
   */
  async preview(
    request: WorkoutGenerationRequest,
  ): Promise<WorkoutGenerationResult> {
    return this.generate({
      ...request,
      includeExplanations: true,
    });
  }

  /**
   * Return explanations for an in-hand generation result.
   */
  explain(
    result: WorkoutGenerationResult,
  ): readonly WorkoutGenerationExplanation[] {
    if (result.explanations.length > 0) {
      return result.explanations;
    }
    return this.buildExplanations(result.context, result.trace.steps);
  }

  private buildExplanations(
    context: PipelineExecutionContext,
    steps: readonly PipelineExecutionStep[],
  ): readonly WorkoutGenerationExplanation[] {
    return Object.freeze(
      steps.map((step) =>
        Object.freeze({
          subjectId: step.outputId ?? context.generationId,
          summaryCode: `orchestrate_${step.name}`,
          stepName: step.name,
          reasons: Object.freeze([
            Object.freeze({
              code: `step_${step.status}`,
              weight: step.status === "succeeded" ? 1 : 0,
              detail: step.outputId ?? undefined,
            }),
          ]),
          metrics: null,
        }),
      ),
    );
  }

  private inferFailedStep(
    steps: readonly PipelineExecutionStep[],
  ): PipelineExecutionStep["name"] {
    const completed = new Set(steps.map((step) => step.name));
    const order = [
      "blueprint",
      "selection",
      "programming",
      "progression",
      "training_adaptation",
      "workout_assembly",
      "freeze_result",
    ] as const;

    for (const name of order) {
      if (!completed.has(name)) {
        return name;
      }
    }
    return "freeze_result";
  }
}
