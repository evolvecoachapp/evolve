import { createWorkoutAgentService } from "../../workout-agent/services/WorkoutAgentService";
import {
  createTestProgramGenerationService,
  createWorkoutGenerationRequest,
} from "../../program-generation/testSupport/fixtures";
import { EMPTY_WORKOUT_AGENT_METADATA } from "../../workout-agent/models/WorkoutAgentMetadata";
import { FIXED_GENERATION_TIMESTAMP } from "../testSupport/fixtures";

describe("Workout Agent generation path", () => {
  it("generateWorkout invokes Program Generation via domain gateway", async () => {
    const programGeneration = createTestProgramGenerationService();
    const service = createWorkoutAgentService({
      agentId: "agent:workout",
      clock: () => FIXED_GENERATION_TIMESTAMP,
      ports: {
        generateWorkoutProgram: (request) =>
          programGeneration.generateWorkoutProgram(request),
      },
    });

    const result = await service.generateWorkout({
      request: Object.freeze({
        id: "wreq:gen:1",
        athleteId: "athlete:1",
        conversationId: "conversation:1",
        message: "Generate workout",
        intentHint: "plan_workout",
        objectiveHint: null,
        daysPerWeek: null,
        experienceLevel: null,
        constraints: Object.freeze([] as string[]),
        metadata: EMPTY_WORKOUT_AGENT_METADATA,
        createdAt: FIXED_GENERATION_TIMESTAMP,
      }),
      generationRequest: createWorkoutGenerationRequest(),
    });

    expect(result.success).toBe(true);
    expect(result.generation.session.exercises.length).toBeGreaterThan(0);
    expect(result.proposal).toBeTruthy();
    expect(
      result.agent.domainInvocations.some(
        (item) => item.capability === "program_generation",
      ),
    ).toBe(true);
  });
});
