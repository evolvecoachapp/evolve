import type { NutritionDay } from "../models";
import type {
  MacroProgressDto,
  MealDto,
  NutritionCoachSuggestionDto,
  NutritionDashboardDto,
  NutritionExperienceService,
} from "../services";

function percent(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
}

function buildAvailableDays(base: NutritionDay): readonly NutritionDay[] {
  return Object.freeze([
    Object.freeze({ ...base, id: `${base.isoDate}-minus-1`, label: "Yesterday", shortLabel: "Yday", relativeLabel: "Yesterday", isToday: false }),
    Object.freeze({ ...base }),
    Object.freeze({ ...base, id: `${base.isoDate}-plus-1`, label: "Tomorrow", shortLabel: "Tom", relativeLabel: "Tomorrow", isToday: false }),
  ]);
}

function buildMeals(day: NutritionDay, toggledMealIds: ReadonlySet<string> = new Set()): readonly MealDto[] {
  const defaultCompletedIds = new Set(["breakfast", "morning_snack"]);
  const meals: readonly Omit<MealDto, "isCompleted" | "completionPercent">[] = [
    {
      id: "breakfast",
      kind: "breakfast",
      title: "Breakfast",
      scheduledTime: "07:30",
      calories: 520,
      proteinGrams: 34,
      carbohydratesGrams: 58,
      fatGrams: 16,
      foods: [
        { id: "oats", name: "Overnight oats", quantity: "1 bowl", calories: 320, proteinGrams: 18, carbohydratesGrams: 42, fatGrams: 8 },
        { id: "berries", name: "Mixed berries", quantity: "120 g", calories: 70, proteinGrams: 1, carbohydratesGrams: 16, fatGrams: 0 },
        { id: "yogurt", name: "Greek yogurt", quantity: "170 g", calories: 130, proteinGrams: 15, carbohydratesGrams: 6, fatGrams: 4 },
      ],
      destination: "/(app)/nutrition/meal-details/breakfast",
    },
    {
      id: "morning_snack",
      kind: "morning_snack",
      title: "Morning Snack",
      scheduledTime: "10:30",
      calories: 240,
      proteinGrams: 20,
      carbohydratesGrams: 18,
      fatGrams: 8,
      foods: [
        { id: "shake", name: "Protein shake", quantity: "1 serving", calories: 160, proteinGrams: 25, carbohydratesGrams: 6, fatGrams: 3 },
        { id: "banana", name: "Banana", quantity: "1 medium", calories: 80, proteinGrams: 1, carbohydratesGrams: 22, fatGrams: 0 },
      ],
      destination: "/(app)/nutrition/meal-details/morning-snack",
    },
    {
      id: "lunch",
      kind: "lunch",
      title: "Lunch",
      scheduledTime: "13:00",
      calories: 640,
      proteinGrams: 42,
      carbohydratesGrams: 70,
      fatGrams: 18,
      foods: [
        { id: "chicken-rice", name: "Chicken rice bowl", quantity: "1 bowl", calories: 640, proteinGrams: 42, carbohydratesGrams: 70, fatGrams: 18 },
      ],
      destination: "/(app)/nutrition/meal-details/lunch",
    },
    {
      id: "pre_workout",
      kind: "pre_workout",
      title: "Pre Workout",
      scheduledTime: "16:30",
      calories: 260,
      proteinGrams: 14,
      carbohydratesGrams: 38,
      fatGrams: 5,
      foods: [
        { id: "toast-honey", name: "Toast with honey", quantity: "2 slices", calories: 260, proteinGrams: 14, carbohydratesGrams: 38, fatGrams: 5 },
      ],
      destination: "/(app)/nutrition/meal-details/pre-workout",
    },
    {
      id: "post_workout",
      kind: "post_workout",
      title: "Post Workout",
      scheduledTime: "19:00",
      calories: 330,
      proteinGrams: 32,
      carbohydratesGrams: 34,
      fatGrams: 6,
      foods: [
        { id: "recovery-shake", name: "Recovery shake", quantity: "1 bottle", calories: 330, proteinGrams: 32, carbohydratesGrams: 34, fatGrams: 6 },
      ],
      destination: "/(app)/nutrition/meal-details/post-workout",
    },
    {
      id: "dinner",
      kind: "dinner",
      title: "Dinner",
      scheduledTime: "20:30",
      calories: 580,
      proteinGrams: 40,
      carbohydratesGrams: 52,
      fatGrams: 20,
      foods: [
        { id: "salmon-potatoes", name: "Salmon with potatoes", quantity: "1 plate", calories: 580, proteinGrams: 40, carbohydratesGrams: 52, fatGrams: 20 },
      ],
      destination: "/(app)/nutrition/meal-details/dinner",
    },
    {
      id: "evening_snack",
      kind: "evening_snack",
      title: "Evening Snack",
      scheduledTime: "22:00",
      calories: 180,
      proteinGrams: 18,
      carbohydratesGrams: 8,
      fatGrams: 8,
      foods: [
        { id: "cottage-cheese", name: "Cottage cheese", quantity: "150 g", calories: 180, proteinGrams: 18, carbohydratesGrams: 8, fatGrams: 8 },
      ],
      destination: "/(app)/nutrition/meal-details/evening-snack",
    },
  ];

  return Object.freeze(
    meals.map((meal) => {
      const done = toggledMealIds.has(meal.id)
        ? !defaultCompletedIds.has(meal.id)
        : defaultCompletedIds.has(meal.id);
      return {
        ...meal,
        isCompleted: done,
        completionPercent: done ? 100 : 0,
      };
    }),
  );
}

