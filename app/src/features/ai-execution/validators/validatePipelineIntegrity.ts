import {
  AIExecutionStageOrder,
  type AIExecutionStage,
} from "../models/AIExecutionStage";
import type { AIExecutionTrace } from "../models/AIExecutionTrace";

/**
 * Validate stage order / pipeline integrity from a trace.
 */
export function validatePipelineIntegrity(
  trace: AIExecutionTrace | null | undefined,
): readonly string[] {
  const issues: string[] = [];

  if (!trace) {
    return Object.freeze(["pipeline_trace_missing"]);
  }

  if (!trace.executionId?.trim()) {
    issues.push("pipeline_trace_execution_id_missing");
  }

  const stages = trace.steps.map((step) => step.stage);
  const expected = AIExecutionStageOrder;

  for (let i = 0; i < stages.length; i += 1) {
    const stage = stages[i]!;
    const expectedStage = expected[i];
    if (!expectedStage) {
      issues.push(`pipeline_unexpected_extra_stage:${stage}`);
      continue;
    }
    if (stage !== expectedStage) {
      issues.push(
        `pipeline_stage_order_invalid:expected_${expectedStage}_got_${stage}`,
      );
    }
  }

  const seen = new Set<AIExecutionStage>();
  for (const stage of stages) {
    if (seen.has(stage)) {
      issues.push(`pipeline_stage_duplicate:${stage}`);
    }
    seen.add(stage);
  }

  return Object.freeze(issues);
}
