import type { TrainingAdaptationRequest } from "../../training-adaptation/models/TrainingAdaptationRequest";
import type { TrainingAdaptationResult } from "../../training-adaptation/models/TrainingAdaptationResult";
import {
  adaptWorkout,
  buildWorkoutPlan,
  describeWorkoutCapabilities,
  evaluateWorkout,
  processWorkoutRequest,
  validateWorkoutPlan,
} from "../application";
import { WorkoutDomainCapabilities } from "../models/WorkoutDomainCapability";
import { WorkoutDomainInvocationStatuses } from "../models/WorkoutDomainInvocation";
import { WorkoutIntents } from "../models/WorkoutIntent";
import {
  createTestAgentService,
  createWorkoutRequestFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

function createStubAdaptationResult(): TrainingAdaptationResult {
  return {
    requestId: "adapt:stub:1",
    recommendations: Object.freeze([]),
    readiness: { overallScore: 82 },
  } as unknown as TrainingAdaptationResult;
}

function createStubAdaptationRequest(): TrainingAdaptationRequest {
  return {
    blueprint: { id: "bp:stub" },
    progression: { requestId: "prog:stub" },
  } as unknown as TrainingAdaptationRequest;
}

describe("workout-agent application", () => {
  it("describeWorkoutCapabilities returns frozen agent", () => {
    const service = createTestAgentService();
    const agent = describeWorkoutCapabilities({ service });
    expect(agent.name).toBe("Workout Agent");
    expect(agent.capabilities.length).toBeGreaterThan(0);
    expect(agent.capabilities).toContain("domain_orchestration");
    expect(Object.isFrozen(agent)).toBe(true);
  });

  it("processWorkoutRequest returns immutable result with domain selections", () => {
    const service = createTestAgentService();
    const result = processWorkoutRequest({
      service,
      request: createWorkoutRequestFixture(),
    });
    expect(result.success).toBe(true);
    expect(result.decision.accepted).toBe(true);
    expect(result.decision.proposal).not.toBeNull();
    expect(Object.isFrozen(result)).toBe(true);
    expect(result.startedAt).toBe(FIXED_TIMESTAMP);
    expect(result.domainInvocations.length).toBeGreaterThan(0);
    expect(result.domainInvocations[0]?.status).toBe(
      WorkoutDomainInvocationStatuses.SELECTED,
    );
    expect(
      result.domainInvocations.some(
        (item) =>
          item.capability === WorkoutDomainCapabilities.PROGRAM_GENERATION,
      ),
    ).toBe(true);
  });

  it("buildWorkoutPlan / evaluate / validate work via public API", () => {
    const service = createTestAgentService();
    const proposal = buildWorkoutPlan({
      service,
      request: createWorkoutRequestFixture(),
    });
    expect(proposal.split).toBeTruthy();
    expect(evaluateWorkout({ service, proposal }).valid).toBe(true);
    expect(validateWorkoutPlan({ service, proposal }).valid).toBe(true);
  });

  it("adaptWorkout invokes Training Adaptation Engine via injected port", async () => {
    const adaptationResult = createStubAdaptationResult();
    const service = createTestAgentService({
      ports: {
        previewAdaptations: async () => adaptationResult,
      },
    });

    const result = await adaptWorkout({
      service,
      request: createWorkoutRequestFixture({
        intentHint: WorkoutIntents.ADAPT_WORKOUT,
        message: "Adapt my workout for readiness",
      }),
      adaptationRequest: createStubAdaptationRequest(),
    });

    expect(result.success).toBe(true);
    expect(
      result.domainInvocations.some(
        (item) =>
          item.capability ===
            WorkoutDomainCapabilities.TRAINING_ADAPTATION &&
          item.status === WorkoutDomainInvocationStatuses.INVOKED,
      ),
    ).toBe(true);
    expect(result.message).toContain("Training Adaptation Engine");
    expect(Object.isFrozen(result)).toBe(true);
  });
});
