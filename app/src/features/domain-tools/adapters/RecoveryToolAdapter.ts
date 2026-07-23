import {
  analyzeRecovery,
  summarizeRecovery,
} from "../../recovery-intelligence/application";
import type { RecoveryEngineResult } from "../../recovery-intelligence/models/RecoveryEngineResult";
import type { RecoverySummary } from "../../recovery-intelligence/models/RecoverySummary";
import type { FoundationToolResult } from "../../tool-calling/models/FoundationToolResult";
import type { ToolCallRequest } from "../../tool-calling/models/ToolCallRequest";
import type { ToolParameter } from "../../tool-calling/models/ToolParameter";
import type { FoundationToolResultBuilder } from "../builders/FoundationToolResultBuilder";
import { RecoveryRequestMapper } from "../mappers/RecoveryRequestMapper";
import { RecoveryResultMapper } from "../mappers/RecoveryResultMapper";
import { DomainToolIds } from "../models/DomainToolIds";
import {
  BaseDomainToolAdapter,
  type BaseDomainToolAdapterDeps,
  type DomainToolCatalogEntry,
} from "./BaseDomainToolAdapter";

export interface RecoveryToolAdapterDeps extends BaseDomainToolAdapterDeps {
  readonly analyzeRecovery?: (
    options: Parameters<typeof analyzeRecovery>[0],
  ) => RecoveryEngineResult;
  readonly summarizeRecovery?: (
    snapshot: Parameters<typeof summarizeRecovery>[0],
  ) => RecoverySummary;
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
    id: DomainToolIds.RECOVERY_ANALYZE,
    name: "Analyze Recovery",
    description:
      "Analyze recovery via Recovery Intelligence (domain source of truth).",
    capabilities: Object.freeze(["query"] as const),
    schema: Object.freeze({
      parameters: Object.freeze([
        OBJECT_PARAM("athleteHistory", "AthleteHistory payload"),
        OBJECT_PARAM("performanceSnapshot", "PerformanceSnapshot payload"),
        OBJECT_PARAM("workoutResult", "Optional WorkoutResult", false),
        OBJECT_PARAM("achievementResult", "Optional AchievementResult", false),
      ]),
      returns: "RecoveryEngineResult",
    }),
  }),
  Object.freeze({
    id: DomainToolIds.RECOVERY_SUMMARIZE,
    name: "Summarize Recovery",
    description:
      "Summarize a recovery snapshot via Recovery Intelligence.",
    capabilities: Object.freeze(["query"] as const),
    schema: Object.freeze({
      parameters: Object.freeze([
        OBJECT_PARAM("snapshot", "RecoverySnapshot or metrics parts"),
      ]),
      returns: "RecoverySummary",
    }),
  }),
]);

/**
 * Recovery domain tool adapter.
 *
 * Maps tool requests to Recovery Intelligence APIs.
 * No recovery business logic.
 */
export class RecoveryToolAdapter extends BaseDomainToolAdapter {
  private readonly analyze: NonNullable<
    RecoveryToolAdapterDeps["analyzeRecovery"]
  >;
  private readonly summarize: NonNullable<
    RecoveryToolAdapterDeps["summarizeRecovery"]
  >;

  constructor(deps: RecoveryToolAdapterDeps = {}) {
    super("adapter.recovery", "recovery", CATALOG, deps);
    this.analyze = deps.analyzeRecovery ?? analyzeRecovery;
    this.summarize = deps.summarizeRecovery ?? summarizeRecovery;
  }

  protected async executeMapped(
    request: ToolCallRequest,
    startedMs: number,
    base: FoundationToolResultBuilder,
  ): Promise<FoundationToolResult> {
    const mapped = RecoveryRequestMapper.map(
      request.call.toolId,
      request.call.input,
    );
    if (!mapped.ok) {
      return this.finishFailure(
        base,
        startedMs,
        "invalid_parameters",
        "Recovery input mapping failed",
        { issues: mapped.issues },
      );
    }

    let domainResult: RecoveryEngineResult | RecoverySummary;
    if (mapped.mapped.toolId === DomainToolIds.RECOVERY_ANALYZE) {
      const { toolId: _toolId, ...options } = mapped.mapped;
      domainResult = this.analyze(options);
    } else {
      domainResult = this.summarize(mapped.mapped.snapshot);
    }

    const output = RecoveryResultMapper.map(domainResult);
    if (!output.ok) {
      return this.finishFailure(
        base,
        startedMs,
        "invalid_output",
        "Recovery output mapping failed",
        { issues: output.issues },
      );
    }

    return this.finishSuccess(base, startedMs, output.output.data);
  }
}

export function createRecoveryToolAdapter(
  deps: RecoveryToolAdapterDeps = {},
): RecoveryToolAdapter {
  return new RecoveryToolAdapter(deps);
}
