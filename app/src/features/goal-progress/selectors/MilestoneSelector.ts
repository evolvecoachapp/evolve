import type { GoalAchievement } from "../models/GoalAchievement";
import type { GoalAchievementKind } from "../models/GoalAchievement";

export function selectPresentTriggers(
  triggers: readonly GoalAchievement[],
): readonly GoalAchievement[] {
  return Object.freeze(triggers.filter((t) => t.present));
}

export function selectMilestonesByKind(
  triggers: readonly GoalAchievement[],
  kind: GoalAchievementKind,
): readonly GoalAchievement[] {
  return Object.freeze(triggers.filter((t) => t.kind === kind));
}
