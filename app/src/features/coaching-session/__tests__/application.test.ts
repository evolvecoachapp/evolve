import {
  continueSession,
  describeSession,
  endSession,
  startSession,
  validateSession,
} from "../application";
import { SessionOperationKinds } from "../models/SessionResult";
import { SessionRequestKinds } from "../models/SessionRequest";
import {
  createSessionRequest,
  createTestSessionService,
} from "../testSupport/fixtures";

describe("coaching-session application", () => {
  it("exposes public API start → continue → end → describe → validate", () => {
    const service = createTestSessionService();

    const started = startSession({
      service,
      request: createSessionRequest({
        kind: SessionRequestKinds.START,
        sessionId: "session:app:1",
      }),
    });
    expect(started.success).toBe(true);
    expect(started.operation).toBe(SessionOperationKinds.START);
    expect(started.response).not.toBeNull();
    expect(started.context).not.toBeNull();

    const continued = continueSession({
      service,
      request: createSessionRequest({
        id: "request:session:continue",
        kind: SessionRequestKinds.CONTINUE,
        sessionId: "session:app:1",
        message: "Adjust intensity",
        intent: "Adjust workout intensity",
      }),
    });
    expect(continued.success).toBe(true);
    expect(continued.operation).toBe(SessionOperationKinds.CONTINUE);
    expect(continued.context?.state.turnCount).toBe(2);

    const ended = endSession({
      service,
      request: createSessionRequest({
        id: "request:session:end",
        kind: SessionRequestKinds.END,
        sessionId: "session:app:1",
        message: "",
        intent: "end",
      }),
    });
    expect(ended.success).toBe(true);
    expect(ended.operation).toBe(SessionOperationKinds.END);
    expect(ended.summary).not.toBeNull();

    const caps = describeSession({ service });
    expect(caps.name).toBe("Coaching Session Runtime");
    expect(caps.capabilities.length).toBeGreaterThan(0);

    const validated = validateSession({
      service,
      request: createSessionRequest({
        kind: SessionRequestKinds.VALIDATE,
        sessionId: "session:app:1",
        intent: "validate",
      }),
    });
    expect(validated.operation).toBe(SessionOperationKinds.VALIDATE);
  });
});
