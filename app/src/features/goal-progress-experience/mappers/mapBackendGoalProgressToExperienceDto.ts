import { toNumberOrNull } from "../../shared/utils/userAdapters";
import type { GoalReadDto, GoalTypeDto, ProgressEntryReadDto } from "../../../types/api";
import type { GoalProgressDashboardDto } from "../services/GoalProgressExperienceService";

/**
 * Maps Goals / Progress API DTOs onto the Goal Progress Experience read model.
 *
 * Only projects fields the backend actually returns. Milestones and checkpoints
 * have no Goals/Progress API surface and stay empty rather than invented.
 * Parameterless Experience `updateProgress` has no exact backend equivalent
 * (`POST /progress` requires metric/value/unit/date), so `updateAvailable`
 * stays false.
 */

function buildEmptyDashboard(): GoalProgressDashboardDto {
  return Object.freeze({
    goalId: null,
    headline: "No goals yet",
    summary: "Set a training goal to start tracking progress.",
    category: null,
    currentValue: 0,
    targetValue: 100,
    unit: "percent",
    completionPercent: 0,
    status: "",
    milestones: Object.freeze([]),
    checkpoints: Object.freeze([]),
    updateAvailable: false,
    completeAvailable: false,
    isCompleted: false,
    historyDestination: "/(app)/(tabs)/progress",
  });
}

function mapGoalTypeToCategory(goalType: GoalTypeDto): string {
  switch (goalType) {
    case "strength_target":
      return "performance";
    case "weight_target":
      return "body_composition";
    case "habit":
      return "habit";
    case "event_preparation":
      return "event";
    default:
      return goalType;
  }
}

function mapGoalStatusToExperienceStatus(status: GoalReadDto["status"]): string {
  switch (status) {
    case "achieved":
      return "completed";
    case "abandoned":
      return "abandoned";
    case "active":
    default:
      return "on_track";
  }
}

function buildSummary(goal: GoalReadDto): string {
  const parts = [
    `Priority ${goal.priority}`,
    goal.goal_type.replace(/_/g, " "),
  ];
  if (goal.target_date) {
    parts.push(`target ${goal.target_date}`);
  }
  return parts.join(" · ");
}

function completionPercent(currentValue: number, targetValue: number): number {
  if (!(targetValue > 0)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round((currentValue / targetValue) * 100)));
}

export interface MapBackendGoalProgressToExperienceDtoInput {
  readonly goal: GoalReadDto | null;
  readonly latestEntry?: ProgressEntryReadDto | null;
}

/** Maps a backend Goal (+ optional latest progress entry) into the Experience DTO. */
export function mapBackendGoalProgressToExperienceDto(
  input: MapBackendGoalProgressToExperienceDtoInput,
): GoalProgressDashboardDto {
  const { goal, latestEntry = null } = input;

  if (!goal) {
    return buildEmptyDashboard();
  }

  const isCompleted = goal.status === "achieved";
  const targetValue = toNumberOrNull(goal.target_value);
  const entryValue = latestEntry ? toNumberOrNull(latestEntry.value) : null;
  const hasNumericTarget = targetValue !== null && targetValue > 0;
  const currentValue = entryValue ?? 0;
  const resolvedTarget = hasNumericTarget ? targetValue : 100;
  const unit = goal.target_unit ?? latestEntry?.unit ?? "percent";
  const percent = hasNumericTarget
    ? completionPercent(currentValue, resolvedTarget)
    : isCompleted
      ? 100
      : 0;

  return Object.freeze({
    goalId: goal.id,
    headline: goal.description,
    summary: buildSummary(goal),
    category: mapGoalTypeToCategory(goal.goal_type),
    currentValue: hasNumericTarget ? currentValue : percent,
    targetValue: resolvedTarget,
    unit: hasNumericTarget ? unit : "percent",
    completionPercent: isCompleted ? 100 : percent,
    status: mapGoalStatusToExperienceStatus(goal.status),
    milestones: Object.freeze([]),
    checkpoints: Object.freeze([]),
    // Experience updateProgress() has no value payload; POST /progress is not
    // an exact match and must not invent a logged entry.
    updateAvailable: false,
    completeAvailable: goal.status === "active",
    isCompleted,
    historyDestination: "/(app)/(tabs)/progress",
  });
}

export { buildEmptyDashboard as buildEmptyBackendGoalProgressDashboard };
