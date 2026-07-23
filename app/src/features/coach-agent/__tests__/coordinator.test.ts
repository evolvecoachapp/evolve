import { AgentCapabilityResolver } from "../selectors/AgentCapabilityResolver";
import { CoachCoordinator } from "../coordinator/CoachCoordinator";
import { CoachIntents } from "../models/CoachIntent";
import { SpecialistAgentKinds } from "../models/SpecialistAgentKind";
import {
  createCoachRequestFixture,
  createFixedClock,
  createMockSpecialistPorts,
  FIXED_NOW_MS,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("coach-agent coordinator", () => {
  it("builds a plan matching resolved agents", () => {
    const coordinator = new CoachCoordinator({
      clock: createFixedClock(),
      nowMs: () => FIXED_NOW_MS,
      ports: createMockSpecialistPorts(),
    });
    const plan = coordinator.buildPlan(
      createCoachRequestFixture({ intentHint: CoachIntents.RECOVERY_FOCUS }),
    );
    expect(plan.agentKinds).toEqual([SpecialistAgentKinds.RECOVERY]);
    expect(plan.steps[0]?.agent).toBe(SpecialistAgentKinds.RECOVERY);
    expect(plan.createdAt).toBe(FIXED_TIMESTAMP);
  });

  it("invokes only hinted agents", () => {
    const coordinator = new CoachCoordinator({
      clock: createFixedClock(),
      nowMs: () => FIXED_NOW_MS,
      ports: createMockSpecialistPorts(),
      resolver: new AgentCapabilityResolver(),
    });
    const result = coordinator.process({
      request: createCoachRequestFixture({
        intentHint: CoachIntents.HOLISTIC,
        agentHints: Object.freeze([
          SpecialistAgentKinds.WORKOUT,
          SpecialistAgentKinds.NUTRITION,
        ]),
      }),
    });
    expect(result.outputs.workout).not.toBeNull();
    expect(result.outputs.nutrition).not.toBeNull();
    expect(result.outputs.recovery).toBeNull();
    expect(result.events.some((e) => e.type === "agent_invoked")).toBe(true);
  });

  it("records failed specialist invocations", () => {
    const coordinator = new CoachCoordinator({
      clock: createFixedClock(),
      nowMs: () => FIXED_NOW_MS,
      ports: createMockSpecialistPorts({ failWorkout: true }),
    });
    const result = coordinator.process({
      request: createCoachRequestFixture({
        agentHints: Object.freeze([SpecialistAgentKinds.WORKOUT]),
      }),
    });
    expect(result.success).toBe(false);
    expect(
      result.outputs.invocations.some((i) => i.status === "failed"),
    ).toBe(true);
  });
});
