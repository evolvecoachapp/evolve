import {
  AgentRuntimeRequestBuilder,
  buildAgentRuntimeRequest,
} from "../builders/AgentRuntimeRequestBuilder";
import { AgentRuntimeContextBuilder } from "../builders/AgentRuntimeContextBuilder";
import { AgentRuntimeResponseBuilder } from "../builders/AgentRuntimeResponseBuilder";
import { AgentRoles } from "../../agent-framework/models/AgentRole";
import { AgentRuntimeStatuses } from "../models/AgentRuntimeStatus";
import { EMPTY_AGENT_RUNTIME_METADATA } from "../models/AgentRuntimeMetadata";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("agent-runtime builders", () => {
  it("builds immutable runtime requests", () => {
    const request = new AgentRuntimeRequestBuilder()
      .withId("areq:1")
      .withRole(AgentRoles.RECOVERY)
      .withIntent("recover")
      .withCreatedAt(FIXED_TIMESTAMP)
      .build();

    expect(Object.isFrozen(request)).toBe(true);
    expect(request.role).toBe(AgentRoles.RECOVERY);

    const viaHelper = buildAgentRuntimeRequest({
      id: "areq:2",
      agentId: "agent:x",
      createdAt: FIXED_TIMESTAMP,
    });
    expect(viaHelper.agentId).toBe("agent:x");
  });

  it("builds immutable context from request", () => {
    const request = buildAgentRuntimeRequest({
      id: "areq:ctx",
      role: AgentRoles.WORKOUT,
      athleteId: "athlete-1",
      createdAt: FIXED_TIMESTAMP,
    });
    const context = new AgentRuntimeContextBuilder()
      .withId("ctx:1")
      .withRuntimeId("runtime:1")
      .withRequest(request)
      .withCreatedAt(FIXED_TIMESTAMP)
      .build();

    expect(Object.isFrozen(context)).toBe(true);
    expect(context.athleteId).toBe("athlete-1");
  });

  it("requires response builder fields", () => {
    expect(() => new AgentRuntimeResponseBuilder().build()).toThrow(
      /missing required fields/,
    );

    const request = buildAgentRuntimeRequest({
      id: "areq:resp",
      role: AgentRoles.GENERIC,
      createdAt: FIXED_TIMESTAMP,
    });
    const context = new AgentRuntimeContextBuilder()
      .withId("ctx:resp")
      .withRuntimeId("runtime:1")
      .withRequest(request)
      .withCreatedAt(FIXED_TIMESTAMP)
      .build();

    const summary = Object.freeze({
      requestId: request.id,
      selectedAgentId: null,
      status: AgentRuntimeStatuses.COMPLETED,
      success: true,
      message: "ok",
      selectionReason: null,
      fallbackUsed: false,
      eventCount: 0,
      durationMs: 0,
    });
    const snapshot = Object.freeze({
      id: "snap:1",
      runtimeId: "runtime:1",
      request,
      context,
      state: Object.freeze({
        id: "state:1",
        runtimeId: "runtime:1",
        requestId: request.id,
        selectedAgentId: null,
        status: AgentRuntimeStatuses.COMPLETED,
        phase: "completed",
        message: null,
        metadata: EMPTY_AGENT_RUNTIME_METADATA,
        updatedAt: FIXED_TIMESTAMP,
      }),
      plan: null,
      result: null,
      events: Object.freeze([]),
      summary,
      metadata: EMPTY_AGENT_RUNTIME_METADATA,
      capturedAt: FIXED_TIMESTAMP,
    });

    const response = new AgentRuntimeResponseBuilder()
      .withId("resp:1")
      .withRequestId(request.id)
      .withRuntimeId("runtime:1")
      .withSuccess(true)
      .withStatus(AgentRuntimeStatuses.COMPLETED)
      .withMessage("ok")
      .withSummary(summary)
      .withSnapshot(snapshot)
      .withStartedAt(FIXED_TIMESTAMP)
      .withCompletedAt(FIXED_TIMESTAMP)
      .withFrozenAt(FIXED_TIMESTAMP)
      .build();

    expect(Object.isFrozen(response)).toBe(true);
    expect(response.success).toBe(true);
  });
});
