import { evaluateAchievements } from "../../achievement-engine/application";
import type { AchievementEngineResult } from "../../achievement-engine/models/AchievementEngineResult";
import {
  buildAthleteHistory,
  summarizeHistory,
} from "../../athlete-history/application";
import type { HistoryEngineResult } from "../../athlete-history/models/HistoryEngineResult";
import type { HistorySummary } from "../../athlete-history/models/HistorySummary";
import type { FoundationToolResult } from "../../tool-calling/models/FoundationToolResult";
import type { ToolCallRequest } from "../../tool-calling/models/ToolCallRequest";
import type { ToolParameter } from "../../tool-calling/models/ToolParameter";
import type { FoundationToolResultBuilder } from "../builders/FoundationToolResultBuilder";
import { AthleteRequestMapper } from "../mappers/AthleteRequestMapper";
import { AthleteResultMapper } from "../mappers/AthleteResultMapper";
import { DomainToolIds } from "../models/DomainToolIds";
import {
  BaseDomainToolAdapter,
  type BaseDomainToolAdapterDeps,
  type DomainToolCatalogEntry,
} from "./BaseDomainToolAdapter";

export interface AthleteToolAdapterDeps extends BaseDomainToolAdapterDeps {
  readonly buildAthleteHistory?: (
    options: Parameters<typeof buildAthleteHistory>[0],
  ) => HistoryEngineResult;
  readonly summarizeHistory?: (
    historyOrParts: Parameters<typeof summarizeHistory>[0],
  ) => HistorySummary;
  readonly evaluateAchievements?: (
    performanceSnapshot: Parameters<typeof evaluateAchievements>[0],
    workoutResult: Parameters<typeof evaluateAchievements>[1],
    baselineProvider: Parameters<typeof evaluateAchievements>[2],
    options?: Parameters<typeof evaluateAchievements>[3],
  ) => AchievementEngineResult;
}

const OBJECT_PARAM = (
  name: string,
  description: string,
  required = true,
): ToolParameter =>
  Object.freeze({
    name,
    type: "object",
    description,
    required,
    defaultValue: null,
  });

const CATALOG: readonly DomainToolCatalogEntry[] = Object.freeze([
  Object.freeze({
    id: DomainToolIds.ATHLETE_BUILD_HISTORY,
    name: "Build Athlete History",
    description:
      "Build athlete history via Athlete History (domain source of truth).",
    capabilities: Object.freeze(["athlete_profile", "workout_history", "query"] as const),
    schema: Object.freeze({
      parameters: Object.freeze([
        OBJECT_PARAM("workoutResult", "Optional WorkoutResult", false),
        OBJECT_PARAM(
          "performanceSnapshot",
          "Optional PerformanceSnapshot",
          false,
        ),
        OBJECT_PARAM("achievementResult", "Optional AchievementResult", false),
        OBJECT_PARAM("eventStream", "Optional EventStream", false),
      ]),
      returns: "HistoryEngineResult",
    }),
  }),
  Object.freeze({
    id: DomainToolIds.ATHLETE_SUMMARIZE_HISTORY,
    name: "Summarize Athlete History",
    description: "Summarize athlete history via Athlete History.",
    capabilities: Object.freeze(["athlete_profile", "query"] as const),
    schema: Object.freeze({
      parameters: Object.freeze([
        OBJECT_PARAM("historyOrParts", "AthleteHistory or history parts"),
      ]),
      returns: "HistorySummary",
    }),
  }),
  Object.freeze({
    id: DomainToolIds.ATHLETE_EVALUATE_ACHIEVEMENTS,
    name: "Evaluate Achievements",
    description:
      "Evaluate achievements via Achievement Engine (domain source of truth).",
    capabilities: Object.freeze(["athlete_profile", "query"] as const),
    schema: Object.freeze({
      parameters: Object.freeze([
        OBJECT_PARAM("performanceSnapshot", "PerformanceSnapshot payload"),
        OBJECT_PARAM("workoutResult", "WorkoutResult payload"),
        OBJECT_PARAM("baselines", "Optional baseline map", false),
      ]),
      returns: "AchievementEngineResult",
    }),
  }),
]);

/**
 * Athlete domain tool adapter.
 *
 * Maps tool requests to Athlete History / Achievement Engine APIs.
 * No athlete business logic.
 */
export class AthleteToolAdapter extends BaseDomainToolAdapter {
  private readonly buildHistory: NonNullable<
    AthleteToolAdapterDeps["buildAthleteHistory"]
  >;
  private readonly summarize: NonNullable<
    AthleteToolAdapterDeps["summarizeHistory"]
  >;
  private readonly achievements: NonNullable<
    AthleteToolAdapterDeps["evaluateAchievements"]
  >;

  constructor(deps: AthleteToolAdapterDeps = {}) {
    super("adapter.athlete", "athlete", CATALOG, deps);
    this.buildHistory = deps.buildAthleteHistory ?? buildAthleteHistory;
    this.summarize = deps.summarizeHistory ?? summarizeHistory;
    this.achievements = deps.evaluateAchievements ?? evaluateAchievements;
  }

  protected async executeMapped(
    request: ToolCallRequest,
    startedMs: number,
    base: FoundationToolResultBuilder,
  ): Promise<FoundationToolResult> {
    const mapped = AthleteRequestMapper.map(
      request.call.toolId,
      request.call.input,
    );
    if (!mapped.ok) {
      return this.finishFailure(
        base,
        startedMs,
        "invalid_parameters",
        "Athlete input mapping failed",
        { issues: mapped.issues },
      );
    }

    let domainResult:
      | HistoryEngineResult
      | HistorySummary
      | AchievementEngineResult;

    if (mapped.mapped.toolId === DomainToolIds.ATHLETE_BUILD_HISTORY) {
      const { toolId: _toolId, ...options } = mapped.mapped;
      domainResult = this.buildHistory(options);
    } else if (
      mapped.mapped.toolId === DomainToolIds.ATHLETE_SUMMARIZE_HISTORY
    ) {
      domainResult = this.summarize(mapped.mapped.historyOrParts);
    } else {
      domainResult = this.achievements(
        mapped.mapped.performanceSnapshot,
        mapped.mapped.workoutResult,
        mapped.mapped.baselineProvider,
        {
          evaluatedAt: mapped.mapped.evaluatedAt,
          evaluationId: mapped.mapped.evaluationId,
        },
      );
    }

    const output = AthleteResultMapper.map(domainResult);
    if (!output.ok) {
      return this.finishFailure(
        base,
        startedMs,
        "invalid_output",
        "Athlete output mapping failed",
        { issues: output.issues },
      );
    }

    return this.finishSuccess(base, startedMs, output.output.data);
  }
}

export function createAthleteToolAdapter(
  deps: AthleteToolAdapterDeps = {},
): AthleteToolAdapter {
  return new AthleteToolAdapter(deps);
}
