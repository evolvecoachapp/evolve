import {
  formatDashboardDate,
  formatDashboardGreeting,
} from "../../dashboard/utils/presentationFormatters";
import type { HomeDashboard as HomeDashboardDto } from "../types/homeDashboard";
import type { AthleteSnapshotCard } from "../models/AthleteSnapshotCard";

export interface AthleteIdentityInput {
  readonly displayName: string;
  readonly initials: string;
  readonly now?: Date;
}

/** Maps provider dashboard + identity into an immutable athlete snapshot card. */
export function mapAthleteSnapshot(
  dto: HomeDashboardDto,
  identity: AthleteIdentityInput,
): AthleteSnapshotCard {
  const now = identity.now ?? new Date();
  return Object.freeze({
    displayName: identity.displayName,
    initials: identity.initials,
    greeting: formatDashboardGreeting(now),
    dateLabel: formatDashboardDate(now),
    subtitle: "Your daily performance at a glance",
    streakDays: dto.streak.days,
    recoveryScore: dto.recovery.score,
    workoutsCompleted: dto.weeklyProgress.workoutsCompleted,
    workoutsTarget: dto.weeklyProgress.workoutsTarget,
    avgCalories: dto.weeklyProgress.avgCalories,
    present: true,
  });
}
