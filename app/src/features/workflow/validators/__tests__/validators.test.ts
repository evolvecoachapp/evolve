import {
  validateWorkflow,
  validateWorkflowDefinition,
  validateWorkflowRequest,
  validateWorkflowResult,
  validateWorkflowStep,
} from "../index";
import { GenerateWorkoutWorkflow } from "../../workflows/placeholders/GenerateWorkoutWorkflow";
import { WorkflowError } from "../../models/WorkflowError";
import {
  createWorkflowDefinition,
  createWorkflowRequest,
  createWorkflowResult,
  createWorkflowStep,
  FIXED_TIMESTAMP,
} from "../../testSupport/fixtures";

describe("workflow validators", () => {
  it("validateWorkflow accepts placeholder workflows", () => {
    expect(validateWorkflow(new GenerateWorkoutWorkflow())).toEqual([]);
  });

  it("validateWorkflowDefinition rejects missing name", () => {
    expect(
      validateWorkflowDefinition(createWorkflowDefinition({ name: "" })),
    ).toContain("missing_name");
  });

  it("validateWorkflowRequest accepts a well-formed request", () => {
    expect(validateWorkflowRequest(createWorkflowRequest())).toEqual([]);
  });

  it("validateWorkflowRequest rejects missing workflow name", () => {
    expect(
      validateWorkflowRequest(createWorkflowRequest({ workflowName: "" })),
    ).toContain("missing_workflow_name");
  });

  it("validateWorkflowStep rejects invalid order and retries", () => {
    expect(
      validateWorkflowStep(createWorkflowStep({ order: -1 })),
    ).toContain("invalid_order");
    expect(
      validateWorkflowStep(createWorkflowStep({ maxRetries: -1 })),
    ).toContain("invalid_max_retries");
  });

  it("validateWorkflowResult enforces status/error consistency", () => {
    expect(validateWorkflowResult(createWorkflowResult())).toEqual([]);
    expect(
      validateWorkflowResult(
        createWorkflowResult({
          status: "failed",
          error: null,
          data: null,
        }),
      ),
    ).toContain("error_status_mismatch");

    expect(
      validateWorkflowResult(
        createWorkflowResult({
          status: "succeeded",
          error: new WorkflowError("x", "y"),
          completedAt: FIXED_TIMESTAMP,
        }),
      ),
    ).toContain("error_status_mismatch");
  });
});
