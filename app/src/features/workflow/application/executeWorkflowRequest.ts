import type { WorkflowContext } from "../models/WorkflowContext";
import type { WorkflowRequest } from "../models/WorkflowRequest";
import type { WorkflowResult } from "../models/WorkflowResult";
import type { WorkflowExecutor } from "../services/WorkflowExecutor";

/**
 * Thin application wrapper — ConversationService owns the lifecycle.
 */
export async function executeWorkflowRequest(
  executor: WorkflowExecutor,
  request: WorkflowRequest,
  context: WorkflowContext,
): Promise<WorkflowResult> {
  return executor.execute(request, context);
}