function summarizeMeals(meals: readonly MealDto[]) {
  const completedMeals = meals.filter((meal) => meal.isCompleted).length;
  const nextMeal = meals.find((meal) => !meal.isCompleted);
  return {
    totalMeals: meals.length,
    completedMeals,
    completionPercent: percent(completedMeals, meals.length),
    nextMealLabel: nextMeal ? `${nextMeal.title} at ${nextMeal.scheduledTime}` : "All meals completed",
  };
}

function buildMacros(meals: readonly MealDto[], scoreBias = 0): MacroProgressDto {
  const currentCalories = meals.filter((meal) => meal.isCompleted).reduce((sum, meal) => sum + meal.calories, 0);
  const currentProtein = meals.filter((meal) => meal.isCompleted).reduce((sum, meal) => sum + meal.proteinGrams, 0);
  const currentCarbs = meals.filter((meal) => meal.isCompleted).reduce((sum, meal) => sum + meal.carbohydratesGrams, 0);
  const currentFat = meals.filter((meal) => meal.isCompleted).reduce((sum, meal) => sum + meal.fatGrams, 0);
  return {
    calories: { current: currentCalories, target: 2450 },
    protein: { currentGrams: currentProtein, targetGrams: 180 },
    carbohydrates: { currentGrams: currentCarbs, targetGrams: 260 },
    fat: { currentGrams: currentFat, targetGrams: 75 },
    score: Math.max(
      0,
      Math.min(
        100,
        Math.round(
          (percent(currentProtein, 180) + percent(currentCarbs, 260) + percent(currentFat, 75)) / 3,
        ) + scoreBias,
      ),
    ),
  };
}

function buildHydration(day: NutritionDay) {
  return {
    currentMl: day.isToday ? 2100 : 2700,
    goalMl: 3200,
    destination: "/(app)/nutrition/history",
  };
}

function buildCoachSuggestions(day: NutritionDay, meals: readonly MealDto[]): readonly NutritionCoachSuggestionDto[] {
  const macros = buildMacros(meals);
  return Object.freeze([
    {
      id: "carbs-up",
      title: "Increase carbohydrates today",
      message: "You have room to fuel training. Shift more carbohydrates into the pre and post workout window.",
      metric: `${macros.carbohydrates.currentGrams}/${macros.carbohydrates.targetGrams} g`,
      tone: "attention",
      destination: "/(app)/nutrition/coach/carbs-up",
    },
    {
      id: "protein-target",
      title: "Protein target reached",
      message: day.isToday
        ? "Breakfast and lunch have already covered most of your daily protein requirement."
        : "Protein intake stayed consistent across the day, supporting recovery and lean mass retention.",
      metric: `${macros.protein.currentGrams} g`,
      tone: "positive",
      destination: "/(app)/nutrition/coach/protein-target",
    },
    {
      id: "water-reminder",
      title: "Drink more water",
      message: "Hydration is trailing your goal. Add one large bottle before dinner to stay on pace.",
      metric: `${buildHydration(day).currentMl} ml`,
      tone: "attention",
      destination: "/(app)/nutrition/coach/water-reminder",
    },
    {
      id: "adherence",
      title: "Great adherence",
      message: "Meal timing is aligned with training and recovery. Keep the same cadence through the evening.",
      metric: `${summarizeMeals(meals).completedMeals}/${meals.length} meals`,
      tone: "celebration",
      destination: "/(app)/nutrition/coach/adherence",
    },
  ]);
}

