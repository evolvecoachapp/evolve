/** Immutable macro display values projected from Unified Workspace nutrition. */
export interface DashboardProjectionMacroCard {
  readonly current: number;
  readonly target: number;
  readonly progressPercent: number;
  readonly unitLabel: string;
}

/** Immutable workout card projected from Unified Workspace workout section. */
export interface DashboardProjectionWorkoutCard {
  readonly present: boolean;
  readonly name: string;
  readonly muscleGroups: string;
  readonly durationMinutes: number;
  readonly statusLabel: string;
  readonly destination: string;
}

/** Immutable nutrition card projected from Unified Workspace nutrition section. */
export interface DashboardProjectionNutritionCard {
  readonly present: boolean;
  readonly calories: DashboardProjectionMacroCard;
  readonly protein: DashboardProjectionMacroCard;
  readonly carbs: DashboardProjectionMacroCard;
  readonly fat: DashboardProjectionMacroCard;
  readonly destination: string;
}

/** Immutable recovery card projected from Unified Workspace recovery section. */
export interface DashboardProjectionRecoveryCard {
  readonly present: boolean;
  readonly score: number;
  readonly status: string;
  readonly tip: string;
}

/** Immutable coach card projected from Unified Workspace coach section. */
export interface DashboardProjectionCoachCard {
  readonly present: boolean;
  readonly message: string;
  readonly actionLabel: string;
  readonly destination: string;
}

/** Immutable athlete header card projected from Unified Workspace header and snapshot. */
export interface DashboardProjectionAthleteCard {
  readonly displayName: string;
  readonly initials: string;
  readonly greeting: string;
  readonly dateLabel: string;
  readonly subtitle: string;
  readonly streakDays: number;
  readonly recoveryScore: number;
  readonly workoutsCompleted: number;
  readonly workoutsTarget: number;
  readonly avgCalories: number;
  readonly present: boolean;
}

export const DashboardProjectionQuickActionKinds = {
  START_WORKOUT: "start_workout",
  LOG_NUTRITION: "log_nutrition",
  VIEW_RECOVERY: "view_recovery",
  VIEW_GOALS: "view_goals",
  ASK_COACH: "ask_coach",
  VIEW_PROGRESS: "view_progress",
  VIEW_PROFILE: "view_profile",
} as const;

export type DashboardProjectionQuickActionKind =
  (typeof DashboardProjectionQuickActionKinds)[keyof typeof DashboardProjectionQuickActionKinds];

/** Immutable quick action projected from Unified Workspace availability flags. */
export interface DashboardProjectionQuickAction {
  readonly id: string;
  readonly kind: DashboardProjectionQuickActionKind;
  readonly label: string;
  readonly icon: string;
  readonly destination: string;
  readonly enabled: boolean;
  readonly reason: string;
}

export function createDashboardProjectionMacroCard(
  input: DashboardProjectionMacroCard,
): DashboardProjectionMacroCard {
  return Object.freeze({ ...input });
}

export function createDashboardProjectionWorkoutCard(
  input: DashboardProjectionWorkoutCard,
): DashboardProjectionWorkoutCard {
  return Object.freeze({ ...input });
}

export function createDashboardProjectionNutritionCard(
  input: DashboardProjectionNutritionCard,
): DashboardProjectionNutritionCard {
  return Object.freeze({ ...input });
}

export function createDashboardProjectionRecoveryCard(
  input: DashboardProjectionRecoveryCard,
): DashboardProjectionRecoveryCard {
  return Object.freeze({ ...input });
}

export function createDashboardProjectionCoachCard(
  input: DashboardProjectionCoachCard,
): DashboardProjectionCoachCard {
  return Object.freeze({ ...input });
}

export function createDashboardProjectionAthleteCard(
  input: DashboardProjectionAthleteCard,
): DashboardProjectionAthleteCard {
  return Object.freeze({ ...input });
}

export function createDashboardProjectionQuickAction(
  input: DashboardProjectionQuickAction,
): DashboardProjectionQuickAction {
  return Object.freeze({ ...input });
}
