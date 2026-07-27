import type { CoachTimelineEntry } from "../../coach-timeline/models/CoachTimelineEntry";
import type { CoachingSession } from "../../coaching-session/composition/models/CoachingSession";
import type { GoalProgress } from "../../goal-progress/models/GoalProgress";
import type { NutritionPlan } from "../../nutrition-agent/models/NutritionPlan";
import type { PlanHistory } from "../../plan-history/models/PlanHistory";
import type { CoachInsight } from "../../proactive-insights/models/CoachInsight";
import type { SleepProfile } from "../../recovery-agent/models/SleepProfile";
import type { RecoveryMetrics } from "../../recovery-intelligence/models/RecoveryMetrics";
import type { WorkoutModificationResult } from "../../workout-generation-pipeline/models/WorkoutModificationResult";
import type { WorkoutPlan } from "../../workout-generation-pipeline/models/WorkoutPlan";
import type { DailyBrief } from "../models/DailyBrief";
import type { DailyBriefResult } from "../models/DailyBriefResult";
import { buildCoachMessage } from "./buildCoachMessage";
import {
  buildDailyBriefSummary,
  deriveRelatedDomains,
} from "./buildDailyBriefSummary";
import { buildGoalSection } from "./buildGoalSection";
import { buildInsightSection } from "./buildInsightSection";
import { buildNutritionSection } from "./buildNutritionSection";
import { buildRecoverySection } from "./buildRecoverySection";
import { buildWorkoutSection } from "./buildWorkoutSection";
import { calculateConfidence } from "./calculateConfidence";
import { calculatePriority } from "./calculatePriority";
import { validateDailyBrief } from "./validateDailyBrief";

export interface BuildDailyBriefInput {
  readonly athleteId: string;
  readonly requestId: string;
  readonly generatedAt: string;
  readonly workoutPlan?: WorkoutPlan | null;
  readonly modification?: WorkoutModificationResult | null;
  readonly planHistory?: PlanHistory | null;
  readonly nutritionPlan?: NutritionPlan | null;
  readonly recoveryMetrics?: RecoveryMetrics | null;
  readonly sleepProfile?: SleepProfile | null;
  readonly recoveryNotes?: readonly string[];
  readonly goalProgress?: GoalProgress | null;
  readonly timelineEntries?: readonly CoachTimelineEntry[];
  readonly insights?: readonly CoachInsight[];
  readonly coachingSession?: CoachingSession | null;
  readonly insightLimit?: number;
}

/**
 * Compose an immutable Athlete Daily Brief from existing domain outputs.
 * No new reasoning engines. No duplicated business logic. Not an LLM summary.
 */
export function buildDailyBrief(
  input: BuildDailyBriefInput,
): DailyBriefResult {
  const timelineEntries = input.timelineEntries ?? Object.freeze([]);
  const insights = input.insights ?? Object.freeze([]);

  const workout = buildWorkoutSection({
    workoutPlan: input.workoutPlan ?? null,
    modification: input.modification ?? null,
    planHistory: input.planHistory ?? null,
  });

  const nutrition = buildNutritionSection({
    nutritionPlan: input.nutritionPlan ?? null,
    timelineEntries,
  });

  const recovery = buildRecoverySection({
    recoveryMetrics: input.recoveryMetrics ?? null,
    sleepProfile: input.sleepProfile ?? null,
    recoveryNotes: input.recoveryNotes ?? Object.freeze([]),
  });

  const goals = buildGoalSection({
    goalProgress: input.goalProgress ?? null,
  });

  const insightSection = buildInsightSection({
    insights,
    limit: input.insightLimit ?? 5,
  });

  const coachMessage = buildCoachMessage({
    coachingSession: input.coachingSession ?? null,
    timelineEntries,
  });

  const priority = calculatePriority({
    insights: insightSection,
    recovery,
    goals,
    hasWorkout: workout.present,
    hasNutrition: nutrition.present,
    hasCoachMessage: coachMessage.present,
  });

  const confidence = calculateConfidence({
    workout,
    nutrition,
    recovery,
    goals,
    insights: insightSection,
    coachMessage,
  });

  const briefId = `daily-brief:${input.requestId}:${input.generatedAt}`;
  const relatedDomains = deriveRelatedDomains({
    workout,
    nutrition,
    recovery,
    goals,
    insights: insightSection,
    coachMessage,
  });

  const summary = buildDailyBriefSummary({
    athleteId: input.athleteId,
    briefId,
    workout,
    nutrition,
    recovery,
    goals,
    insights: insightSection,
    coachMessage,
    priority,
    confidence,
    generatedAt: input.generatedAt,
  });

  const brief: DailyBrief = Object.freeze({
    id: briefId,
    athleteId: input.athleteId,
    timestamp: input.generatedAt,
    summary,
    workout,
    nutrition,
    recovery,
    goals,
    insights: insightSection,
    coachMessage,
    priority,
    confidence,
    relatedDomains,
    metadata: Object.freeze({
      requestId: input.requestId,
      athleteId: input.athleteId,
    }),
  });

  const validation = validateDailyBrief(brief);
  if (!validation.valid) {
    return Object.freeze({
      id: `daily-brief-result:${input.requestId}:invalid`,
      success: false,
      brief: null,
      summary: null,
      validation,
      message: `Daily brief validation failed: ${validation.errors.join("; ")}`,
      generatedAt: input.generatedAt,
    });
  }

  return Object.freeze({
    id: `daily-brief-result:${input.requestId}`,
    success: true,
    brief,
    summary,
    validation,
    message: "Daily brief composed from existing coaching knowledge.",
    generatedAt: input.generatedAt,
  });
}
