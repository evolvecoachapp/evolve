import { CoachAgentEngine } from "../agent/CoachAgentEngine";
import {
  createCoachRequestFixture,
  createFixedClock,
  createMockSpecialistPorts,
  FIXED_NOW_MS,
} from "../testSupport/fixtures";

describe("coach-agent engine", () => {
  it("describes and processes through engine", () => {
    const engine = new CoachAgentEngine({
      clock: createFixedClock(),
      nowMs: () => FIXED_NOW_MS,
      agentId: "agent:coach:engine",
      ports: createMockSpecialistPorts(),
    });
    const described = engine.describe();
    expect(described.id).toBe("agent:coach:engine");
    const result = engine.processRequest({
      request: createCoachRequestFixture(),
    });
    expect(result.success).toBe(true);
    expect(engine.getCoordinator().getState().status).toBe("completed");
  });
});
