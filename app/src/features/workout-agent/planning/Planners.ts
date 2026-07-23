import type { WorkoutContext } from "../models/WorkoutContext";
import { EMPTY_WORKOUT_AGENT_METADATA } from "../models/WorkoutAgentMetadata";
import type { WorkoutPlanProposal } from "../models/WorkoutPlanProposal";
import type { WorkoutPlanningContext } from "../models/WorkoutPlanningContext";
import type { WorkoutPlanningResult } from "../models/WorkoutPlanningResult";
import type { WorkoutReasoning } from "../models/WorkoutReasoning";
import {
  labelFromScore,
  type WorkoutConfidence,
} from "../models/WorkoutConfidence";
import {
  freezePlanningContext,
  freezePlanningResult,
  freezeProposal,
} from "../utils/freezeAgentState";
import { computeTrainingMetrics } from "../utils/trainingMetrics";
import {
  progressionCueFor,
  shouldRecommendDeload,
} from "../utils/progressionHelpers";

export interface WorkoutPlanner {
  readonly id: string;
  plan(
    context: WorkoutContext,
    reasoning: readonly WorkoutReasoning[],
    clock: () => string,
  ): WorkoutPlanningResult;
}

function signal(
  reasoning: readonly WorkoutReasoning[],
  key: string,
  fallback: number,
): number {
  for (const r of reasoning) {
    if (typeof r.signals[key] === "number") return r.signals[key] as number;
  }
  return fallback;
}

function optionalSignal(
  reasoning: readonly WorkoutReasoning[],
  key: string,
): number | null {
  for (const r of reasoning) {
    if (typeof r.signals[key] === "number") return r.signals[key] as number;
  }
  return null;
}

function splitFromReasoning(reasoning: readonly WorkoutReasoning[]): string {
  const split = reasoning.find((r) => r.topic === "split");
  return split?.notes[0] ?? "full_body";
}

function confidenceFrom(score: number, rationale: string): WorkoutConfidence {
  return Object.freeze({
    score,
    label: labelFromScore(score),
    rationale,
  });
}

function buildProposal(input: {
  readonly planningContext: WorkoutPlanningContext;
  readonly context: WorkoutContext;
  readonly reasoning: readonly WorkoutReasoning[];
  readonly primaryLifts: readonly string[];
  readonly accessories: readonly string[];
  readonly clock: () => string;
}): WorkoutPlanProposal {
  const metrics = computeTrainingMetrics({
    daysPerWeek: input.context.daysPerWeek,
    objective: input.context.objective,
    experienceLevel: input.context.experienceLevel,
    recoveryFlag: input.planningContext.recoveryFlag,
  });
  const deload = shouldRecommendDeload(
    metrics.fatigueScore,
    input.planningContext.recoveryFlag,
  );
  const volumeScore =
    input.planningContext.volumeTarget ?? metrics.volumeScore;
  const intensityScore =
    input.planningContext.intensityTarget ?? metrics.intensityScore;

  return freezeProposal({
    id: `proposal:${input.planningContext.id}`,
    planningContextId: input.planningContext.id,
    objective: input.context.objective,
    strategyId: input.context.strategy?.id ?? null,
    split: input.planningContext.splitHint ?? splitFromReasoning(input.reasoning),
    daysPerWeek: input.context.daysPerWeek,
    primaryLifts: Object.freeze([...input.primaryLifts]),
    accessories: Object.freeze([...input.accessories]),
    volumeScore,
    intensityScore,
    progressionCue: progressionCueFor(input.context.objective, deload),
    deloadRecommended: deload,
    recoveryNotes: Object.freeze(
      deload
        ? ["Deload recommended based on fatigue/recovery signals."]
        : ([] as string[]),
    ),
    confidence: confidenceFrom(
      Math.min(0.95, 0.55 + volumeScore * 0.2 + intensityScore * 0.15),
      "Derived from deterministic training metrics.",
    ),
    rationale: Object.freeze(
      input.reasoning.flatMap((r) => r.findings).slice(0, 8),
    ),
    metadata: EMPTY_WORKOUT_AGENT_METADATA,
    createdAt: input.clock(),
  });
}

export class WorkoutPlannerImpl implements WorkoutPlanner {
  readonly id = "planner:workout";

  plan(
    context: WorkoutContext,
    reasoning: readonly WorkoutReasoning[],
    clock: () => string,
  ): WorkoutPlanningResult {
    const recoveryFlag =
      context.objective === "recovery" ||
      context.constraints.includes("needs_recovery") ||
      signal(reasoning, "recovery", 0) === 1;

    const planningContext = freezePlanningContext({
      id: `pctx:${context.id}`,
      contextId: context.id,
      objective: context.objective,
      strategyId: context.strategy?.id ?? null,
      reasoning,
      volumeTarget: optionalSignal(reasoning, "volume_target"),
      intensityTarget: optionalSignal(reasoning, "intensity_target"),
      frequencyTarget: context.daysPerWeek,
      splitHint: splitFromReasoning(reasoning),
      recoveryFlag,
      metadata: EMPTY_WORKOUT_AGENT_METADATA,
      frozenAt: clock(),
    });

    const proposal = buildProposal({
      planningContext,
      context,
      reasoning,
      primaryLifts: defaultPrimaries(context.objective),
      accessories: defaultAccessories(context.objective),
      clock,
    });

    return freezePlanningResult({
      id: `pres:${context.id}:workout`,
      planningContext,
      proposal,
      plannerIds: Object.freeze([this.id]),
      success: true,
      message: null,
      frozenAt: clock(),
    });
  }
}

export class ProgressionPlanner implements WorkoutPlanner {
  readonly id = "planner:progression";

