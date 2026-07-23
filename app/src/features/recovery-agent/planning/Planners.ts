import type { RecoveryContext } from "../models/RecoveryContext";
import { EMPTY_RECOVERY_AGENT_METADATA } from "../models/RecoveryMetadata";
import type {
  RecoveryPlan,
  RecoveryProtocolHint,
} from "../models/RecoveryPlan";
import type { RecoveryPlanningContext } from "../models/RecoveryPlanningContext";
import type { RecoveryPlanningResult } from "../models/RecoveryPlanningResult";
import type { RecoveryReasoning } from "../models/RecoveryReasoning";
import type { RecoveryAssessment } from "../models/RecoveryAssessment";
import {
  labelFromScore,
  type RecoveryConfidence,
} from "../models/RecoveryConfidence";
import {
  freezePlanningContext,
  freezePlanningResult,
  freezePlan,
  freezeAssessment,
} from "../utils/FreezeRecoveryState";
import {
  buildDeloadRecommendation,
  computeRecoveryScore,
  buildReadinessState,
} from "../utils/RecoveryHelpers";
import { buildFatigueState } from "../utils/FatigueHelpers";
import { buildSleepProfile } from "../utils/SleepHelpers";
import { buildStressProfile } from "../utils/StressHelpers";
import { buildTrainingLoad } from "../utils/TrainingLoadHelpers";

export interface RecoveryPlanner {
  readonly id: string;
  plan(
    context: RecoveryContext,
    reasoning: readonly RecoveryReasoning[],
    clock: () => string,
  ): RecoveryPlanningResult;
}

function signal(
  reasoning: readonly RecoveryReasoning[],
  key: string,
  fallback: number,
): number {
  for (const r of reasoning) {
    if (typeof r.signals[key] === "number") return r.signals[key] as number;
  }
  return fallback;
}

function confidenceFrom(score: number, rationale: string): RecoveryConfidence {
  return Object.freeze({
    score,
    label: labelFromScore(score),
    rationale,
  });
}

function protocolForGoal(goal: string): RecoveryProtocolHint {
  switch (goal) {
    case "full_recovery":
      return "rest";
    case "active_recovery":
      return "active";
    case "sleep_optimization":
      return "sleep_focus";
    case "stress_reduction":
      return "stress_focus";
    case "fatigue_management":
      return "deload";
    default:
      return "mixed";
  }
}

function buildAssessment(input: {
  readonly context: RecoveryContext;
  readonly reasoning: readonly RecoveryReasoning[];
  readonly clock: () => string;
}): RecoveryAssessment {
  const recoveryScoreValue = signal(
    input.reasoning,
    "recovery_score",
    input.context.indicators.recoveryScore,
  );
  const readiness = signal(
    input.reasoning,
    "readiness_score",
    input.context.readiness.score,
  );
  const fatigue = signal(
    input.reasoning,
    "fatigue_level",
    input.context.fatigue.level,
  );
  const sleepQuality = signal(
    input.reasoning,
    "sleep_quality",
    input.context.sleep.quality,
  );
  const sleepHours = signal(
    input.reasoning,
    "sleep_hours",
    input.context.sleep.hours,
  );
  const stress = signal(
    input.reasoning,
    "stress_level",
    input.context.stress.level,
  );
  const load = signal(
    input.reasoning,
    "training_load",
    input.context.trainingLoad.score,
  );
  const soreness = signal(
    input.reasoning,
    "soreness_level",
    input.context.indicators.sorenessLevel,
  );
  const hrvRaw = signal(
    input.reasoning,
    "hrv_score",
    input.context.indicators.hrvScore ?? readiness,
  );
  const recoveryScore = computeRecoveryScore({
    sleepQuality,
    stressLevel: stress,
    fatigueLevel: fatigue,
    sorenessLevel: soreness,
    readinessScore: readiness,
    trainingLoadScore: load,
    hrvScore: hrvRaw,
  });
  const deload = buildDeloadRecommendation({
    recoveryScore: recoveryScore.score,
    fatigueLevel: fatigue,
    trainingLoadScore: load,
    avoidDeload: input.context.constraints.avoidDeload,
  });
  const confidenceScore =
    0.55 +
    (signal(input.reasoning, "goal_known", 0) === 1 ? 0.2 : 0) +
    (signal(input.reasoning, "hrv_present", 0) === 1 ? 0.1 : 0);
  return freezeAssessment({
    id: `rassess:${input.context.id}`,
    recoveryScore,
    readiness: buildReadinessState(readiness),
    fatigue: buildFatigueState(fatigue),
    sleep: buildSleepProfile(sleepHours, sleepQuality),
    stress: buildStressProfile(stress),
    trainingLoad: buildTrainingLoad(load),
    indicators: Object.freeze({
      sleepQuality,
      stressLevel: stress,
      fatigueLevel: fatigue,
      sorenessLevel: soreness,
      hrvScore: input.context.indicators.hrvScore,
      readinessScore: readiness,
      trainingLoadScore: load,
      recoveryScore: recoveryScoreValue,
    }),
    deload,
    confidence: confidenceFrom(
      Math.min(0.95, confidenceScore),
      "Deterministic recovery assessment from indicators.",
    ),
    summary: `Recovery ${recoveryScore.label} (${recoveryScore.score}); readiness ${readiness}.`,
    assessedAt: input.clock(),
  });
}

