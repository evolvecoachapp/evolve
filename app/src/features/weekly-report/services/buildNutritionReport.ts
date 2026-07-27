import type { CoachTimelineEntry } from "../../coach-timeline/models/CoachTimelineEntry";
import { CoachTimelineEventCategories } from "../../coach-timeline/models/CoachTimelineEvent";
import type { NutritionPlan } from "../../nutrition-agent/models/NutritionPlan";
import type { WeeklyNutritionReport } from "../models/WeeklyNutritionReport";

export interface BuildNutritionReportInput {
  readonly nutritionPlan?: NutritionPlan | null;
  readonly timelineEntries?: readonly CoachTimelineEntry[];
  readonly adherenceSummary?: string | null;
  readonly complianceSummary?: string | null;
}

/**
 * Compose Weekly Coach Report nutrition section from Nutrition Pipeline + timeline.
 * No duplicated nutrition logic.
 */
export function buildNutritionReport(
  input: BuildNutritionReportInput = {},
): WeeklyNutritionReport {
  const plan = input.nutritionPlan ?? null;
  const entries = input.timelineEntries ?? Object.freeze([]);

  const nutritionChanges = [...entries]
    .filter(
      (e) =>
        e.event.category === CoachTimelineEventCategories.NUTRITION_MODIFIED ||
        e.event.category === CoachTimelineEventCategories.NUTRITION_CREATED ||
        e.event.category === CoachTimelineEventCategories.NUTRITION_RESTORED,
    )
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const latestChange = nutritionChanges[0];
  const macroChangeCount = nutritionChanges.filter(
    (e) => e.event.category === CoachTimelineEventCategories.NUTRITION_MODIFIED,
  ).length;

  if (!plan && !latestChange) {
    return Object.freeze({
      present: false,
      planId: null,
      macros: null,
      phaseHint: null,
      macroChangeCount: 0,
      latestChangeSummary: null,
      adherenceSummary: null,
      complianceSummary: null,
      summary: "No nutrition activity this week.",
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
  const adherenceSummary =
    input.adherenceSummary ??
    (macros ? `Weekly target ${macros.calories} kcal.` : null);
  const complianceSummary =
    input.complianceSummary ??
    (macroChangeCount > 0
      ? `${macroChangeCount} macro change(s) this week.`
      : adherenceSummary);

  const parts: string[] = [];
  if (macros) parts.push(`${macros.calories} kcal`);
  if (plan?.phaseHint) parts.push(plan.phaseHint);
  if (macroChangeCount > 0) parts.push(`${macroChangeCount} change(s)`);
  if (latestChangeSummary) parts.push(latestChangeSummary);
  if (adherenceSummary) parts.push(adherenceSummary);

  return Object.freeze({
    present: true,
    planId: plan?.id ?? null,
    macros,
    phaseHint: plan?.phaseHint ?? null,
    macroChangeCount,
    latestChangeSummary,
    adherenceSummary,
    complianceSummary,
    summary:
      parts.length > 0 ? parts.join(" · ") : "Nutrition guidance available.",
  });
}
