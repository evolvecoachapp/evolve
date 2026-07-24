import { AthleteStatusKinds } from "../models/AthleteStatus";
import { AthleteStateRequestKinds } from "../models/AthleteStateRequest";
import {
  createStateRequest,
  createTestAthleteStateService,
} from "../testSupport/fixtures";

describe("athlete-state state engine", () => {
  it("builds immutable athlete state and stores it in manager", () => {
    const service = createTestAthleteStateService();
    const result = service.buildAthleteState(
      createStateRequest({ kind: AthleteStateRequestKinds.BUILD }),
    );
    expect(result.success).toBe(true);
    expect(result.state).not.toBeNull();
    expect(result.state!.athleteId).toBe("athlete:1");
    expect(Object.isFrozen(result.state)).toBe(true);
    expect(result.state!.status.kind).toBe(AthleteStatusKinds.ACTIVE);
    expect(result.state!.training.focus).toBe("strength");
    expect(result.state!.version.revision).toBeGreaterThanOrEqual(1);
  });

  it("rejects duplicate build for same athlete", () => {
    const service = createTestAthleteStateService();
    const req = createStateRequest();
    expect(service.buildAthleteState(req).success).toBe(true);
    const second = service.buildAthleteState(req);
    expect(second.success).toBe(false);
  });
});
