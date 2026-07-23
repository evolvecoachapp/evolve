import {
  validateExecutionLifecycle,
  validateExecutionPlan,
  validateRegistryIntegrity,
  validateRuntimeRequest,
  validateRuntimeResponse,
  validateSelectedAgent,
} from "../validators";
import { AgentRegistry } from "../registry/AgentRegistry";
import {
  createTestRuntimeService,
  createWorkoutAgent,
  FIXED_TIMESTAMP,
  createRoleRequest,
} from "../testSupport/fixtures";
import { AgentRuntimeStatuses } from "../models/AgentRuntimeStatus";
import { AgentRoles } from "../../agent-framework/models/AgentRole";
import { buildAgentRuntimeRequest } from "../builders";
import { EMPTY_AGENT_RUNTIME_METADATA } from "../models/AgentRuntimeMetadata";

describe("agent-runtime validators", () => {
  it("validates runtime requests", () => {
    expect(validateRuntimeRequest(null)).toContain("request_missing");
    expect(
      validateRuntimeRequest(
        buildAgentRuntimeRequest({
          id: "areq:1",
          createdAt: FIXED_TIMESTAMP,
        }),
      ),
    ).toContain("request_selection_criteria_missing");
    expect(validateRuntimeRequest(createRoleRequest())).toEqual([]);
  });

  it("validates registry integrity and selected agents", () => {
    const registry = AgentRegistry.empty().register(createWorkoutAgent(), {
      registeredAt: FIXED_TIMESTAMP,
    });
    expect(validateRegistryIntegrity(registry)).toEqual([]);
    expect(validateRegistryIntegrity(null)).toContain("registry_missing");

    expect(validateSelectedAgent(null)).toContain("selected_agent_missing");
    expect(validateSelectedAgent(createWorkoutAgent())).toEqual([]);
  });

  it("validates execution plan and lifecycle", () => {
    expect(validateExecutionPlan(null)).toContain("execution_plan_missing");
    expect(
      validateExecutionPlan({
        id: "plan:1",
        requestId: "areq:1",
        agentId: "agent:1",
        role: AgentRoles.WORKOUT,
        capability: null,
        selectionReason: "by role",
        fallbackUsed: false,
        status: AgentRuntimeStatuses.PLANNING,
        metadata: EMPTY_AGENT_RUNTIME_METADATA,
        createdAt: FIXED_TIMESTAMP,
        frozenAt: FIXED_TIMESTAMP,
      }),
    ).toEqual([]);

    expect(validateExecutionLifecycle(null)).toContain(
      "lifecycle_state_missing",
    );
    expect(
      validateExecutionLifecycle(
        {
          id: "state:1",
          runtimeId: "runtime:1",
          requestId: "areq:1",
          selectedAgentId: "agent:1",
          status: AgentRuntimeStatuses.COMPLETED,
          phase: "completed",
          message: null,
          metadata: EMPTY_AGENT_RUNTIME_METADATA,
          updatedAt: FIXED_TIMESTAMP,
        },
        { expectTerminal: true },
      ),
    ).toEqual([]);
  });

  it("validates runtime responses from a successful execute", async () => {
    const service = createTestRuntimeService();
    service.registerAgent(createWorkoutAgent());
    const response = await service.execute(createRoleRequest());
    expect(validateRuntimeResponse(response)).toEqual([]);
    expect(validateRuntimeResponse(null)).toContain("response_missing");
  });
});