function buildDashboard(day: NutritionDay, toggledMealIds: ReadonlySet<string> = new Set()): NutritionDashboardDto {
  const meals = buildMeals(day, toggledMealIds);
  const mealSummary = summarizeMeals(meals);
  const macros = buildMacros(meals, day.isToday ? 0 : 6);
  const hydration = buildHydration(day);
  return {
    day,
    availableDays: buildAvailableDays(day),
    headline: `${macros.calories.current} of ${macros.calories.target} kcal`,
    summary: "Nutrition is framed around training quality, recovery, and adherence, not rigid tracking.",
    todaysGoal: "Fuel training with steady protein, front-load hydration, and keep dinner lighter on fats.",
    nutritionScore: Math.round((macros.score + mealSummary.completionPercent + percent(hydration.currentMl, hydration.goalMl)) / 3),
    macros,
    hydration,
    meals,
    mealSummary,
    coachSuggestions: buildCoachSuggestions(day, meals),
    mealDetailsDestination: "/(app)/nutrition/meal-details",
    foodSearchDestination: "/(app)/nutrition/food-search",
    barcodeScannerDestination: "/(app)/nutrition/barcode-scanner",
    historyDestination: "/(app)/nutrition/history",
  };
}

const toggledMeals = new Map<string, Set<string>>();

export const mockNutritionExperienceService: NutritionExperienceService = {
  providerId: "mock",
  async getDashboard(day) {
    return buildDashboard(day, toggledMeals.get(day.isoDate));
  },
  async getMeals(day) {
    const dashboard = await this.getDashboard(day);
    return dashboard.meals;
  },
  async getMacros(day) {
    const dashboard = await this.getDashboard(day);
    return dashboard.macros;
  },
  async getHydration(day) {
    const dashboard = await this.getDashboard(day);
    return dashboard.hydration;
  },
  async getCoachSuggestions(day) {
    const dashboard = await this.getDashboard(day);
    return dashboard.coachSuggestions;
  },
  async toggleMealCompletion(day, mealId) {
    const next = new Set(toggledMeals.get(day.isoDate) ?? []);
    if (next.has(mealId)) {
      next.delete(mealId);
    } else {
      next.add(mealId);
    }
    toggledMeals.set(day.isoDate, next);
    return buildMeals(day, next);
  },
};

export const emptyMockNutritionExperienceService: NutritionExperienceService = {
  ...mockNutritionExperienceService,
  async getDashboard(day) {
    return {
      day,
      availableDays: buildAvailableDays(day),
      headline: "No nutrition data yet",
      summary: "Start logging meals and hydration to unlock daily nutrition guidance.",
      todaysGoal: "Build your first consistent nutrition day.",
      nutritionScore: 0,
      macros: {
        calories: { current: 0, target: 2450 },
        protein: { currentGrams: 0, targetGrams: 180 },
        carbohydrates: { currentGrams: 0, targetGrams: 260 },
        fat: { currentGrams: 0, targetGrams: 75 },
        score: 0,
      },
      hydration: {
        currentMl: 0,
        goalMl: 3200,
        destination: "/(app)/nutrition/history",
      },
      meals: [],
      mealSummary: {
        totalMeals: 0,
        completedMeals: 0,
        completionPercent: 0,
        nextMealLabel: "No meals planned",
      },
      coachSuggestions: [],
      mealDetailsDestination: "/(app)/nutrition/meal-details",
      foodSearchDestination: "/(app)/nutrition/food-search",
      barcodeScannerDestination: "/(app)/nutrition/barcode-scanner",
      historyDestination: "/(app)/nutrition/history",
    };
  },
  async getMeals() {
    return [];
  },
  async getCoachSuggestions() {
    return [];
  },
};
