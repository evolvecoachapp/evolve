import type { ExerciseSelectionResult } from "../../../features/exercise-selection/models/ExerciseSelectionResult";
import type { ProgrammingResult } from "../../../features/programming/models/ProgrammingResult";
import type { ProgressionPlan } from "../../../features/progression/models/ProgressionPlan";
import type { TrainingAdaptationResult } from "../../../features/training-adaptation/models/TrainingAdaptationResult";
import type { WorkoutAssemblyResult } from "../../../features/workout-assembly/models/WorkoutAssemblyResult";
import type { WorkoutBlueprint } from "../../../features/workout-blueprint/models/WorkoutBlueprint";
import type { PipelineExecutionContext } from "../../../features/program-generation/models/PipelineExecutionContext";
import type { PipelineExecutionSummary } from "../../../features/program-generation/models/PipelineExecutionSummary";
import type { PipelineExecutionTrace } from "../../../features/program-generation/models/PipelineExecutionTrace";
import type { WorkoutGenerationResult } from "../../../features/program-generation/models/WorkoutGenerationResult";
import type { DecisionCategory } from "../models/DecisionCategory";
import type { DecisionContext } from "../models/DecisionContext";
import type { DecisionGraph } from "../models/DecisionGraph";
import type { DecisionReason } from "../models/DecisionReason";
import { DecisionRecorder } from "../recorder/DecisionRecorder";

function mapReasons(
  reasons: readonly { readonly code: string; readonly weight: number; readonly detail?: string }[],
): readonly DecisionReason[] {
  return Object.freeze(
    reasons.map((reason) =>
      Object.freeze({
        code: reason.code,
        weight: reason.weight,
        detail: reason.detail,
      }),
    ),
  );
}

function confidenceFromWeights(
  reasons: readonly { readonly weight: number }[],
): number {
  if (reasons.length === 0) {
    return 1;
  }
  const sum = reasons.reduce((acc, reason) => acc + Math.abs(reason.weight), 0);
  if (sum <= 0) {
    return 0.5;
  }
  // Normalize typical strategy weights into [0.5, 1]
  return Math.min(1, Math.max(0.5, Number((0.5 + Math.min(sum, 1) / 2).toFixed(4))));
}

function baseContext(
  generationId: string,
  category: DecisionCategory,
  pipelineStep: string,
  ctx: PipelineExecutionContext,
  subjectId: string | null,
): DecisionContext {
  return Object.freeze({
    generationId,
    stage: category,
    pipelineStep,
    athleteId: ctx.athleteId,
    dayId: ctx.dayId,
    weekNumber: ctx.weekNumber,
    subjectId,
  });
}

export interface PipelineDecisionSource {
  readonly generationId: string;
  readonly context: PipelineExecutionContext;
  readonly blueprint: WorkoutBlueprint;
  readonly selection: ExerciseSelectionResult;
  readonly programming: ProgrammingResult;
  readonly progression: ProgressionPlan;
  readonly adaptation: TrainingAdaptationResult;
  readonly assembly: WorkoutAssemblyResult;
  readonly summary: PipelineExecutionSummary;
  readonly trace: PipelineExecutionTrace;
}

/**
 * Extract domain decisions from existing engine outputs.
 * Does not change engine logic — only reads structured explanations/reasons.
 */
