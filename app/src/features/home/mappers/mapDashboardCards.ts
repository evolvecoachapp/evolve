import type {
  HomeDashboard as HomeDashboardDto,
  HomeMacroTarget,
} from "../types/homeDashboard";
import type {
  NutritionMacroCard,
  NutritionSummaryCard,
} from "../models/NutritionSummaryCard";
import type { WorkoutSummaryCard } from "../models/WorkoutSummaryCard";
import type { RecoverySummaryCard } from "../models/RecoverySummaryCard";
import type { CoachSummaryCard } from "../models/CoachSummaryCard";

const WORKOUT_DESTINATION = "/(app)/(tabs)/workout";
const NUTRITION_DESTINATION = "/(app)/(tabs)/nutrition";
const COACH_DESTINATION = "/(app)/(tabs)/coach";

function mapMacro(
  target: HomeMacroTarget,
  unitLabel: string,
): NutritionMacroCard {
  const progressPercent =
    target.target <= 0
      ? 0
      : Math.min(100, Math.round((target.current / target.target) * 100));

  return Object.freeze({
    current: target.current,
    target: target.target,
    progressPercent,
    unitLabel,
  });
}

export function mapWorkoutSummary(dto: HomeDashboardDto): WorkoutSummaryCard {
  const present = dto.workoutPreview.name.trim().length > 0;
  return Object.freeze({
    present,
    name: dto.workoutPreview.name,
    muscleGroups: dto.workoutPreview.muscleGroups,
    durationMinutes: dto.workoutPreview.durationMinutes,
    statusLabel: present ? "Ready" : "No workout",
    destination: WORKOUT_DESTINATION,
  });
}

export function mapNutritionSummary(
  dto: HomeDashboardDto,
): NutritionSummaryCard {
  const nutrition = dto.nutritionSummary;
  const present = nutrition.calories.target > 0;
  return Object.freeze({
    present,
    calories: mapMacro(nutrition.calories, ""),
    protein: mapMacro(nutrition.protein, "g"),
    carbs: mapMacro(nutrition.carbs, "g"),
    fat: mapMacro(nutrition.fat, "g"),
    destination: NUTRITION_DESTINATION,
  });
}

export function mapRecoverySummary(dto: HomeDashboardDto): RecoverySummaryCard {
  return Object.freeze({
    present: dto.recovery.score >= 0,
    score: dto.recovery.score,
    status: dto.recovery.status,
    tip: dto.recovery.tip,
  });
}

export function mapCoachSummary(dto: HomeDashboardDto): CoachSummaryCard {
  const message = dto.coachSummary.message.trim();
  return Object.freeze({
    present: message.length > 0,
    message,
    actionLabel: "Ask Coach →",
    destination: COACH_DESTINATION,
  });
}
