import { createSessionLifecycleManager } from "../lifecycle/SessionLifecycleManager";
import { createSessionStateMachine } from "../lifecycle/SessionStateMachine";
import { SessionRequestKinds } from "../models/SessionRequest";
import { SessionPhases } from "../models/SessionPhase";
import { SessionStatuses } from "../models/SessionState";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("coaching-session lifecycle", () => {
  it("allows start → continue → end transitions", () => {
    const sm = createSessionStateMachine();
    const start = sm.transition({
      from: SessionStatuses.IDLE,
      kind: SessionRequestKinds.START,
    });
    expect(start.allowed).toBe(true);
    expect(start.nextStatus).toBe(SessionStatuses.ACTIVE);

    const cont = sm.transition({
      from: SessionStatuses.ACTIVE,
      kind: SessionRequestKinds.CONTINUE,
    });
    expect(cont.allowed).toBe(true);
    expect(cont.nextPhase).toBe(SessionPhases.CONTINUE);

    const end = sm.transition({
      from: SessionStatuses.ACTIVE,
      kind: SessionRequestKinds.END,
    });
    expect(end.allowed).toBe(true);
    expect(end.nextStatus).toBe(SessionStatuses.COMPLETED);
  });

  it("advances lifecycle stages immutably", () => {
    const mgr = createSessionLifecycleManager();
    const created = mgr.create({
      id: "life:1",
      sessionId: "session:1",
      updatedAt: FIXED_TIMESTAMP,
    });
    const started = mgr.advance({
      lifecycle: created,
      status: SessionStatuses.ACTIVE,
      phase: SessionPhases.INTERACT,
      updatedAt: FIXED_TIMESTAMP,
    });
    expect(started.startedAt).toBe(FIXED_TIMESTAMP);
    expect(Object.isFrozen(started)).toBe(true);
  });
});
