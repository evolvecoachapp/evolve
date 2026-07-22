import { WorkflowPlanner } from "../WorkflowPlanner";
import { GenerateWorkoutWorkflow } from "../../workflows/placeholders/GenerateWorkoutWorkflow";
import { PlanDeloadWorkflow } from "../../workflows/placeholders/PlanDeloadWorkflow";
import { RecommendRecoveryWorkflow } from "../../workflows/placeholders/RecommendRecoveryWorkflow";
import {
  createWorkflowContext,
  createWorkflowRequest,
} from "../../testSupport/fixtures";

describe("WorkflowPlanner", () => {
  const planner = new WorkflowPlanner();

  it("expands a workflow into ordered steps", () => {
    const steps = planner.expand(
      new GenerateWorkoutWorkflow(),
      createWorkflowRequest(),
      createWorkflowContext(),
    );

    expect(steps.map((step) => step.toolName)).toEqual([
      "get_athlete_profile",
      "get_workout_history",
    ]);
    expect(steps[0]?.order).toBeLessThan(steps[1]?.order ?? Number.MAX_SAFE_INTEGER);
  });

  it("preserves conditional and early-exit hooks", () => {
    const recovery = planner.expand(
      new RecommendRecoveryWorkflow(),
      createWorkflowRequest({ workflowName: "recommend_recovery" }),
      createWorkflowContext(),
    );
    expect(recovery[1]?.conditional).toBe(true);
    expect(recovery[1]?.conditionKey).toBe("includeMemory");

    const deload = planner.expand(
      new PlanDeloadWorkflow(),
      createWorkflowRequest({ workflowName: "plan_deload" }),
      createWorkflowContext(),
    );
    expect(deload[1]?.earlyExitOnSuccess).toBe(true);
  });
});
