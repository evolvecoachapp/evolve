import type { WeeklyCoachReport } from "../models/WeeklyCoachReport";
import type { WeeklyDecisionReport } from "../models/WeeklyDecisionReport";
import type { WeeklyExecutiveSummary } from "../models/WeeklyExecutiveSummary";
import type { WeeklyGoalReport } from "../models/WeeklyGoalReport";
import type { WeeklyNutritionReport } from "../models/WeeklyNutritionReport";
import type { WeeklyRecommendationReport } from "../models/WeeklyRecommendationReport";
import type { WeeklyRecoveryReport } from "../models/WeeklyRecoveryReport";
import type {
  WeeklyReportResult,
  WeeklyReportValidation,
} from "../models/WeeklyReportResult";
import type { WeeklyWorkoutReport } from "../models/WeeklyWorkoutReport";
import type { BuildWeeklyCoachReportInput } from "../services/buildWeeklyCoachReport";
import {
  createWeeklyCoachReportService,
  type WeeklyCoachReportService,
  type WeeklyCoachReportServiceDeps,
} from "../services/WeeklyCoachReportService";

function resolveService(
  service: WeeklyCoachReportService | undefined,
  deps: WeeklyCoachReportServiceDeps | undefined,
): WeeklyCoachReportService {
  if (service) return service;
  return createWeeklyCoachReportService(deps ?? {});
}

/** Public API — compose Weekly Coach Report from existing coaching knowledge. */
export function composeWeeklyCoachReport(options: {
  readonly input: Omit<
    BuildWeeklyCoachReportInput,
    | "generatedAt"
    | "timelineEntries"
    | "insights"
    | "coachingSession"
    | "planHistory"
    | "dailyBrief"
    | "homeExperience"
  > & {
    readonly generatedAt?: string;
    readonly timelineEntries?: BuildWeeklyCoachReportInput["timelineEntries"];
    readonly insights?: BuildWeeklyCoachReportInput["insights"];
    readonly coachingSession?: BuildWeeklyCoachReportInput["coachingSession"];
    readonly planHistory?: BuildWeeklyCoachReportInput["planHistory"];
    readonly dailyBrief?: BuildWeeklyCoachReportInput["dailyBrief"];
    readonly homeExperience?: BuildWeeklyCoachReportInput["homeExperience"];
    readonly planLineageId?: string | null;
    readonly goalSignals?: readonly string[];
  };
  readonly service?: WeeklyCoachReportService;
  readonly deps?: WeeklyCoachReportServiceDeps;
}): WeeklyReportResult {
  return resolveService(options.service, options.deps).build(options.input);
}

/** Dashboard API — full Weekly Coach Report. */
export function getWeeklyCoachReport(options: {
  readonly athleteId: string;
  readonly service?: WeeklyCoachReportService;
  readonly deps?: WeeklyCoachReportServiceDeps;
}): WeeklyCoachReport | null {
  return resolveService(options.service, options.deps).getWeeklyCoachReport(
    options.athleteId,
  );
}

/** Dashboard API — executive summary. */
export function getExecutiveSummary(options: {
  readonly athleteId: string;
  readonly service?: WeeklyCoachReportService;
  readonly deps?: WeeklyCoachReportServiceDeps;
}): WeeklyExecutiveSummary | null {
  return resolveService(options.service, options.deps).getExecutiveSummary(
    options.athleteId,
  );
}

/** Dashboard API — workout report. */
export function getWorkoutReport(options: {
  readonly athleteId: string;
  readonly service?: WeeklyCoachReportService;
  readonly deps?: WeeklyCoachReportServiceDeps;
}): WeeklyWorkoutReport | null {
  return resolveService(options.service, options.deps).getWorkoutReport(
    options.athleteId,
  );
}

/** Dashboard API — nutrition report. */
export function getNutritionReport(options: {
  readonly athleteId: string;
  readonly service?: WeeklyCoachReportService;
  readonly deps?: WeeklyCoachReportServiceDeps;
}): WeeklyNutritionReport | null {
  return resolveService(options.service, options.deps).getNutritionReport(
    options.athleteId,
  );
}

/** Dashboard API — recovery report. */
export function getRecoveryReport(options: {
  readonly athleteId: string;
  readonly service?: WeeklyCoachReportService;
  readonly deps?: WeeklyCoachReportServiceDeps;
}): WeeklyRecoveryReport | null {
  return resolveService(options.service, options.deps).getRecoveryReport(
    options.athleteId,
  );
}

/** Dashboard API — goal report. */
export function getGoalReport(options: {
  readonly athleteId: string;
  readonly service?: WeeklyCoachReportService;
  readonly deps?: WeeklyCoachReportServiceDeps;
}): WeeklyGoalReport | null {
  return resolveService(options.service, options.deps).getGoalReport(
    options.athleteId,
  );
}

/** Dashboard API — decision report. */
export function getDecisionReport(options: {
  readonly athleteId: string;
  readonly service?: WeeklyCoachReportService;
  readonly deps?: WeeklyCoachReportServiceDeps;
}): WeeklyDecisionReport | null {
  return resolveService(options.service, options.deps).getDecisionReport(
    options.athleteId,
  );
}

/** Dashboard API — recommendation report. */
export function getRecommendationReport(options: {
  readonly athleteId: string;
  readonly service?: WeeklyCoachReportService;
  readonly deps?: WeeklyCoachReportServiceDeps;
}): WeeklyRecommendationReport | null {
  return resolveService(options.service, options.deps).getRecommendationReport(
    options.athleteId,
  );
}

/** Public API — validate latest Weekly Coach Report for athlete. */
export function validateWeeklyCoachReportForAthlete(options: {
  readonly athleteId: string;
  readonly service?: WeeklyCoachReportService;
  readonly deps?: WeeklyCoachReportServiceDeps;
}): WeeklyReportValidation {
  return resolveService(options.service, options.deps).validate(
    options.athleteId,
  );
}

export type { WeeklyCoachReportServiceDeps };
