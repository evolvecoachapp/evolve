import { listGoals, updateGoal } from "../../../api/goals";
import { listProgressEntries } from "../../../api/progress";
import { ApiError } from "../../../api/client";
import type { GoalReadDto, ProgressEntryReadDto } from "../../../types/api";
import { mapBackendGoalProgressToExperienceDto } from "../mappers/mapBackendGoalProgressToExperienceDto";
import type { GoalProgressDashboardDto, GoalProgressExperienceService } from "../services/GoalProgressExperienceService";
import { GoalProgressExperienceError } from "../services/GoalProgressExperienceService";

/**
 * Backend provider — talks to the already-implemented Goals / Progress FastAPI
 * surface (`/api/v1/goals`, `/api/v1/progress`) via the shared authenticated
 * API client.
 *
 * Supported:
 * - Dashboard read via `GET /goals?status=active` + latest
 *   `GET /progress?goal_id=` entry (current value only)
 * - Goal completion via `PATCH /goals/{id}` with `status=achieved`
 *
 * Explicitly unsupported (no exact Experience-contract match):
 * - `updateProgress()` — backend `POST /progress` requires metric/value/unit/
 *   recorded_date; the Experience method supplies none of those
 * - `completeMilestone()` — no milestone model or endpoints on the backend
 *
 * Create / delete / progress summary / progress logging stay outside
 * `GoalProgressExperienceService` and are not wrapped here.
 *
 * Production Goals UI remains Runtime Session → Unified Workspace → Goal
 * Progress Engine. This provider is additive and selected only when
 * `EXPO_PUBLIC_GOAL_PROGRESS_EXPERIENCE_PROVIDER=backend`.
 */

function toGoalProgressExperienceError(
  error: unknown,
  fallback: string,
): GoalProgressExperienceError {
  if (error instanceof GoalProgressExperienceError) {
    return error;
  }
  if (error instanceof ApiError) {
    return new GoalProgressExperienceError(error.message, "backend");
  }
  return new GoalProgressExperienceError(
    error instanceof Error ? error.message : fallback,
    "backend",
  );
}

function unsupportedCapability(name: string): GoalProgressExperienceError {
  return new GoalProgressExperienceError(
    `${name} is not supported by the backend goals/progress API yet — see /api/v1/goals and /api/v1/progress.`,
    "backend",
  );
}

async function selectPrimaryActiveGoal(): Promise<GoalReadDto | null> {
  const page = await listGoals({ status: "active", limit: 20, offset: 0 });
  return page.items[0] ?? null;
}

async function fetchLatestProgressEntry(goalId: string): Promise<ProgressEntryReadDto | null> {
  const page = await listProgressEntries({
    goal_id: goalId,
    limit: 1,
    offset: 0,
  });
  return page.items[0] ?? null;
}

async function fetchDashboard(): Promise<GoalProgressDashboardDto> {
  const goal = await selectPrimaryActiveGoal();
  if (!goal) {
    return mapBackendGoalProgressToExperienceDto({ goal: null });
  }

  const latestEntry = await fetchLatestProgressEntry(goal.id);
  return mapBackendGoalProgressToExperienceDto({ goal, latestEntry });
}

export const backendGoalProgressExperienceService: GoalProgressExperienceService = {
  providerId: "backend",

  async getDashboard() {
    try {
      return await fetchDashboard();
    } catch (error) {
      throw toGoalProgressExperienceError(error, "Failed to load goal progress.");
    }
  },

  async updateProgress() {
    throw unsupportedCapability("Progress updates");
  },

  async completeMilestone() {
    throw unsupportedCapability("Milestone completion");
  },

  async completeGoal() {
    try {
      const goal = await selectPrimaryActiveGoal();
      if (!goal) {
        throw new GoalProgressExperienceError(
          "No active goal to complete.",
          "backend",
        );
      }

      const updated = await updateGoal(goal.id, { status: "achieved" });
      const latestEntry = await fetchLatestProgressEntry(updated.id);
      return mapBackendGoalProgressToExperienceDto({
        goal: updated,
        latestEntry,
      });
    } catch (error) {
      throw toGoalProgressExperienceError(error, "Failed to complete goal.");
    }
  },
};
