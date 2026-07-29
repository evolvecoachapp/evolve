import type {
  NutritionDay,
} from "../models";

export interface DailyCaloriesDto {
  readonly current: number;
  readonly target: number;
}

export interface DailyProteinDto {
  readonly currentGrams: number;
  readonly targetGrams: number;
}

export interface DailyCarbohydratesDto {
  readonly currentGrams: number;
  readonly targetGrams: number;
}

export interface DailyFatDto {
  readonly currentGrams: number;
  readonly targetGrams: number;
}

export interface MacroProgressDto {
  readonly calories: DailyCaloriesDto;
  readonly protein: DailyProteinDto;
  readonly carbohydrates: DailyCarbohydratesDto;
  readonly fat: DailyFatDto;
  readonly score: number;
}

export interface HydrationProgressDto {
  readonly currentMl: number;
  readonly goalMl: number;
  readonly destination?: string | null;
}

export interface MealFoodDto {
  readonly id: string;
  readonly name: string;
  readonly quantity: string;
  readonly calories: number;
  readonly proteinGrams: number;
  readonly carbohydratesGrams: number;
  readonly fatGrams: number;
}

export interface MealDto {
  readonly id: string;
  readonly kind:
    | "breakfast"
    | "morning_snack"
    | "lunch"
    | "pre_workout"
    | "post_workout"
    | "dinner"
    | "evening_snack"
    | "custom";
  readonly title: string;
  readonly scheduledTime: string;
  readonly completionPercent: number;
  readonly isCompleted: boolean;
  readonly calories: number;
  readonly proteinGrams: number;
  readonly carbohydratesGrams: number;
  readonly fatGrams: number;
  readonly foods: readonly MealFoodDto[];
  readonly destination?: string | null;
}

export interface MealSummaryDto {
  readonly totalMeals: number;
  readonly completedMeals: number;
  readonly completionPercent: number;
  readonly nextMealLabel: string;
}

export interface NutritionCoachSuggestionDto {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly metric: string;
  readonly tone: "positive" | "attention" | "celebration";
  readonly destination?: string | null;
}

export interface NutritionDashboardDto {
  readonly day: NutritionDay;
  readonly availableDays: readonly NutritionDay[];
  readonly headline: string;
  readonly summary: string;
  readonly todaysGoal: string;
  readonly nutritionScore: number;
  readonly macros: MacroProgressDto;
  readonly hydration: HydrationProgressDto;
  readonly meals: readonly MealDto[];
  readonly mealSummary: MealSummaryDto;
  readonly coachSuggestions: readonly NutritionCoachSuggestionDto[];
  readonly mealDetailsDestination?: string | null;
  readonly foodSearchDestination?: string | null;
  readonly barcodeScannerDestination?: string | null;
  readonly historyDestination?: string | null;
}

export type NutritionExperienceProviderId = "mock" | "backend" | "local";

export interface NutritionExperienceService {
  readonly providerId: NutritionExperienceProviderId;
  getDashboard(day: NutritionDay): Promise<NutritionDashboardDto>;
  getMeals(day: NutritionDay): Promise<readonly MealDto[]>;
  getMacros(day: NutritionDay): Promise<MacroProgressDto>;
  getHydration(day: NutritionDay): Promise<HydrationProgressDto>;
  getCoachSuggestions(day: NutritionDay): Promise<readonly NutritionCoachSuggestionDto[]>;
  toggleMealCompletion(day: NutritionDay, mealId: string): Promise<readonly MealDto[]>;
}

export class NutritionExperienceError extends Error {
  constructor(message: string, readonly providerId?: NutritionExperienceProviderId) {
    super(message);
    this.name = "NutritionExperienceError";
  }
}
