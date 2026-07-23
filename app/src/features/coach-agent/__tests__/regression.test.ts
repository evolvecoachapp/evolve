import { processCoachRequest, buildCoachingPlan } from "../application";
import { CoachIntents } from "../models/CoachIntent";
import { SpecialistAgentKinds } from "../models/SpecialistAgentKind";
import {
  createCoachRequestFixture,
  createMockRecoveryResult,
  createMockSpecialistPorts,
  createMockWorkoutResult,
  createTestAgentService,
} from "../testSupport/fixtures";

describe("coach-agent regression", () => {
  it("does not invent business logic — only orchestrates and merges", () => {
    const service = createTestAgentService();
    const result = processCoachRequest({
      service,
      request: createCoachRequestFixture(),
    });
    expect(result.decision.reasons.some((r) => r.includes("Merged"))).toBe(
      true,
    );
    expect(result.message).toMatch(/orchestrated/i);
  });

  it("keeps recovery precedence when recovery rejects and workout accepts", () => {
    const ports = createMockSpecialistPorts({
      workout: createMockWorkoutResult({
        decision: Object.freeze({
          id: "wdecision:1",
          accepted: true,
          confidence: Object.freeze({
            score: 0.9,
            label: "high",
            rationale: "ok",
          }),
        }) as ReturnType<typeof createMockWorkoutResult>["decision"],
      }),
      recovery: createMockRecoveryResult({
        decision: Object.freeze({
          id: "rdecision:1",
          accepted: false,
        }) as ReturnType<typeof createMockRecoveryResult>["decision"],
      }),
    });
    const service = createTestAgentService(ports);
    const result = processCoachRequest({
      service,
      request: createCoachRequestFixture({
        agentHints: Object.freeze([
          SpecialistAgentKinds.WORKOUT,
          SpecialistAgentKinds.RECOVERY,
        ]),
      }),
    });
    expect(
      result.decision.conflicts.some(
        (c) => c.id === "conflict:domain:recovery_blocks_workout",
      ),
    ).toBe(true);
    expect(result.decision.accepted).toBe(false);
  });

  it("plan for unknown intent defaults to workout only", () => {
    const service = createTestAgentService();
    const plan = buildCoachingPlan({
      service,
      request: createCoachRequestFixture({
        message: "hi",
        intentHint: CoachIntents.UNKNOWN,
        agentHints: Object.freeze([]),
      }),
    });
    expect(plan.agentKinds).toEqual([SpecialistAgentKinds.WORKOUT]);
  });
});