export function recordPipelineDecisions(
  source: PipelineDecisionSource,
): DecisionGraph {
  const recorder = new DecisionRecorder(source.generationId);
  const ctx = source.context;

  const orchestrationId = `decision:orchestration:${source.generationId}`;
  recorder.record({
    id: orchestrationId,
    category: "orchestration",
    summaryCode: "pipeline_coordinated",
    title: "Program generation pipeline coordinated",
    severity: "info",
    confidence: 1,
    reasons: Object.freeze([
      Object.freeze({
        code: `status_${source.summary.status}`,
        weight: source.summary.status === "succeeded" ? 1 : 0.25,
        detail: source.summary.failedStep ?? undefined,
      }),
    ]),
    evidence: Object.freeze([
      Object.freeze({
        code: "completed_steps",
        source: "pipeline_summary",
        value: source.summary.completedSteps.length,
      }),
      Object.freeze({
        code: "engine_outputs",
        source: "pipeline_metrics",
        value: source.summary.metrics.engineOutputCount,
      }),
    ]),
    context: baseContext(
      source.generationId,
      "orchestration",
      "create_context",
      ctx,
      source.generationId,
    ),
    metadata: Object.freeze({
      tags: Object.freeze(["pipeline"]),
      attributes: Object.freeze({
        status: source.summary.status,
      }),
    }),
  });

  const blueprintId = `decision:blueprint:${source.blueprint.id}`;
  recorder.record({
    id: blueprintId,
    category: "blueprint",
    summaryCode: "blueprint_selected",
    title: "Workout blueprint established",
    severity: "medium",
    confidence: 1,
    reasons: Object.freeze([
      Object.freeze({
        code: "blueprint_structure",
        weight: 1,
        detail: source.blueprint.id,
      }),
    ]),
    evidence: Object.freeze([
      Object.freeze({
        code: "blueprint_id",
        source: "blueprint",
        value: source.blueprint.id,
      }),
    ]),
    context: baseContext(
      source.generationId,
      "blueprint",
      "blueprint",
      ctx,
      source.blueprint.id,
    ),
    parentIds: Object.freeze([orchestrationId]),
    metadata: Object.freeze({
      tags: Object.freeze(["blueprint"]),
      attributes: Object.freeze({}),
    }),
  });

  let previousStageRoot = blueprintId;

  // Selection decisions
  const selectionRoot = `decision:selection:${source.selection.requestId}`;
  recorder.record({
    id: selectionRoot,
    category: "selection",
    summaryCode: "exercises_selected",
    title: "Exercise selection completed",
    severity: "medium",
    confidence: 1,
    reasons: Object.freeze([
      Object.freeze({
        code: "candidate_count",
        weight: 1,
        detail: String(source.selection.candidates.length),
      }),
    ]),
    evidence: Object.freeze([
      Object.freeze({
        code: "selected_count",
        source: "selection",
        value: source.selection.candidates.length,
      }),
      Object.freeze({
        code: "rejected_count",
        source: "selection",
        value: source.selection.rejected.length,
      }),
    ]),
    context: baseContext(
      source.generationId,
      "selection",
      "selection",
      ctx,
      source.selection.requestId,
    ),
    parentIds: Object.freeze([previousStageRoot]),
    metadata: Object.freeze({
      tags: Object.freeze(["selection"]),
      attributes: Object.freeze({}),
    }),
  });

  for (const explanation of source.selection.explanations) {
    recorder.record({
      id: `decision:selection:item:${explanation.exerciseId}:${explanation.role}`,
      category: "selection",
      summaryCode: explanation.summaryCode,
      title: `Selected ${explanation.exerciseId} as ${explanation.role}`,
      severity: "low",
      confidence: confidenceFromWeights(explanation.reasons),
      reasons: mapReasons(explanation.reasons),
      evidence: Object.freeze([
        Object.freeze({
          code: "total_score",
          source: "selection_score",
          value: explanation.score.total,
        }),
      ]),
      context: baseContext(
        source.generationId,
        "selection",
        "selection",
        ctx,
        explanation.exerciseId,
      ),
      parentIds: Object.freeze([selectionRoot]),
      metadata: Object.freeze({
        tags: Object.freeze(["selection", explanation.role]),
        attributes: Object.freeze({ role: explanation.role }),
      }),
    });
  }
  previousStageRoot = selectionRoot;

  // Programming
  const programmingRoot = `decision:programming:${source.programming.requestId}`;
  recorder.record({
    id: programmingRoot,
    category: "programming",
    summaryCode: "prescriptions_programmed",
    title: "Exercise programming completed",
    severity: "medium",
    confidence: 1,
    reasons: Object.freeze([
      Object.freeze({
        code: "prescription_count",
        weight: 1,
        detail: String(source.programming.prescriptions.length),
      }),
    ]),
    evidence: Object.freeze([
      Object.freeze({
        code: "prescription_count",
        source: "programming",
        value: source.programming.prescriptions.length,
      }),
    ]),
    context: baseContext(
      source.generationId,
      "programming",
      "programming",
      ctx,
      source.programming.requestId,
    ),
    parentIds: Object.freeze([previousStageRoot]),
    metadata: Object.freeze({
      tags: Object.freeze(["programming"]),
      attributes: Object.freeze({}),
    }),
  });

  for (const explanation of source.programming.explanations) {
    recorder.record({
      id: `decision:programming:item:${explanation.exerciseId}:${explanation.order}`,
      category: "programming",
      summaryCode: explanation.summaryCode,
      title: `Programmed ${explanation.exerciseId}`,
      severity: "low",
      confidence: confidenceFromWeights(explanation.reasons),
      reasons: mapReasons(explanation.reasons),
      evidence: Object.freeze([
        Object.freeze({
          code: "order",
          source: "programming",
          value: explanation.order,
        }),
      ]),
      context: baseContext(
        source.generationId,
        "programming",
        "programming",
        ctx,
        explanation.exerciseId,
      ),
      parentIds: Object.freeze([programmingRoot]),
      metadata: Object.freeze({
        tags: Object.freeze(["programming", explanation.role]),
        attributes: Object.freeze({
          role: explanation.role,
          order: explanation.order,
        }),
      }),
    });
  }
  previousStageRoot = programmingRoot;

  // Progression
  const progressionRoot = `decision:progression:${source.progression.requestId}`;
  recorder.record({
    id: progressionRoot,
    category: "progression",
    summaryCode: "progression_planned",
    title: "Progression plan generated",
    severity: "medium",
    confidence: 1,
    reasons: Object.freeze([
      Object.freeze({
        code: "exercise_progression_count",
        weight: 1,
        detail: String(source.progression.exerciseProgressions.length),
      }),
    ]),
    evidence: Object.freeze([
      Object.freeze({
        code: "exercise_count",
        source: "progression",
        value: source.progression.exerciseProgressions.length,
      }),
    ]),
    context: baseContext(
      source.generationId,
      "progression",
      "progression",
      ctx,
      source.progression.requestId,
    ),
    parentIds: Object.freeze([previousStageRoot]),
    metadata: Object.freeze({
      tags: Object.freeze(["progression"]),
      attributes: Object.freeze({}),
    }),
  });

  for (const explanation of source.progression.explanations) {
    recorder.record({
      id: `decision:progression:item:${explanation.exerciseId}:${explanation.prescriptionOrder}`,
      category: "progression",
      summaryCode: explanation.summaryCode,
      title: `Progressed ${explanation.exerciseId}`,
      severity: "low",
      confidence: confidenceFromWeights(explanation.reasons),
      reasons: mapReasons(explanation.reasons),
      evidence: Object.freeze([
        Object.freeze({
          code: "prescription_order",
          source: "progression",
          value: explanation.prescriptionOrder,
        }),
      ]),
      context: baseContext(
        source.generationId,
        "progression",
        "progression",
        ctx,
        explanation.exerciseId,
      ),
      parentIds: Object.freeze([progressionRoot]),
      metadata: Object.freeze({
        tags: Object.freeze(["progression", explanation.role]),
        attributes: Object.freeze({ role: explanation.role }),
      }),
    });
  }
  previousStageRoot = progressionRoot;

  // Adaptation
  const adaptationRoot = `decision:adaptation:${source.adaptation.requestId}`;
  recorder.record({
    id: adaptationRoot,
    category: "adaptation",
    summaryCode: "adaptation_evaluated",
    title: "Training adaptation evaluated",
    severity: "medium",
    confidence: 1,
    reasons: Object.freeze([
      Object.freeze({
        code: "recommendation_count",
        weight: 1,
        detail: String(source.adaptation.recommendations.length),
      }),
    ]),
    evidence: Object.freeze([
      Object.freeze({
        code: "recommendation_count",
        source: "adaptation",
        value: source.adaptation.recommendations.length,
      }),
    ]),
    context: baseContext(
      source.generationId,
      "adaptation",
      "training_adaptation",
      ctx,
      source.adaptation.requestId,
    ),
    parentIds: Object.freeze([previousStageRoot]),
    metadata: Object.freeze({
      tags: Object.freeze(["adaptation"]),
      attributes: Object.freeze({}),
    }),
  });

  for (const explanation of source.adaptation.explanations) {
    recorder.record({
      id: `decision:adaptation:item:${explanation.recommendationId}`,
      category: "adaptation",
      summaryCode: explanation.summaryCode,
      title: `Adaptation ${explanation.recommendationId}`,
      severity: "medium",
      confidence: confidenceFromWeights(explanation.reasons),
      reasons: mapReasons(explanation.reasons),
      evidence: Object.freeze([
        Object.freeze({
          code: "score_total",
          source: "adaptation_score",
          value: explanation.score.total,
        }),
      ]),
      context: baseContext(
        source.generationId,
        "adaptation",
        "training_adaptation",
        ctx,
        explanation.recommendationId,
      ),
      parentIds: Object.freeze([adaptationRoot]),
      metadata: Object.freeze({
        tags: Object.freeze(["adaptation"]),
        attributes: Object.freeze({}),
      }),
    });
  }
  previousStageRoot = adaptationRoot;

  // Assembly
  const assemblyRoot = `decision:assembly:${source.assembly.requestId}`;
  recorder.record({
    id: assemblyRoot,
    category: "assembly",
    summaryCode: "workout_assembled",
    title: "Workout session assembled",
    severity: "high",
    confidence: 1,
    reasons: Object.freeze([
      Object.freeze({
        code: "session_assembled",
        weight: 1,
        detail: source.assembly.session.id,
      }),
    ]),
    evidence: Object.freeze([
      Object.freeze({
        code: "exercise_count",
        source: "assembly",
        value: source.assembly.session.exercises.length,
      }),
    ]),
    context: baseContext(
      source.generationId,
      "assembly",
      "workout_assembly",
      ctx,
      source.assembly.requestId,
    ),
    parentIds: Object.freeze([previousStageRoot]),
    metadata: Object.freeze({
      tags: Object.freeze(["assembly"]),
      attributes: Object.freeze({
        sessionId: source.assembly.session.id,
      }),
    }),
  });

  for (const explanation of source.assembly.explanations) {
    recorder.record({
      id: `decision:assembly:item:${explanation.subjectId}`,
      category: "assembly",
      summaryCode: explanation.summaryCode,
      title: `Assembled ${explanation.subjectId}`,
      severity: "low",
      confidence: confidenceFromWeights(explanation.reasons),
      reasons: mapReasons(explanation.reasons),
      evidence: Object.freeze([
        Object.freeze({
          code: "score_total",
          source: "assembly_score",
          value: explanation.score.total,
        }),
      ]),
      context: baseContext(
        source.generationId,
        "assembly",
        "workout_assembly",
        ctx,
        explanation.subjectId,
      ),
      parentIds: Object.freeze([assemblyRoot]),
      metadata: Object.freeze({
        tags: Object.freeze(["assembly"]),
        attributes: Object.freeze({}),
      }),
    });
  }

  // Validation issues as domain decisions when present
  for (const [index, issue] of source.summary.validationIssues.entries()) {
    recorder.record({
      id: `decision:validation:${index}`,
      category: "validation",
      summaryCode: "validation_issue",
      title: "Pipeline validation issue noted",
      severity: "medium",
      confidence: 1,
      reasons: Object.freeze([
        Object.freeze({ code: "validation_issue", weight: 1, detail: issue }),
      ]),
      evidence: Object.freeze([
        Object.freeze({
          code: "issue",
          source: "pipeline_validation",
          value: issue,
        }),
      ]),
      context: baseContext(
        source.generationId,
        "validation",
        "freeze_result",
        ctx,
        issue,
      ),
      parentIds: Object.freeze([orchestrationId]),
      metadata: Object.freeze({
        tags: Object.freeze(["validation"]),
        attributes: Object.freeze({}),
      }),
    });
  }

  // Sequence edges across pipeline stages from trace
  const stageRoots = [
    blueprintId,
    selectionRoot,
    programmingRoot,
    progressionRoot,
    adaptationRoot,
    assemblyRoot,
  ];
  for (let i = 0; i < stageRoots.length - 1; i += 1) {
    recorder.link(stageRoots[i]!, stageRoots[i + 1]!, "sequence", "pipeline_order");
  }

  return recorder.buildGraph();
}

export function toPipelineDecisionSource(
  result: WorkoutGenerationResult,
): PipelineDecisionSource {
  return {
    generationId: result.requestId,
    context: result.context,
    blueprint: result.blueprint,
    selection: result.selection,
    programming: result.programming,
    progression: result.progression,
    adaptation: result.adaptation,
    assembly: result.assembly,
    summary: result.summary,
    trace: result.trace,
  };
}
