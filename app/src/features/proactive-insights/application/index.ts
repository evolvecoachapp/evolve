import type { CoachInsight } from "../models/CoachInsight";
import type { CoachInsightSnapshot } from "../models/CoachInsightSnapshot";
import type { InsightAnalysisResult } from "../models/InsightAnalysisResult";
import type { InsightFilter } from "../models/InsightFilter";
import type { InsightQuery } from "../models/InsightQuery";
import {
  createProactiveInsightsService,
  type ProactiveInsightsService,
  type ProactiveInsightsServiceDeps,
} from "../services/ProactiveInsightsService";
import type { InsightValidation } from "../services/validateInsights";

function resolveService(
  service: ProactiveInsightsService | undefined,
  deps: ProactiveInsightsServiceDeps | undefined,
): ProactiveInsightsService {
  if (service) return service;
  if (!deps) {
    throw new Error(
      "ProactiveInsightsService requires coachTimeline deps when no service is provided",
    );
  }
  return createProactiveInsightsService(deps);
}

/** Public API — analyze athlete coaching evidence into insights. */
export function analyzeProactiveInsights(options: {
  readonly athleteId: string;
  readonly goalSignals?: readonly string[];
  readonly service?: ProactiveInsightsService;
  readonly deps?: ProactiveInsightsServiceDeps;
}): InsightAnalysisResult {
  return resolveService(options.service, options.deps).analyze({
    athleteId: options.athleteId,
    goalSignals: options.goalSignals,
  });
}

/** Public API — query insights. */
export function queryProactiveInsights(options: {
  readonly query: InsightQuery;
  readonly service?: ProactiveInsightsService;
  readonly deps?: ProactiveInsightsServiceDeps;
}): InsightAnalysisResult {
  return resolveService(options.service, options.deps).query(options.query);
}

/** Dashboard API — top prioritized insights. */
export function getTopInsights(options: {
  readonly athleteId: string;
  readonly limit?: number;
  readonly service?: ProactiveInsightsService;
  readonly deps?: ProactiveInsightsServiceDeps;
}): readonly CoachInsight[] {
  return resolveService(options.service, options.deps).getTopInsights(
    options.athleteId,
    options.limit ?? 5,
  );
}

/** Dashboard API — latest insights. */
export function getLatestInsights(options: {
  readonly athleteId: string;
  readonly limit?: number;
  readonly service?: ProactiveInsightsService;
  readonly deps?: ProactiveInsightsServiceDeps;
}): readonly CoachInsight[] {
  return resolveService(options.service, options.deps).getLatestInsights(
    options.athleteId,
    options.limit ?? 5,
  );
}

/** Dashboard API — critical / high severity insights. */
export function getCriticalInsights(options: {
  readonly athleteId: string;
  readonly service?: ProactiveInsightsService;
  readonly deps?: ProactiveInsightsServiceDeps;
}): readonly CoachInsight[] {
  return resolveService(options.service, options.deps).getCriticalInsights(
    options.athleteId,
  );
}

/** Dashboard API — recovery domain insights. */
export function getRecoveryInsights(options: {
  readonly athleteId: string;
  readonly service?: ProactiveInsightsService;
  readonly deps?: ProactiveInsightsServiceDeps;
}): readonly CoachInsight[] {
  return resolveService(options.service, options.deps).getRecoveryInsights(
    options.athleteId,
  );
}

/** Dashboard API — goal domain insights. */
export function getGoalInsights(options: {
  readonly athleteId: string;
  readonly service?: ProactiveInsightsService;
  readonly deps?: ProactiveInsightsServiceDeps;
}): readonly CoachInsight[] {
  return resolveService(options.service, options.deps).getGoalInsights(
    options.athleteId,
  );
}

/** Dashboard API — workout domain insights. */
export function getWorkoutInsights(options: {
  readonly athleteId: string;
  readonly service?: ProactiveInsightsService;
  readonly deps?: ProactiveInsightsServiceDeps;
}): readonly CoachInsight[] {
  return resolveService(options.service, options.deps).getWorkoutInsights(
    options.athleteId,
  );
}

/** Dashboard API — nutrition domain insights. */
export function getNutritionInsights(options: {
  readonly athleteId: string;
  readonly service?: ProactiveInsightsService;
  readonly deps?: ProactiveInsightsServiceDeps;
}): readonly CoachInsight[] {
  return resolveService(options.service, options.deps).getNutritionInsights(
    options.athleteId,
  );
}

/** Public API — filter insights. */
export function filterProactiveInsights(options: {
  readonly athleteId: string;
  readonly filter: InsightFilter;
  readonly service?: ProactiveInsightsService;
  readonly deps?: ProactiveInsightsServiceDeps;
}): readonly CoachInsight[] {
  return resolveService(options.service, options.deps).filter(
    options.athleteId,
    options.filter,
  );
}

/** Public API — create insight snapshot. */
export function createInsightSnapshot(options: {
  readonly athleteId: string;
  readonly service?: ProactiveInsightsService;
  readonly deps?: ProactiveInsightsServiceDeps;
}): CoachInsightSnapshot {
  return resolveService(options.service, options.deps).createSnapshot(
    options.athleteId,
  );
}

/** Public API — validate insights. */
export function validateProactiveInsights(options: {
  readonly athleteId: string;
  readonly service?: ProactiveInsightsService;
  readonly deps?: ProactiveInsightsServiceDeps;
}): InsightValidation {
  return resolveService(options.service, options.deps).validate(
    options.athleteId,
  );
}

export type { ProactiveInsightsServiceDeps };
