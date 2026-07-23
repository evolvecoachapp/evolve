import { createAgentLifecycle } from "../lifecycle/AgentLifecycle";
import { createAgentStateMachine } from "../lifecycle/AgentStateMachine";
import { createAgentHealthChecker } from "../lifecycle/AgentHealthChecker";
import { createStubAgent } from "../testSupport/fixtures";
import { AgentStatuses } from "../models/AgentStatus";
import { AgentHealthStatuses } from "../models/AgentHealth";
import { createDefaultConfiguration } from "../models/AgentConfiguration";

describe("agent-framework lifecycle", () => {
  it("state machine allows ready → busy → ready", () => {
    const machine = createAgentStateMachine();
    expect(machine.canTransition(AgentStatuses.READY, AgentStatuses.BUSY)).toBe(
      true,
    );
    expect(machine.canTransition(AgentStatuses.BUSY, AgentStatuses.READY)).toBe(
      true,
    );
    expect(
      machine.canTransition(AgentStatuses.SHUTDOWN, AgentStatuses.READY),
    ).toBe(false);
  });

  it("lifecycle initialize / transition / shutdown", () => {
    const lifecycle = createAgentLifecycle(() => "2026-07-23T12:00:00.000Z");
    const agent = createStubAgent({ status: AgentStatuses.REGISTERED });

    const initialized = lifecycle.initialize(agent, "session:1");
    expect(initialized.status).toBe(AgentStatuses.READY);
    expect(initialized.sessionId).toBe("session:1");

    const busy = lifecycle.transition(agent.id, AgentStatuses.BUSY, {
      requestId: "req:1",
    });
    expect(busy.status).toBe(AgentStatuses.BUSY);
    expect(busy.requestId).toBe("req:1");

    const shutdown = lifecycle.shutdown(agent);
    expect(shutdown.status).toBe(AgentStatuses.SHUTDOWN);
    expect(Object.isFrozen(shutdown)).toBe(true);
  });

  it("health checker reports unhealthy when disabled", () => {
    const checker = createAgentHealthChecker(() => "t");
    const agent = createStubAgent({
      configuration: Object.freeze({
        ...createDefaultConfiguration("agent:x"),
        enabled: false,
      }),
    });
    const health = checker.check(agent);
    expect(health.status).toBe(AgentHealthStatuses.UNHEALTHY);
  });
});
