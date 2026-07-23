import type { NutritionContext } from "../models/NutritionContext";
import {
  createDefaultPlanners,
  type NutritionPlanner,
  NutritionPlannerImpl,
  CutPlanner,
  BulkPlanner,
  MaintenancePlanner,
  RefeedPlanner,
  MealPlanner,
} from "../planning";

export class PlannerSelector {
  constructor(
    private readonly planners: readonly NutritionPlanner[] = createDefaultPlanners(),
  ) {}

  select(context: NutritionContext): NutritionPlanner {
    if (context.intent === "meal_timing") return MealPlanner;
    if (context.constraints.flags.includes("refeed")) return RefeedPlanner;
    if (context.goal === "fat_loss" || context.goal === "contest_prep")
      return CutPlanner;
    if (
      context.goal === "muscle_gain" ||
      context.goal === "hypertrophy"
    )
      return BulkPlanner;
    if (context.goal === "maintenance" || context.goal === "general_health")
      return MaintenancePlanner;
    return this.planners[0] ?? new NutritionPlannerImpl();
  }
}