function buildBasePlan(input: {
  readonly planningContext: RecoveryPlanningContext;
  readonly context: RecoveryContext;
  readonly reasoning: readonly RecoveryReasoning[];
  readonly protocolHint: RecoveryProtocolHint;
  readonly clock: () => string;
}): RecoveryPlan {
  const assessment = buildAssessment({
    context: input.context,
    reasoning: input.reasoning,
    clock: input.clock,
  });
  const recoveryTarget =
    input.planningContext.recoveryScoreTarget ??
    Math.min(100, assessment.recoveryScore.score + 15);
  const readinessTarget =
    input.planningContext.readinessTarget ??
    Math.min(100, assessment.readiness.score + 10);
  return freezePlan({
    id: `rplan:${input.planningContext.id}`,
    planningContextId: input.planningContext.id,
    goal: input.context.goal,
    strategyId: input.context.strategy?.id ?? null,
    protocolHint: input.protocolHint,
    recoveryScoreTarget: recoveryTarget,
    readinessTarget,
    sleepHoursTarget: Math.max(7, assessment.sleep.hours),
    sleepQualityTarget: Math.min(100, assessment.sleep.quality + 10),
    stressCeiling: Math.max(20, assessment.stress.level - 10),
    fatigueCeiling: Math.max(20, assessment.fatigue.level - 10),
    deloadRecommendation: assessment.deload,
    assessment,
    sessionNotes: Object.freeze([
      `Protocol: ${input.protocolHint}`,
      assessment.summary,
    ]),
    confidence: assessment.confidence,
    rationale: Object.freeze([
      `Goal: ${input.context.goal}`,
      `Strategy: ${input.context.strategy?.name ?? "none"}`,
      assessment.deload.recommended
        ? `Deload: ${assessment.deload.intensity}`
        : "No deload required",
    ]),
    metadata: EMPTY_RECOVERY_AGENT_METADATA,
    createdAt: input.clock(),
  });
}

class RecoveryPlannerImpl implements RecoveryPlanner {
  readonly id = "planner:recovery:recovery";

  plan(
    context: RecoveryContext,
    reasoning: readonly RecoveryReasoning[],
    clock: () => string,
  ): RecoveryPlanningResult {
    const protocolHint = protocolForGoal(context.goal);
    const planningContext = freezePlanningContext({
      id: `rpctx:${context.id}`,
      contextId: context.id,
      goal: context.goal,
      protocolHint,
      recoveryScoreTarget: null,
      readinessTarget: null,
      constraints: Object.freeze([...context.constraints.notes]),
      createdAt: clock(),
    });
    const plan = buildBasePlan({
      planningContext,
      context,
      reasoning,
      protocolHint,
      clock,
    });
    return freezePlanningResult({
      planningContext,
      plan,
      plannerIds: Object.freeze([this.id]),
      notes: Object.freeze(["Base recovery planner"]),
    });
  }
}

