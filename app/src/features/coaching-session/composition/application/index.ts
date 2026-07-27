import type { CoachingSession } from "../models/CoachingSession";
import type { CoachingSessionConfidence } from "../models/CoachingSessionConfidence";
import type { CoachingSessionEvidence } from "../models/CoachingSessionEvidence";
import type { CoachingSessionInsight } from "../models/CoachingSessionInsight";
import type { CoachingSessionResult } from "../models/CoachingSessionResult";
import type { CoachingSessionSummary } from "../models/CoachingSessionSummary";
import type { CoachingSessionValidation } from "../models/CoachingSessionResult";
import {
  createExplainableCoachingSessionService,
  type ExplainableCoachingSessionService,
  type ExplainableCoachingSessionServiceDeps,
} from "../services/ExplainableCoachingSessionService";
import type { BuildCoachingSessionInput } from "../services/buildCoachingSession";

function resolveService(
  service: ExplainableCoachingSessionService | undefined,
  deps: ExplainableCoachingSessionServiceDeps | undefined,
): ExplainableCoachingSessionService {
  if (service) return service;
  return createExplainableCoachingSessionService(deps ?? {});
}

/** Public API — compose an explainable coaching session from existing evidence. */
export function composeCoachingSession(options: {
  readonly input: Omit<
    BuildCoachingSessionInput,
    "generatedAt" | "timelineEntries" | "insights" | "planHistory"
  > & {
    readonly generatedAt?: string;
    readonly timelineEntries?: BuildCoachingSessionInput["timelineEntries"];
    readonly insights?: BuildCoachingSessionInput["insights"];
    readonly planHistory?: BuildCoachingSessionInput["planHistory"];
    readonly planLineageId?: string | null;
    readonly goalSignals?: readonly string[];
  };
  readonly service?: ExplainableCoachingSessionService;
  readonly deps?: ExplainableCoachingSessionServiceDeps;
}): CoachingSessionResult {
  return resolveService(options.service, options.deps).build(options.input);
}

/** Dashboard API — latest coaching session. */
export function getLatestCoachingSession(options: {
  readonly athleteId: string;
  readonly service?: ExplainableCoachingSessionService;
  readonly deps?: ExplainableCoachingSessionServiceDeps;
}): CoachingSession | null {
  return resolveService(options.service, options.deps).getLatest(
    options.athleteId,
  );
}

/** Dashboard API — session summary. */
export function getCoachingSessionSummary(options: {
  readonly athleteId: string;
  readonly service?: ExplainableCoachingSessionService;
  readonly deps?: ExplainableCoachingSessionServiceDeps;
}): CoachingSessionSummary | null {
  return resolveService(options.service, options.deps).getSummary(
    options.athleteId,
  );
}

/** Dashboard API — session evidence. */
export function getCoachingSessionEvidence(options: {
  readonly athleteId: string;
  readonly service?: ExplainableCoachingSessionService;
  readonly deps?: ExplainableCoachingSessionServiceDeps;
}): CoachingSessionEvidence | null {
  return resolveService(options.service, options.deps).getEvidence(
    options.athleteId,
  );
}

/** Dashboard API — session insights. */
export function getCoachingSessionInsights(options: {
  readonly athleteId: string;
  readonly service?: ExplainableCoachingSessionService;
  readonly deps?: ExplainableCoachingSessionServiceDeps;
}): CoachingSessionInsight | null {
  return resolveService(options.service, options.deps).getInsights(
    options.athleteId,
  );
}

/** Dashboard API — session confidence. */
export function getCoachingSessionConfidence(options: {
  readonly athleteId: string;
  readonly service?: ExplainableCoachingSessionService;
  readonly deps?: ExplainableCoachingSessionServiceDeps;
}): CoachingSessionConfidence | null {
  return resolveService(options.service, options.deps).getConfidence(
    options.athleteId,
  );
}

/** Public API — validate latest session for athlete. */
export function validateExplainableCoachingSession(options: {
  readonly athleteId: string;
  readonly service?: ExplainableCoachingSessionService;
  readonly deps?: ExplainableCoachingSessionServiceDeps;
}): CoachingSessionValidation {
  return resolveService(options.service, options.deps).validate(
    options.athleteId,
  );
}

export type { ExplainableCoachingSessionServiceDeps };
