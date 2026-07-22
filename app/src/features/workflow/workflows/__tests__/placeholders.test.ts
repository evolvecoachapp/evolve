import { AnalyzeProgressWorkflow } from "../placeholders/AnalyzeProgressWorkflow";
import { BuildNutritionOverviewWorkflow } from "../placeholders/BuildNutritionOverviewWorkflow";
import { GenerateWorkoutWorkflow } from "../placeholders/GenerateWorkoutWorkflow";
import { PlanDeloadWorkflow } from "../placeholders/PlanDeloadWorkflow";
import { RecommendRecoveryWorkflow } from "../placeholders/RecommendRecoveryWorkflow";
import { createDefaultWorkflowRegistry } from "../../services/createWorkflowExecutor";
import {
  createWorkflowContext,
  createWorkflowRequest,
  FIXED_TIMESTAMP,
} from "../../testSupport/fixtures";

describe("placeholder workflows", () => {
  const context = createWorkflowContext();
  const request = createWorkflowRequest();

  it("exposes stable names and capabilities", () => {
    expect(new GenerateWorkoutWorkflow().name()).toBe("generate_workout");
    expect(new AnalyzeProgressWorkflow().capabilities()).toEqual([
      "analyze_progress",
    ]);
    expect(new RecommendRecoveryWorkflow().name()).toBe("recommend_recovery");
    expect(new PlanDeloadWorkflow().name()).toBe("plan_deload");
    expect(new BuildNutritionOverviewWorkflow().capabilities()).toEqual([
      "build_nutrition_overview",
    ]);
  });

  it("plans ordered steps without business logic", () => {
    const workoutSteps = new GenerateWorkoutWorkflow().plan(request, context);
    const progressSteps = new AnalyzeProgressWorkflow().plan(request, context);
    const nutritionSteps = new BuildNutritionOverviewWorkflow().plan(
      request,
      context,
    );

    expect(workoutSteps.map((step) => step.toolName)).toEqual([
      "get_athlete_profile",
      "get_workout_history",
    ]);
    expect(progressSteps.map((step) => step.toolName)).toEqual([
      "get_workout_summary",
      "get_coach_summary",
    ]);
    expect(nutritionSteps.map((step) => step.toolName)).toEqual([
      "get_athlete_profile",
      "get_coach_summary",
    ]);
  });

  it("execute returns local placeholder payloads", async () => {
    const data = await new GenerateWorkoutWorkflow().execute(
      request,
      context,
      [],
    );

    expect(data).toMatchObject({
      kind: "generate_workout",
      placeholder: true,
      stepCount: 0,
      capturedAt: FIXED_TIMESTAMP,
    });
  });

  it("createDefaultWorkflowRegistry registers all placeholders and freezes", () => {
    const registry = createDefaultWorkflowRegistry();

    expect(registry.isFrozen()).toBe(true);
    expect([...registry.list()].map((workflow) => workflow.name()).sort()).toEqual([
      "analyze_progress",
      "build_nutrition_overview",
      "generate_workout",
      "plan_deload",
      "recommend_recovery",
    ]);
  });
});
