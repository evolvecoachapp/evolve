import { createAgentRuntime } from "../runtime/AgentRuntime";
import {
  createEventCoordinator,
  createLifecycleCoordinator,
} from "../coordinators";
import { AgentRuntimeStatuses } from "../models/AgentRuntimeStatus";
import { AgentRuntimeEventTypes } from "../models/AgentRuntimeEvent";
import { AgentRoles } from "../../agent-framework/models/AgentRole";
import { buildAgentRuntimeRequest } from "../builders";
import {
  createFixedClock,
  createFixedNowMs,
  createRoleRequest,
  createTrackingExecutor,
  createWorkoutAgent,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("agent-runtime runtime", () => {
  it("executes selected agent and returns immutable response", async () => {
    const runtime = createAgentRuntime({
      clock: createFixedClock(),
      nowMs: createFixedNowMs(),
      runtimeId: "runtime:agent:unit",
    });
    runtime.registerAgent(createWorkoutAgent(), {
      executor: createTrackingExecutor("workout"),
    });

    const response = await runtime.execute(createRoleRequest());
    expect(Object.isFrozen(response)).toBe(true);
    expect(response.success).toBe(true);
    expect(response.selectedAgentId).toBe("agent:workout:runtime");
    expect(response.result?.message).toContain("Custom executor:workout");
    expect(response.events.some((e) => e.type === AgentRuntimeEventTypes.AGENT_SELECTED)).toBe(
      true,
    );
  });

  it("returns failed response when selection criteria miss", async () => {
    const runtime = createAgentRuntime({
      clock: createFixedClock(),
      nowMs: createFixedNowMs(),
    });
    runtime.registerAgent(createWorkoutAgent());

    const response = await runtime.execute(
      buildAgentRuntimeRequest({
        id: "areq:miss",
        role: AgentRoles.GOAL,
        createdAt: FIXED_TIMESTAMP,
      }),
    );
    expect(response.success).toBe(false);
    expect(response.error?.code).toBe("agent_not_selected");
  });

  it("lifecycle and event coordinators are pure orchestration helpers", () => {
    const lifecycle = createLifecycleCoordinator();
    let state = lifecycle.createInitial({
      runtimeId: "runtime:1",
      requestId: "areq:1",
      updatedAt: FIXED_TIMESTAMP,
    });
    state = lifecycle.transition(state, {
      status: AgentRuntimeStatuses.EXECUTING,
      phase: "executing",
      selectedAgentId: "agent:1",
      updatedAt: FIXED_TIMESTAMP,
    });
    expect(state.status).toBe(AgentRuntimeStatuses.EXECUTING);

    const events = createEventCoordinator();
    events.emit({
      type: AgentRuntimeEventTypes.RUNTIME_STARTED,
      runtimeId: "runtime:1",
      requestId: "areq:1",
      status: AgentRuntimeStatuses.IDLE,
      message: "start",
      occurredAt: FIXED_TIMESTAMP,
    });
    expect(events.list()).toHaveLength(1);
  });
});
