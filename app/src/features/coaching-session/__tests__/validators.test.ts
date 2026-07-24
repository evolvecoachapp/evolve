import { SessionRequestKinds } from "../models/SessionRequest";
import { validateResponseConsistency } from "../validators/validateResponseConsistency";
import { validateSessionIntegrity } from "../validators/validateSessionIntegrity";
import { validateSessionRequest } from "../validators/validateSessionRequest";
import { validateTransitions } from "../validators/validateTransitions";
import { SessionStatuses } from "../models/SessionState";
import {
  createSessionRequest,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { SessionConfidenceLevels } from "../models/SessionConfidence";
import { EMPTY_SESSION_DIAGNOSTICS } from "../models/SessionDiagnostics";
import { EMPTY_SESSION_METADATA } from "../models/SessionMetadata";

describe("coaching-session validators", () => {
  it("validates requests and transitions", () => {
    const ok = validateSessionRequest(createSessionRequest());
    expect(ok.valid).toBe(true);

    const badContinue = validateSessionRequest(
      createSessionRequest({
        kind: SessionRequestKinds.CONTINUE,
        sessionId: null,
        message: "hello",
      }),
    );
    expect(badContinue.valid).toBe(false);

    const transition = validateTransitions({
      request: createSessionRequest({
        kind: SessionRequestKinds.CONTINUE,
        sessionId: "session:1",
      }),
      from: SessionStatuses.IDLE,
    });
    expect(transition.valid).toBe(false);
  });

  it("validates response consistency and integrity", () => {
    const response = {
      id: "resp:1",
      sessionId: "session:1",
      requestId: "req:1",
      message: "ok",
      sections: Object.freeze(["a"]),
      agentIds: Object.freeze(["agent:workout"]),
      capabilityIds: Object.freeze(["capability:generate_workout"]),
      confidence: Object.freeze({
        level: SessionConfidenceLevels.HIGH,
        score: 0.9,
        rationale: null,
      }),
      diagnostics: EMPTY_SESSION_DIAGNOSTICS,
      metadata: EMPTY_SESSION_METADATA,
      createdAt: FIXED_TIMESTAMP,
      frozenAt: FIXED_TIMESTAMP,
    };
    expect(validateResponseConsistency(response).valid).toBe(true);
    expect(
      validateSessionIntegrity({
        request: createSessionRequest(),
        response,
      }).valid,
    ).toBe(true);
  });
});
