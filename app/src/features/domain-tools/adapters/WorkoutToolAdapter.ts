import { analyzeWorkoutPerformance } from "../../performance-engine/application";
import type { PerformanceEngineResult } from "../../performance-engine/models/PerformanceEngineResult";
import { generateWorkoutProgram } from "../../program-generation/application";
import type { WorkoutGenerationResult } from "../../program-generation/models/WorkoutGenerationResult";
import type { FoundationToolResult } from "../../tool-calling/models/FoundationToolResult";
import type { ToolCallRequest } from "../../tool-calling/models/ToolCallRequest";
import type { ToolParameter } from "../../tool-calling/models/ToolParameter";
import type { FoundationToolResultBuilder } from "../builders/FoundationToolResultBuilder";
import { WorkoutRequestMapper } from "../mappers/WorkoutRequestMapper";
import { WorkoutResultMapper } from "../mappers/WorkoutResultMapper";
import { DomainToolIds } from "../models/DomainToolIds";
import {
  BaseDomainToolAdapter,
  type BaseDomainToolAdapterDeps,
  type DomainToolCatalogEntry,
} from "./BaseDomainToolAdapter";

export interface WorkoutToolAdapterDeps extends BaseDomainToolAdapterDeps {
  readonly generateWorkoutProgram?: (
    request: Parameters<typeof generateWorkoutProgram>[0],
  ) => Promise<WorkoutGenerationResult>;
  readonly analyzeWorkoutPerformance?: (
    workoutResult: Parameters<typeof analyzeWorkoutPerformance>[0],
    eventStream: Parameters<typeof analyzeWorkoutPerformance>[1],
    options?: Parameters<typeof analyzeWorkoutPerformance>[2],
  ) => PerformanceEngineResult;
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
    id: DomainToolIds.WORKOUT_GENERATE,
    name: "Generate Workout Program",
    description:
      "Generate a workout program via Program Generation (domain source of truth).",
    capabilities: Object.freeze(["workout_summary", "query"] as const),
    schema: Object.freeze({
      parameters: Object.freeze([
        OBJECT_PARAM("request", "WorkoutGenerationRequest payload"),
      ]),
      returns: "WorkoutGenerationResult",
    }),
  }),
  Object.freeze({
    id: DomainToolIds.WORKOUT_ANALYZE_PERFORMANCE,
    name: "Analyze Workout Performance",
    description:
      "Analyze a completed workout via Performance Engine (domain source of truth).",
    capabilities: Object.freeze(["workout_summary", "query"] as const),
    schema: Object.freeze({
      parameters: Object.freeze([
        OBJECT_PARAM("workoutResult", "WorkoutResult payload"),
        OBJECT_PARAM("eventStream", "EventStream payload"),
        OBJECT_PARAM("decisionReport", "Optional DecisionReport", false),
      ]),
      returns: "PerformanceEngineResult",
    }),
  }),
]);

/**
 * Workout domain tool adapter.
 *
 * Maps tool requests to Program Generation / Performance Engine APIs.
 * No workout business logic.
 */
export class WorkoutToolAdapter extends BaseDomainToolAdapter {
  private readonly generate: NonNullable<
    WorkoutToolAdapterDeps["generateWorkoutProgram"]
  >;
  private readonly analyze: NonNullable<
    WorkoutToolAdapterDeps["analyzeWorkoutPerformance"]
  >;

  constructor(deps: WorkoutToolAdapterDeps = {}) {
    super("adapter.workout", "workout", CATALOG, deps);
    this.generate = deps.generateWorkoutProgram ?? generateWorkoutProgram;
    this.analyze =
      deps.analyzeWorkoutPerformance ?? analyzeWorkoutPerformance;
  }

  protected async executeMapped(
    request: ToolCallRequest,
    startedMs: number,
    base: FoundationToolResultBuilder,
  ): Promise<FoundationToolResult> {
    const mapped = WorkoutRequestMapper.map(
      request.call.toolId,
      request.call.input,
    );
    if (!mapped.ok) {
      return this.finishFailure(
        base,
        startedMs,
        "invalid_parameters",
        "Workout input mapping failed",
        { issues: mapped.issues },
      );
    }

    let domainResult: WorkoutGenerationResult | PerformanceEngineResult;
    if (mapped.mapped.toolId === DomainToolIds.WORKOUT_GENERATE) {
      domainResult = await this.generate(mapped.mapped.request);
    } else {
      domainResult = this.analyze(
        mapped.mapped.workoutResult,
        mapped.mapped.eventStream,
        {
          decisionReport: mapped.mapped.decisionReport,
          analyzedAt: mapped.mapped.analyzedAt,
          snapshotId: mapped.mapped.snapshotId,
        },
      );
    }

    const output = WorkoutResultMapper.map(domainResult);
    if (!output.ok) {
      return this.finishFailure(
        base,
        startedMs,
        "invalid_output",
        "Workout output mapping failed",
        { issues: output.issues },
      );
    }

    return this.finishSuccess(base, startedMs, output.output.data);
  }
}

export function createWorkoutToolAdapter(
  deps: WorkoutToolAdapterDeps = {},
): WorkoutToolAdapter {
  return new WorkoutToolAdapter(deps);
}
