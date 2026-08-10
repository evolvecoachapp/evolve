import type { ReadinessLabel } from "../../recovery-agent/models/ReadinessState";
import type { SleepLabel } from "../../recovery-agent/models/SleepProfile";
import type { RecoveryDay } from "../models";

export interface SleepStateDto {
  readonly hours: number;
  readonly quality: number;
  readonly label: SleepLabel;
  readonly logged: boolean;
  readonly destination?: string | null;
}

export interface ReadinessProgressDto {
  readonly score: number;
  readonly label: ReadinessLabel;
  readonly destination?: string | null;
}

export interface RecoverySignalDto {
  readonly id: string;
  readonly summary: string;
}

export interface RecoveryDashboardDto {
  readonly day: RecoveryDay;
  readonly availableDays: readonly RecoveryDay[];
  readonly headline: string;
  readonly summary: string;
  readonly todaysGoal: string;
  readonly recoveryScore: number;
  readonly status: string;
  readonly sleep: SleepStateDto;
  readonly readiness: ReadinessProgressDto;
  readonly signals: readonly RecoverySignalDto[];
  readonly assessmentAvailable: boolean;
  readonly historyDestination?: string | null;
}

export type RecoveryExperienceProviderId = "mock" | "backend" | "local";

export interface RecoveryExperienceService {
  readonly providerId: RecoveryExperienceProviderId;
  getDashboard(day: RecoveryDay): Promise<RecoveryDashboardDto>;
  logSleep(day: RecoveryDay, hours: number): Promise<RecoveryDashboardDto>;
  updateReadiness(day: RecoveryDay, score: number): Promise<RecoveryDashboardDto>;
  assessRecovery(day: RecoveryDay): Promise<RecoveryDashboardDto>;
}

export class RecoveryExperienceError extends Error {
  constructor(message: string, readonly providerId?: RecoveryExperienceProviderId) {
    super(message);
    this.name = "RecoveryExperienceError";
  }
}