function wrapPlanner(
  id: string,
  transform: (plan: RecoveryPlan) => RecoveryPlan,
): RecoveryPlanner {
  const base = new RecoveryPlannerImpl();
  return {
    id,
    plan(context, reasoning, clock) {
      const result = base.plan(context, reasoning, clock);
      const plan = freezePlan(transform(result.plan));
      return freezePlanningResult({
        ...result,
        plan,
        plannerIds: Object.freeze([id]),
        notes: Object.freeze([`Specialized planner ${id}`]),
      });
    },
  };
}

export const DeloadPlanner = wrapPlanner(
  "planner:recovery:deload",
  (plan) => ({
    ...plan,
    protocolHint: "deload",
    deloadRecommendation: Object.freeze({
      ...plan.deloadRecommendation,
      recommended: true,
      intensity:
        plan.deloadRecommendation.intensity === "none"
          ? "moderate"
          : plan.deloadRecommendation.intensity,
      durationDays: Math.max(3, plan.deloadRecommendation.durationDays),
    }),
  }),
);

export const SleepPlanner = wrapPlanner("planner:recovery:sleep", (plan) => ({
  ...plan,
  protocolHint: "sleep_focus",
  sleepHoursTarget: Math.max(8, plan.sleepHoursTarget),
  sleepQualityTarget: Math.max(75, plan.sleepQualityTarget),
}));

export const StressPlanner = wrapPlanner(
  "planner:recovery:stress",
  (plan) => ({
    ...plan,
    protocolHint: "stress_focus",
    stressCeiling: Math.min(40, plan.stressCeiling),
  }),
);

export const ReadinessPlanner = wrapPlanner(
  "planner:recovery:readiness",
  (plan) => ({
    ...plan,
    readinessTarget: Math.max(70, plan.readinessTarget),
  }),
);

export const RecoverySessionPlanner = wrapPlanner(
  "planner:recovery:session",
  (plan) => ({
    ...plan,
    sessionNotes: Object.freeze([
      ...plan.sessionNotes,
      "Structure a short recovery-focused session.",
    ]),
  }),
);

export const TrainingLoadPlanner = wrapPlanner(
  "planner:recovery:training_load",
  (plan) => ({
    ...plan,
    rationale: Object.freeze([
      ...plan.rationale,
      "Modulate training load for recovery tolerance.",
    ]),
  }),
);

export const FatiguePlanner = wrapPlanner(
  "planner:recovery:fatigue",
  (plan) => ({
    ...plan,
    fatigueCeiling: Math.min(45, plan.fatigueCeiling),
    protocolHint: plan.protocolHint === "mixed" ? "rest" : plan.protocolHint,
  }),
);

export const WellnessPlanner = wrapPlanner(
  "planner:recovery:wellness",
  (plan) => ({
    ...plan,
    protocolHint: "mixed",
  }),
);

export const RecoveryProtocolPlanner = wrapPlanner(
  "planner:recovery:protocol",
  (plan) => ({
    ...plan,
    sessionNotes: Object.freeze([
      ...plan.sessionNotes,
      `Apply ${plan.protocolHint} protocol.`,
    ]),
  }),
);

export function createDefaultPlanners(): readonly RecoveryPlanner[] {
  return Object.freeze([
    new RecoveryPlannerImpl(),
    DeloadPlanner,
    SleepPlanner,
    StressPlanner,
    ReadinessPlanner,
    RecoverySessionPlanner,
    TrainingLoadPlanner,
    FatiguePlanner,
    WellnessPlanner,
    RecoveryProtocolPlanner,
  ]);
}
