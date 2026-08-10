import {
  createReadinessProgress,
  createRecoveryDashboard,
  createRecoverySignal,
  createSleepState,
  type ReadinessProgress,
  type RecoveryDashboard,
  type RecoverySignal,
  type SleepState,
} from "../models";
import type {
  ReadinessProgressDto,
  RecoveryDashboardDto,
  RecoverySignalDto,
  SleepStateDto,
} from "../services";

export function mapSleepState(dto: SleepStateDto): SleepState {
  return createSleepState({
    hours: dto.hours,
    quality: dto.quality,
    label: dto.label,
    logged: dto.logged,
    destination: dto.destination ?? "/(app)/recovery/history",
  });
}

export function mapReadiness(dto: ReadinessProgressDto): ReadinessProgress {
  return createReadinessProgress({
    score: dto.score,
    label: dto.label,
    destination: dto.destination ?? "/(app)/recovery/readiness",
  });
}

export function mapSignals(signals: readonly RecoverySignalDto[]): readonly RecoverySignal[] {
  return Object.freeze(
    signals.map((signal) =>
      createRecoverySignal({
        id: signal.id,
        summary: signal.summary,
      }),
    ),
  );
}

export function mapRecoveryDashboard(dto: RecoveryDashboardDto): RecoveryDashboard {
  return createRecoveryDashboard({
    day: dto.day,
    availableDays: dto.availableDays,
    headline: dto.headline,
    summary: dto.summary,
    todaysGoal: dto.todaysGoal,
    recoveryScore: dto.recoveryScore,
    status: dto.status,
    sleep: mapSleepState(dto.sleep),
    readiness: mapReadiness(dto.readiness),
    signals: mapSignals(dto.signals),
    assessmentAvailable: dto.assessmentAvailable,
    historyDestination: dto.historyDestination ?? "/(app)/recovery/history",
  });
}
