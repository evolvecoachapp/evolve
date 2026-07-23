import {
  prepareCoachingContext,
  summarizeCoachingContext,
} from "../../coach-intelligence/application";
import type { CoachEngineResult } from "../../coach-intelligence/models/CoachEngineResult";
import type { CoachingContextSummary } from "../../coach-intelligence/models/CoachingContextSummary";
import { generateInsights } from "../../insight-engine/application";
import type { InsightEngineResult } from "../../insight-engine/models/InsightEngineResult";
import type { FoundationToolResult } from "../../tool-calling/models/FoundationToolResult";
import type { ToolCallRequest } from "../../tool-calling/models/ToolCallRequest";
import type { ToolParameter } from "../../tool-calling/models/ToolParameter";
import type { FoundationToolResultBuilder } from "../builders/FoundationToolResultBuilder";
import { CoachRequestMapper } from "../mappers/CoachRequestMapper";
import { CoachResultMapper } from "../mappers/CoachResultMapper";
import { DomainToolIds } from "../models/DomainToolIds";
import {
  BaseDomainToolAdapter,
  type BaseDomainToolAdapterDeps,
  type DomainToolCatalogEntry,
} from "./BaseDomainToolAdapter";

export interface CoachToolAdapterDeps extends BaseDomainToolAdapterDeps {
  readonly prepareCoachingContext?: (
    options: Parameters<typeof prepareCoachingContext>[0],
  ) => CoachEngineResult;
  readonly generateInsights?: (
    options: Parameters<typeof generateInsights>[0],
  ) => InsightEngineResult;
  readonly summarizeCoachingContext?: (
    contextOrSnapshot: Parameters<typeof summarizeCoachingContext>[0],
  ) => CoachingContextSummary;
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
    id: DomainToolIds.COACH_PREPARE_CONTEXT,
    name: "Prepare Coaching Context",
    description:
      "Prepare coaching context via Coach Intelligence (domain source of truth).",
    capabilities: Object.freeze(["coach_summary", "query"] as const),
    schema: Object.freeze({
      parameters: Object.freeze([
        OBJECT_PARAM("insightSnapshot", "InsightSnapshot payload"),
        OBJECT_PARAM("recoverySnapshot", "Optional RecoverySnapshot", false),
        OBJECT_PARAM("athleteHistory", "Optional AthleteHistory", false),
      ]),
      returns: "CoachEngineResult",
    }),
  }),
  Object.freeze({
    id: DomainToolIds.COACH_GENERATE_INSIGHTS,
    name: "Generate Insights",
    description:
      "Generate domain insights via Insight Engine (domain source of truth).",
    capabilities: Object.freeze(["coach_summary", "query"] as const),
    schema: Object.freeze({
      parameters: Object.freeze([
        OBJECT_PARAM("performanceSnapshot", "PerformanceSnapshot payload"),
        OBJECT_PARAM("achievementResult", "AchievementResult payload"),
        OBJECT_PARAM("recoverySnapshot", "RecoverySnapshot payload"),
        OBJECT_PARAM("athleteHistory", "AthleteHistory payload"),
      ]),
      returns: "InsightEngineResult",
    }),
  }),
  Object.freeze({
    id: DomainToolIds.COACH_SUMMARIZE,
    name: "Summarize Coaching Context",
    description: "Summarize a coaching context or snapshot.",
    capabilities: Object.freeze(["coach_summary", "query"] as const),
    schema: Object.freeze({
      parameters: Object.freeze([
        OBJECT_PARAM(
          "contextOrSnapshot",
          "CoachingContext or CoachContextSnapshot",
        ),
      ]),
      returns: "CoachingContextSummary",
    }),
  }),
]);

/**
 * Coach domain tool adapter.
 *
 * Maps tool requests to Coach Intelligence / Insight Engine APIs.
 * No coaching business logic.
 */
export class CoachToolAdapter extends BaseDomainToolAdapter {
  private readonly prepare: NonNullable<
    CoachToolAdapterDeps["prepareCoachingContext"]
  >;
  private readonly insights: NonNullable<
    CoachToolAdapterDeps["generateInsights"]
  >;
  private readonly summarize: NonNullable<
    CoachToolAdapterDeps["summarizeCoachingContext"]
  >;

  constructor(deps: CoachToolAdapterDeps = {}) {
    super("adapter.coach", "coach", CATALOG, deps);
    this.prepare = deps.prepareCoachingContext ?? prepareCoachingContext;
    this.insights = deps.generateInsights ?? generateInsights;
    this.summarize =
      deps.summarizeCoachingContext ?? summarizeCoachingContext;
  }

  protected async executeMapped(
    request: ToolCallRequest,
    startedMs: number,
    base: FoundationToolResultBuilder,
  ): Promise<FoundationToolResult> {
    const mapped = CoachRequestMapper.map(
      request.call.toolId,
      request.call.input,
    );
    if (!mapped.ok) {
      return this.finishFailure(
        base,
        startedMs,
        "invalid_parameters",
        "Coach input mapping failed",
        { issues: mapped.issues },
      );
    }

    let domainResult:
      | CoachEngineResult
      | InsightEngineResult
      | CoachingContextSummary;

    if (mapped.mapped.toolId === DomainToolIds.COACH_PREPARE_CONTEXT) {
      const { toolId: _toolId, ...options } = mapped.mapped;
      domainResult = this.prepare(options);
    } else if (
      mapped.mapped.toolId === DomainToolIds.COACH_GENERATE_INSIGHTS
    ) {
      const { toolId: _toolId, ...options } = mapped.mapped;
      domainResult = this.insights(options);
    } else {
      domainResult = this.summarize(mapped.mapped.contextOrSnapshot);
    }

    const output = CoachResultMapper.map(domainResult);
    if (!output.ok) {
      return this.finishFailure(
        base,
        startedMs,
        "invalid_output",
        "Coach output mapping failed",
        { issues: output.issues },
      );
    }

    return this.finishSuccess(base, startedMs, output.output.data);
  }
}

export function createCoachToolAdapter(
  deps: CoachToolAdapterDeps = {},
): CoachToolAdapter {
  return new CoachToolAdapter(deps);
}
