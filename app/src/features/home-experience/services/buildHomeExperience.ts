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
import type { HomeExperience } from "../models/HomeExperience";
import type { HomeExperienceResult } from "../models/HomeExperienceResult";
import { buildCoachCard } from "./buildCoachCard";
import { buildGoalCard } from "./buildGoalCard";
import {
  buildHomeSummary,
  deriveRelatedDomains,
} from "./buildHomeSummary";
import { buildInsightCards } from "./buildInsightCard";
import { buildNutritionCard } from "./buildNutritionCard";
import { buildQuickActions } from "./buildQuickActions";
import { buildRecoveryCard } from "./buildRecoveryCard";
import { buildTimelineCard } from "./buildTimelineCard";
import { buildWorkoutCard } from "./buildWorkoutCard";
import { validateHomeExperience } from "./validateHomeExperience";

export interface BuildHomeExperienceInput {
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
  readonly canRestorePlan?: boolean;
  readonly insightLimit?: number;
}

/**
 * Compose an immutable Home Experience from existing domain outputs.
 * No new reasoning engines. No duplicated business logic.
 */
export function buildHomeExperience(
  input: BuildHomeExperienceInput,
): HomeExperienceResult {
  const timelineEntries = input.timelineEntries ?? Object.freeze([]);
  const insights = input.insights ?? Object.freeze([]);

  const workout = buildWorkoutCard({
    workoutPlan: input.workoutPlan ?? null,
    modification: input.modification ?? null,
    planHistory: input.planHistory ?? null,
  });

  const nutrition = buildNutritionCard({
    nutritionPlan: input.nutritionPlan ?? null,
    timelineEntries,
  });

  const recovery = buildRecoveryCard({
    recoveryMetrics: input.recoveryMetrics ?? null,
    sleepProfile: input.sleepProfile ?? null,
    recoveryNotes: input.recoveryNotes ?? Object.freeze([]),
  });

  const goal = buildGoalCard({
    goalProgress: input.goalProgress ?? null,
  });

  const insightCards = buildInsightCards({
    insights,
    limit: input.insightLimit ?? 5,
  });

  const timeline = buildTimelineCard({
    timelineEntries,
  });

  const coach = buildCoachCard({
    coachingSession: input.coachingSession ?? null,
  });

  const canRestorePlan =
    input.canRestorePlan === true ||
    (input.planHistory !== null &&
      input.planHistory !== undefined &&
      input.planHistory.currentVersionNumber > 1);

  const quickActions = buildQuickActions({
    athleteId: input.athleteId,
    workout,
    nutrition,
    goal,
    timeline,
    insights: insightCards,
    coach,
    canRestorePlan,
  });

  const experienceId = `home:${input.requestId}:${input.generatedAt}`;
  const relatedDomains = deriveRelatedDomains({
    workout,
    nutrition,
    recovery,
    goal,
    insights: insightCards,
    timeline,
    coach,
  });

  const summary = buildHomeSummary({
    athleteId: input.athleteId,
    experienceId,
    workout,
    nutrition,
    recovery,
    goal,
    insights: insightCards,
    timeline,
    coach,
    quickActions,
    generatedAt: input.generatedAt,
  });

  const experience: HomeExperience = Object.freeze({
    id: experienceId,
    athleteId: input.athleteId,
    timestamp: input.generatedAt,
    summary,
    workout,
    nutrition,
    recovery,
    goal,
    insights: insightCards,
    timeline,
    coach,
    quickActions,
    relatedDomains,
    metadata: Object.freeze({
      requestId: input.requestId,
      athleteId: input.athleteId,
    }),
  });

  const validation = validateHomeExperience(experience);
  if (!validation.valid) {
    return Object.freeze({
      id: `home-result:${input.requestId}:invalid`,
      success: false,
      experience: null,
      summary: null,
      validation,
      message: `Home experience validation failed: ${validation.errors.join("; ")}`,
      generatedAt: input.generatedAt,
    });
  }

  return Object.freeze({
    id: `home-result:${input.requestId}`,
    success: true,
    experience,
    summary,
    validation,
    message: "Home experience composed from existing coaching knowledge.",
    generatedAt: input.generatedAt,
  });
}
