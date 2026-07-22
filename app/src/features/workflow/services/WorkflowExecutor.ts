import type { ToolContext } from "../../tool-calling/models/ToolContext";
import type { ToolRequest } from "../../tool-calling/models/ToolRequest";
import type { ToolResult } from "../../tool-calling/models/ToolResult";
import type { ToolExecutor } from "../../tool-calling/services/ToolExecutor";
import type { WorkflowContext } from "../models/WorkflowContext";
import type { WorkflowExecution } from "../models/WorkflowExecution";
import { WorkflowError } from "../models/WorkflowError";
import type { WorkflowRequest } from "../models/WorkflowRequest";
import type { WorkflowResult } from "../models/WorkflowResult";
import type { WorkflowStep } from "../models/WorkflowStep";
import type { WorkflowRegistry } from "../registry/WorkflowRegistry";
import { deepCloneWorkflowRequest } from "../utils/deepCloneWorkflowRequest";
import { validateWorkflowRequest } from "../validators/validateWorkflowRequest";
import { validateWorkflowResult } from "../validators/validateWorkflowResult";
import { WorkflowPlanner } from "./WorkflowPlanner";

/**
 * Resolves and executes WorkflowRequests against the domain WorkflowRegistry.
 *
 * Every step action delegates to ToolExecutor.
 * Never talks to AI providers. Never performs networking.
 * Never accesses repositories directly.
 */
export class WorkflowExecutor {
  constructor(
    private readonly registry: WorkflowRegistry,
    private readonly toolExecutor: ToolExecutor,
    private readonly planner: WorkflowPlanner = new WorkflowPlanner(),
  ) {}

  /**
   * Validate → resolve → plan → execute steps → return WorkflowResult.
   */
  async execute(
    request: WorkflowRequest,
    context: WorkflowContext,
  ): Promise<WorkflowResult> {
    const cloned = deepCloneWorkflowRequest(request);
    const requestIssues = validateWorkflowRequest(cloned);
    if (requestIssues.length > 0) {
      throw new WorkflowError(
        "invalid_request",
        `Invalid workflow request: ${requestIssues.join(",")}`,
        { issues: requestIssues, requestId: cloned.id },
      );
    }

    const workflow = this.registry.get(cloned.workflowName);
    if (!workflow) {
      throw new WorkflowError(
        "workflow_not_found",
        `Workflow not found: ${cloned.workflowName}`,
        { workflowName: cloned.workflowName, requestId: cloned.id },
      );
    }

    const workflowIssues = workflow.validate(cloned);
    if (workflowIssues.length > 0) {
      return freezeResult({
        executionId: createId("wexec"),
        requestId: cloned.id,
        workflowName: cloned.workflowName,
        status: "failed",
        data: null,
        error: new WorkflowError(
          "invalid_arguments",
          `Invalid workflow arguments: ${workflowIssues.join(",")}`,
          {
            issues: workflowIssues,
            requestId: cloned.id,
          },
        ),
        completedAt: context.now,
      });
    }

    const execution: WorkflowExecution = Object.freeze({
      id: createId("wexec"),
      requestId: cloned.id,
      workflowName: cloned.workflowName,
      status: "running",
      startedAt: context.now,
      completedAt: null,
    });

    try {
      const steps = this.planner.expand(workflow, cloned, context);
      const stepResults: ToolResult[] = [];
      let priorSucceeded = true;

      for (const step of steps) {
        if (!shouldRunStep(step, context, priorSucceeded)) {
          continue;
        }

        const toolResult = await this.executeStepWithRetries(
          step,
          cloned,
          context,
        );
        stepResults.push(toolResult);

        if (toolResult.status === "failed") {
          priorSucceeded = false;
          return freezeResult({
            executionId: execution.id,
            requestId: cloned.id,
            workflowName: cloned.workflowName,
            status: "failed",
            data: Object.freeze({
              stepId: step.id,
              stepResults: Object.freeze([...stepResults]),
            }),
            error: new WorkflowError(
              "step_failed",
              `Workflow step failed: ${step.name}`,
              {
                stepId: step.id,
                toolName: step.toolName,
                toolErrorCode: toolResult.error?.code ?? null,
                requestId: cloned.id,
              },
            ),
            completedAt: context.now,
          });
        }

        priorSucceeded = true;

        if (step.earlyExitOnSuccess) {
          break;
        }
      }

      const data = await workflow.execute(cloned, context, stepResults);
      const result = freezeResult({
        executionId: execution.id,
        requestId: cloned.id,
        workflowName: cloned.workflowName,
        status: "succeeded",
        data,
        error: null,
        completedAt: context.now,
      });

      const resultIssues = validateWorkflowResult(result);
      if (resultIssues.length > 0) {
        throw new WorkflowError(
          "invalid_result",
          `Invalid workflow result: ${resultIssues.join(",")}`,
          { issues: resultIssues, requestId: cloned.id },
        );
      }

      return result;
    } catch (error: unknown) {
      if (error instanceof WorkflowError && error.code === "invalid_result") {
        throw error;
      }
      if (error instanceof WorkflowError && error.code === "invalid_plan") {
        throw error;
      }
      if (error instanceof WorkflowError && error.code === "invalid_step") {
        throw error;
      }

      const workflowError =
        error instanceof WorkflowError
          ? error
          : new WorkflowError(
              "execution_failed",
              error instanceof Error
                ? error.message
                : "Workflow execution failed.",
              {
                workflowName: cloned.workflowName,
                requestId: cloned.id,
              },
            );

      return freezeResult({
        executionId: execution.id,
        requestId: cloned.id,
        workflowName: cloned.workflowName,
        status: "failed",
        data: null,
        error: workflowError,
        completedAt: context.now,
      });
    }
  }

  private async executeStepWithRetries(
    step: WorkflowStep,
    request: WorkflowRequest,
    context: WorkflowContext,
  ): Promise<ToolResult> {
    const attempts = step.maxRetries + 1;
    let lastResult: ToolResult | null = null;

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const toolRequest: ToolRequest = Object.freeze({
        id: `${request.id}:${step.id}:${attempt}`,
        toolName: step.toolName,
        arguments: Object.freeze([...step.arguments]),
        requestedAt: context.now,
      });

      const toolContext: ToolContext = Object.freeze({
        conversationId: context.conversationId,
        athleteId: context.athleteId,
        now: context.now,
        metadata: context.metadata,
      });

      lastResult = await this.toolExecutor.execute(toolRequest, toolContext);
      if (lastResult.status === "succeeded") {
        return lastResult;
      }
    }

    return lastResult as ToolResult;
  }
}

function shouldRunStep(
  step: WorkflowStep,
  context: WorkflowContext,
  priorSucceeded: boolean,
): boolean {
  if (!step.conditional) {
    return true;
  }

  if (step.conditionKey) {
    const value = context.metadata?.[step.conditionKey];
    return Boolean(value);
  }

  return priorSucceeded;
}

function freezeResult(result: WorkflowResult): WorkflowResult {
  return Object.freeze({
    ...result,
    error: result.error,
  });
}

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}
