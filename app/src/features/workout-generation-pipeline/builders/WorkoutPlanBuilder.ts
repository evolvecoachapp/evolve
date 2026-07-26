import type { WorkoutSession } from "../../workout-assembly/models/WorkoutSession";
import type { WorkoutPlanProposal } from "../../workout-agent/models/WorkoutPlanProposal";
import type { WorkoutGenerationResult } from "../../program-generation/models/WorkoutGenerationResult";
import type { UnifiedCoachingContext } from "../../context-fusion/models/UnifiedCoachingContext";
import type { DecisionPackage } from "../../decision-engine/models/DecisionPackage";
import type { RecommendationPackage } from "../../recommendation-engine/models/RecommendationPackage";
import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import type { WorkoutDay } from "../models/WorkoutDay";
import type { WorkoutPlan } from "../models/WorkoutPlan";
import type { WorkoutPlanMetadata } from "../models/WorkoutPlanMetadata";
import type { WorkoutTarget } from "../models/WorkoutTarget";
import type { WorkoutWeek } from "../models/WorkoutWeek";
import { EMPTY_PLAN_METADATA, PIPELINE_VERSION } from "../models";

export function buildTargetsFromSession(
  session: WorkoutSession,
): readonly WorkoutTarget[] {
  const targets: WorkoutTarget[] = [];
  for (const exercise of session.exercises) {
    for (const set of exercise.sets) {
      targets.push(
        Object.freeze({
          id: `target:${exercise.id}:${set.setIndex}`,
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.name,
          setIndex: set.setIndex,
          repMin: set.repMin,
          repMax: set.repMax,
          targetRpe: set.targetRpe,
          targetRir: set.targetRir,
          intensityMetric: exercise.intensityMetric,
          intensityValue: exercise.intensityValue,
        }),
      );
    }
  }
  return Object.freeze(targets);
}

export function buildWorkoutPlan(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly proposal: WorkoutPlanProposal;
  readonly generation: WorkoutGenerationResult;
  readonly unifiedContext: UnifiedCoachingContext | null;
  readonly decisionPackage: DecisionPackage | null;
  readonly recommendationPackage: RecommendationPackage | null;
  readonly decisions: readonly CoachingDecision[];
  readonly recommendations: readonly CoachingRecommendation[];
  readonly metadata?: WorkoutPlanMetadata;
  readonly at: string;
}): WorkoutPlan {
  const session = input.generation.session;
  const targets = buildTargetsFromSession(session);
  const day: WorkoutDay = Object.freeze({
    id: `day:${session.dayId}`,
    dayNumber: session.dayIndex + 1,
    label: session.name,
    focus: String(session.focus),
    isRestDay: false,
    estimatedDurationSeconds: session.estimatedDurationSeconds,
    session,
  });
  const week: WorkoutWeek = Object.freeze({
    id: `week:${session.weekNumber}`,
    weekNumber: session.weekNumber,
    label: `Week ${session.weekNumber}`,
    theme: String(session.focus),
    days: Object.freeze([day]),
  });

  const recommendationIds = Object.freeze(
    input.recommendations.map((item) => item.id),
  );
  const focusAreas = Object.freeze([
    ...(input.decisionPackage?.summary?.focusAreas ?? []),
  ]);

  return Object.freeze({
    id: input.id,
    athleteId: input.athleteId,
    sessionId: input.sessionId,
    conversationId: input.conversationId,
    contextId: input.contextId,
    decisionPackageId: input.decisionPackage?.id ?? null,
    recommendationPackageId: input.recommendationPackage?.id ?? null,
    name: session.name,
    proposal: input.proposal,
    primarySession: session,
    weeks: Object.freeze([week]),
    objectives: Object.freeze({
      primary: input.proposal.objective,
      secondary: Object.freeze([...input.proposal.rationale.slice(0, 3)]),
      goalKeys: focusAreas,
      focusAreas,
    }),
    constraints: Object.freeze({
      athleteConstraints: Object.freeze([...input.proposal.recoveryNotes]),
      availability: Object.freeze([
        `days_per_week:${input.proposal.daysPerWeek}`,
      ]),
      recoveryConstraints: Object.freeze([
        ...(input.proposal.deloadRecommended
          ? (["deload_recommended"] as const)
          : []),
      ]),
      equipment: Object.freeze([] as string[]),
      excludedExerciseIds: Object.freeze([] as string[]),
    }),
    progression: Object.freeze({
      cue: input.proposal.progressionCue,
      deloadRecommended: input.proposal.deloadRecommended,
      weekNumber: session.weekNumber,
      progressionPlanId: input.generation.progression?.requestId ?? null,
      notes: Object.freeze([...input.proposal.recoveryNotes]),
    }),
    targets,
    notes: Object.freeze({
      coachNotes: Object.freeze([...input.proposal.rationale]),
      recoveryNotes: Object.freeze([...input.proposal.recoveryNotes]),
      sessionNotes: Object.freeze([...session.notes]),
      rationale: Object.freeze([...input.proposal.rationale]),
    }),
    warnings: Object.freeze({
      items: Object.freeze([...input.generation.validationIssues]),
      blocking: input.generation.validationIssues.length > 0,
    }),
    metrics: Object.freeze({
      estimatedDurationSeconds: session.estimatedDurationSeconds,
      estimatedWorkload: session.estimatedWorkload,
      exerciseCount: session.exercises.length,
      setCount: session.summary.totalSets,
      volumeScore: input.proposal.volumeScore,
      intensityScore: input.proposal.intensityScore,
      readinessScore: session.summary.readinessScore,
    }),
    statistics: Object.freeze({
      weekCount: 1,
      dayCount: 1,
      blockCount: session.blocks.length,
      exerciseCount: session.exercises.length,
      targetCount: targets.length,
      recommendationCount: recommendationIds.length,
      decisionCount: input.decisions.length,
      warningCount: input.generation.validationIssues.length,
    }),
    summary: Object.freeze({
      title: session.name,
      focus: String(session.focus),
      daysPerWeek: input.proposal.daysPerWeek,
      estimatedDurationMinutes: Math.round(
        session.estimatedDurationSeconds / 60,
      ),
      exerciseCount: session.exercises.length,
      message: `Generated ${session.exercises.length} exercise workout (${session.name}).`,
    }),
    metadata: input.metadata
      ? Object.freeze({
          ...input.metadata,
          pipelineVersion: PIPELINE_VERSION,
          source: "workout_generation_pipeline" as const,
        })
      : EMPTY_PLAN_METADATA,
    unifiedContext: input.unifiedContext,
    decisionPackage: input.decisionPackage,
    recommendationPackage: input.recommendationPackage,
    generation: input.generation,
    createdAt: input.at,
    frozenAt: input.at,
  });
}
