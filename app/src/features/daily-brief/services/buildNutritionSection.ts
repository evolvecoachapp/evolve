import type { CoachTimelineEntry } from "../../coach-timeline/models/CoachTimelineEntry";
import { CoachTimelineEventCategories } from "../../coach-timeline/models/CoachTimelineEvent";
import type { NutritionPlan } from "../../nutrition-agent/models/NutritionPlan";
import type { DailyBriefNutrition } from "../models/DailyBriefNutrition";

export interface BuildNutritionSectionInput {
  readonly nutritionPlan?: NutritionPlan | null;
  readonly timelineEntries?: readonly CoachTimelineEntry[];
}

/**
 * Compose Daily Brief nutrition section from Nutrition Pipeline + timeline changes.
 * No duplicated nutrition logic.
 */
export function buildNutritionSection(
  input: BuildNutritionSectionInput = {},
): DailyBriefNutrition {
  const plan = input.nutritionPlan ?? null;
  const entries = input.timelineEntries ?? Object.freeze([]);

  const latestChange = [...entries]
    .filter(
      (e) =>
        e.event.category === CoachTimelineEventCategories.NUTRITION_MODIFIED ||
        e.event.category === CoachTimelineEventCategories.NUTRITION_CREATED ||
        e.event.category === CoachTimelineEventCategories.NUTRITION_RESTORED,
    )
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];

  if (!plan && !latestChange) {
    return Object.freeze({
      present: false,
      planId: null,
      macros: null,
      phaseHint: null,
      latestChangeSummary: null,
      summary: "No active nutrition plan.",
    });
  }

  const macros = plan
    ? Object.freeze({
        calories: plan.macroTargets.calories,
        proteinG: plan.macroTargets.proteinG,
        carbsG: plan.macroTargets.carbsG,
        fatG: plan.macroTargets.fatG,
      })
    : null;

  const latestChangeSummary = latestChange?.summary ?? null;
  const parts: string[] = [];
  if (macros) {
    parts.push(`${macros.calories} kcal`);
  }
  if (plan?.phaseHint) parts.push(plan.phaseHint);
  if (latestChangeSummary) parts.push(latestChangeSummary);

  return Object.freeze({
    present: true,
    planId: plan?.id ?? null,
    macros,
    phaseHint: plan?.phaseHint ?? null,
    latestChangeSummary,
    summary:
      parts.length > 0 ? parts.join(" · ") : "Nutrition guidance available.",
  });
}