  plan(
    context: WorkoutContext,
    reasoning: readonly WorkoutReasoning[],
    clock: () => string,
  ): WorkoutPlanningResult {
    const base = new WorkoutPlannerImpl().plan(context, reasoning, clock);
    const cue = progressionCueFor(
      context.objective,
      base.proposal.deloadRecommended,
    );
    const proposal = freezeProposal({
      ...base.proposal,
      id: `proposal:${base.planningContext.id}:progression`,
      progressionCue: cue,
      rationale: Object.freeze([
        ...base.proposal.rationale,
        `Progression planner: ${cue}`,
      ]),
    });
    return freezePlanningResult({
      ...base,
      id: `pres:${context.id}:progression`,
      proposal,
      plannerIds: Object.freeze([this.id]),
      frozenAt: clock(),
    });
  }
}

export class ExercisePlanner implements WorkoutPlanner {
  readonly id = "planner:exercise";

  plan(
    context: WorkoutContext,
    reasoning: readonly WorkoutReasoning[],
    clock: () => string,
  ): WorkoutPlanningResult {
    const base = new WorkoutPlannerImpl().plan(context, reasoning, clock);
    return freezePlanningResult({
      ...base,
      id: `pres:${context.id}:exercise`,
      plannerIds: Object.freeze([this.id]),
      frozenAt: clock(),
    });
  }
}

export class SplitPlanner implements WorkoutPlanner {
  readonly id = "planner:split";

  plan(
    context: WorkoutContext,
    reasoning: readonly WorkoutReasoning[],
    clock: () => string,
  ): WorkoutPlanningResult {
    const base = new WorkoutPlannerImpl().plan(context, reasoning, clock);
    const split = splitFromReasoning(reasoning);
    const proposal = freezeProposal({
      ...base.proposal,
      id: `proposal:${base.planningContext.id}:split`,
      split,
      rationale: Object.freeze([
        ...base.proposal.rationale,
        `Split planner selected ${split}.`,
      ]),
    });
    return freezePlanningResult({
      ...base,
      id: `pres:${context.id}:split`,
      proposal,
      plannerIds: Object.freeze([this.id]),
      frozenAt: clock(),
    });
  }
}

export class AccessoryPlanner implements WorkoutPlanner {
  readonly id = "planner:accessory";

  plan(
    context: WorkoutContext,
    reasoning: readonly WorkoutReasoning[],
    clock: () => string,
  ): WorkoutPlanningResult {
    const base = new WorkoutPlannerImpl().plan(context, reasoning, clock);
    const accessories = Object.freeze([
      ...base.proposal.accessories,
      ...extraAccessories(context.objective),
    ]);
    const proposal = freezeProposal({
      ...base.proposal,
      id: `proposal:${base.planningContext.id}:accessory`,
      accessories,
    });
    return freezePlanningResult({
      ...base,
      id: `pres:${context.id}:accessory`,
      proposal,
      plannerIds: Object.freeze([this.id]),
      frozenAt: clock(),
    });
  }
}

export class DeloadPlanner implements WorkoutPlanner {
  readonly id = "planner:deload";

  plan(
    context: WorkoutContext,
    reasoning: readonly WorkoutReasoning[],
    clock: () => string,
  ): WorkoutPlanningResult {
    const base = new WorkoutPlannerImpl().plan(context, reasoning, clock);
    const proposal = freezeProposal({
      ...base.proposal,
      id: `proposal:${base.planningContext.id}:deload`,
      deloadRecommended: true,
      intensityScore: Math.min(base.proposal.intensityScore, 0.45),
      volumeScore: Math.min(base.proposal.volumeScore, 0.45),
      progressionCue: progressionCueFor(context.objective, true),
      recoveryNotes: Object.freeze([
        "Deload planner: reduce volume and intensity for recovery.",
      ]),
    });
    return freezePlanningResult({
      ...base,
      id: `pres:${context.id}:deload`,
      proposal,
      plannerIds: Object.freeze([this.id]),
      frozenAt: clock(),
    });
  }
}

export class RecoveryPlanner implements WorkoutPlanner {
  readonly id = "planner:recovery";

  plan(
    context: WorkoutContext,
    reasoning: readonly WorkoutReasoning[],
    clock: () => string,
  ): WorkoutPlanningResult {
    return new DeloadPlanner().plan(context, reasoning, clock);
  }
}

function defaultPrimaries(objective: string): readonly string[] {
  if (objective === "powerlifting" || objective === "strength") {
    return Object.freeze(["squat", "bench_press", "deadlift"]);
  }
  if (objective === "hypertrophy" || objective === "powerbuilding") {
    return Object.freeze(["squat", "bench_press", "row", "overhead_press"]);
  }
  return Object.freeze(["squat", "push", "hinge", "pull"]);
}

function defaultAccessories(objective: string): readonly string[] {
  if (objective === "hypertrophy") {
    return Object.freeze(["lateral_raise", "leg_curl", "face_pull"]);
  }
  if (objective === "powerlifting") {
    return Object.freeze(["pause_squat", "close_grip_bench", "rdl"]);
  }
  return Object.freeze(["core", "rear_delt", "conditioning"]);
}

function extraAccessories(objective: string): readonly string[] {
  if (objective === "hypertrophy") {
    return Object.freeze(["bicep_curl", "tricep_extension"]);
  }
  return Object.freeze(["mobility"]);
}

export function createDefaultPlanners(): readonly WorkoutPlanner[] {
  return Object.freeze([
    new WorkoutPlannerImpl(),
    new ProgressionPlanner(),
    new ExercisePlanner(),
    new SplitPlanner(),
    new AccessoryPlanner(),
    new DeloadPlanner(),
    new RecoveryPlanner(),
  ]);
}
