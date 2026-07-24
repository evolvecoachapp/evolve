import {
  buildAthleteState,
  createSnapshot,
  describeAthleteState,
  updateAthleteState,
  validateAthleteState,
} from "../application";
import { AthleteStateOperationKinds } from "../models/AthleteStateResult";
import { AthleteStateRequestKinds } from "../models/AthleteStateRequest";
import {
  createStateRequest,
  createTestAthleteStateService,
} from "../testSupport/fixtures";

describe("athlete-state application", () => {
  it("exposes public API build → update → snapshot → describe → validate", () => {
    const service = createTestAthleteStateService();

    const built = buildAthleteState({
      service,
      request: createStateRequest({ kind: AthleteStateRequestKinds.BUILD }),
    });
    expect(built.success).toBe(true);
    expect(built.operation).toBe(AthleteStateOperationKinds.BUILD);
    expect(built.supervisorContext).not.toBeNull();

    const updated = updateAthleteState({
      service,
      request: createStateRequest({
        id: "request:update",
        kind: AthleteStateRequestKinds.UPDATE,
        reason: "refresh from specialists",
      }),
    });
    expect(updated.success).toBe(true);
    expect(updated.operation).toBe(AthleteStateOperationKinds.UPDATE);
    expect(updated.state!.version.revision).toBeGreaterThan(
      built.state!.version.revision,
    );

    const snap = createSnapshot({
      service,
      request: createStateRequest({
        id: "request:snapshot",
        kind: AthleteStateRequestKinds.SNAPSHOT,
      }),
    });
    expect(snap.success).toBe(true);
    expect(snap.snapshot).not.toBeNull();
    expect(Object.isFrozen(snap.snapshot)).toBe(true);

    const caps = describeAthleteState({ service });
    expect(caps.name).toBe("Athlete State Engine");
    expect(caps.capabilities.length).toBeGreaterThan(0);

    const validated = validateAthleteState({
      service,
      request: createStateRequest({
        id: "request:validate",
        kind: AthleteStateRequestKinds.VALIDATE,
      }),
    });
    expect(validated.operation).toBe(AthleteStateOperationKinds.VALIDATE);
    expect(validated.success).toBe(true);
  });
});
