import { buildAthleteState, updateAthleteState } from "../application";
import {
  createStateRequest,
  createTestAthleteStateService,
} from "../testSupport/fixtures";

describe("athlete-state regression", () => {
  it("does not mutate prior state on update", () => {
    const service = createTestAthleteStateService();
    const built = buildAthleteState({
      service,
      request: createStateRequest(),
    });
    const priorVersion = built.state!.version.revision;
    const priorFrozen = Object.isFrozen(built.state);

    const updated = updateAthleteState({
      service,
      request: createStateRequest({
        id: "request:reg:update",
        kind: "update",
      }),
    });

    expect(priorFrozen).toBe(true);
    expect(built.state!.version.revision).toBe(priorVersion);
    expect(updated.state!.version.revision).toBeGreaterThan(priorVersion);
    expect(Object.isFrozen(updated.state)).toBe(true);
  });

  it("exposes only public application surface from package root expectations", () => {
    const service = createTestAthleteStateService({ withMocks: false });
    const built = buildAthleteState({
      service,
      request: createStateRequest(),
    });
    expect(built.success).toBe(true);
    expect(built.state!.training.focus).toBeNull();
  });
});
