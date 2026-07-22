import type { ToolArgument } from "../../tool-calling/models/ToolArgument";
import type { WorkflowContext } from "../models/WorkflowContext";
import type { WorkflowDefinition } from "../models/WorkflowDefinition";
import type { WorkflowRequest } from "../models/WorkflowRequest";
import type { WorkflowResult } from "../models/WorkflowResult";
import type { WorkflowStep } from "../models/WorkflowStep";
import { WorkflowError } from "../models/WorkflowError";

export const FIXED_TIMESTAMP = "2026-07-22T12:00:00.000Z";

export function createWorkflowArgument(
  overrides: Partial<ToolArgument> = {},
): ToolArgument {
  return Object.freeze({
    name: overrides.name ?? "limit",
    value: overrides.value ?? 5,
  });
}

export function createWorkflowRequest(
  overrides: Partial<WorkflowRequest> = {},
): WorkflowRequest {
  return Object.freeze({
    id: overrides.id ?? "workflow-req-1",
    workflowName: overrides.workflowName ?? "generate_workout",
    arguments: Object.freeze(
      overrides.arguments ? [...overrides.arguments] : [],
    ),
    requestedAt: overrides.requestedAt ?? FIXED_TIMESTAMP,
  });
}

export function createWorkflowContext(
  overrides: Partial<WorkflowContext> = {},
): WorkflowContext {
  return Object.freeze({
    conversationId: overrides.conversationId ?? "conv-1",
    athleteId: overrides.athleteId ?? "athlete-1",
    now: overrides.now ?? FIXED_TIMESTAMP,
    metadata: overrides.metadata
      ? Object.freeze({ ...overrides.metadata })
      : undefined,
  });
}

export function createWorkflowDefinition(
  overrides: Partial<WorkflowDefinition> = {},
): WorkflowDefinition {
  return Object.freeze({
    name: overrides.name ?? "generate_workout",
    description: overrides.description ?? "Plan a workout generation workflow",
    capabilities: Object.freeze(
      overrides.capabilities ?? (["generate_workout"] as const),
    ),
    metadata: Object.freeze({
      version: overrides.metadata?.version ?? "1.0.0",
      tags: Object.freeze(
        overrides.metadata?.tags
          ? [...overrides.metadata.tags]
          : ["generate_workout"],
      ),
      createdAt: overrides.metadata?.createdAt ?? FIXED_TIMESTAMP,
    }),
  });
}

export function createWorkflowStep(
  overrides: Partial<WorkflowStep> = {},
): WorkflowStep {
  return Object.freeze({
    id: overrides.id ?? "step-1",
    name: overrides.name ?? "load_athlete_profile",
    toolName: overrides.toolName ?? "get_athlete_profile",
    arguments: Object.freeze(
      overrides.arguments ? [...overrides.arguments] : [],
    ),
    order: overrides.order ?? 0,
    conditional: overrides.conditional ?? false,
    conditionKey: overrides.conditionKey,
    earlyExitOnSuccess: overrides.earlyExitOnSuccess ?? false,
    maxRetries: overrides.maxRetries ?? 0,
  });
}

export function createWorkflowResult(
  overrides: Partial<WorkflowResult> = {},
): WorkflowResult {
  return Object.freeze({
    executionId: overrides.executionId ?? "wexec-1",
    requestId: overrides.requestId ?? "workflow-req-1",
    workflowName: overrides.workflowName ?? "generate_workout",
    status: overrides.status ?? "succeeded",
    data: overrides.data ?? Object.freeze({ placeholder: true }),
    error: overrides.error ?? null,
    completedAt: overrides.completedAt ?? FIXED_TIMESTAMP,
  });
}

export function createFailedWorkflowResult(
  overrides: Partial<WorkflowResult> = {},
): WorkflowResult {
  return createWorkflowResult({
    status: "failed",
    data: null,
    error:
      overrides.error ??
      new WorkflowError("execution_failed", "Workflow failed.", {
        workflowName: overrides.workflowName ?? "generate_workout",
      }),
    ...overrides,
  });
}
