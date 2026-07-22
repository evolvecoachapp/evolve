import { createToolExecutor } from "../../../tool-calling/services/createToolExecutor";
import { WorkflowError } from "../../models/WorkflowError";
import { InMemoryWorkflowRegistry } from "../../registry/InMemoryWorkflowRegistry";
import { GenerateWorkoutWorkflow } from "../../workflows/placeholders/GenerateWorkoutWorkflow";
import { RecommendRecoveryWorkflow } from "../../workflows/placeholders/RecommendRecoveryWorkflow";
import { PlanDeloadWorkflow } from "../../workflows/placeholders/PlanDeloadWorkflow";
import { WorkflowExecutor } from "../WorkflowExecutor";
import { WorkflowPlanner } from "../WorkflowPlanner";
import {
  createWorkflowContext,
  createWorkflowRequest,
  FIXED_TIMESTAMP,
} from "../../testSupport/fixtures";

describe("WorkflowExecutor", () => {
  function createExecutor() {
    const registry = new InMemoryWorkflowRegistry();
    registry.register(new GenerateWorkoutWorkflow());
    registry.register(new RecommendRecoveryWorkflow());
    registry.register(new PlanDeloadWorkflow());
    registry.freeze();
    return new WorkflowExecutor(
      registry,
      createToolExecutor(),
      new WorkflowPlanner(),
    );
  }

  it("executes a resolved workflow via ToolExecutor and returns succeeded", async () => {
    const executor = createExecutor();
    const result = await executor.execute(
      createWorkflowRequest({ workflowName: "generate_workout" }),
      createWorkflowContext(),
    );

    expect(result.status).toBe("succeeded");
    expect(result.workflowName).toBe("generate_workout");
    expect(result.error).toBeNull();
    expect(result.data).toMatchObject({
      kind: "generate_workout",
      placeholder: true,
      stepCount: 2,
      capturedAt: FIXED_TIMESTAMP,
    });
  });

  it("throws when the workflow is not registered", async () => {
    const executor = createExecutor();

    await expect(
      executor.execute(
        createWorkflowRequest({ workflowName: "missing_workflow" }),
        createWorkflowContext(),
      ),
    ).rejects.toBeInstanceOf(WorkflowError);
  });

  it("skips conditional steps when condition metadata is absent", async () => {
    const executor = createExecutor();
    const result = await executor.execute(
      createWorkflowRequest({ workflowName: "recommend_recovery" }),
      createWorkflowContext({ metadata: undefined }),
    );

    expect(result.status).toBe("succeeded");
    expect(result.data).toMatchObject({
      kind: "recommend_recovery",
      stepCount: 1,
    });
  });

  it("runs conditional steps when condition metadata is truthy", async () => {
    const executor = createExecutor();
    const result = await executor.execute(
      createWorkflowRequest({ workflowName: "recommend_recovery" }),
      createWorkflowContext({
        metadata: Object.freeze({ includeMemory: true }),
      }),
    );

    expect(result.status).toBe("succeeded");
    expect(result.data).toMatchObject({
      kind: "recommend_recovery",
      stepCount: 2,
    });
  });

  it("honors earlyExitOnSuccess and stops remaining steps", async () => {
    const executor = createExecutor();
    const result = await executor.execute(
      createWorkflowRequest({ workflowName: "plan_deload" }),
      createWorkflowContext(),
    );

    expect(result.status).toBe("succeeded");
    expect(result.data).toMatchObject({
      kind: "plan_deload",
      stepCount: 2,
    });
  });
});
