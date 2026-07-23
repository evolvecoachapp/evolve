import {
  describeDomainTool,
  executeDomainTool,
  listDomainTools,
} from "../application";
import { DomainToolIds, ALL_DOMAIN_TOOL_IDS } from "../models/DomainToolIds";
import {
  createDomainToolRequest,
  createTestDomainToolHarness,
} from "../testSupport/fixtures";

describe("domain-tools regression", () => {
  it("keeps dedicated adapter-per-domain boundaries", () => {
    const { adapters } = createTestDomainToolHarness();
    const domains = adapters.map((adapter) => adapter.domain()).sort();
    expect(domains).toEqual(["athlete", "coach", "recovery", "workout"]);
  });

  it("exposes stable domain tool ids", () => {
    const { service } = createTestDomainToolHarness();
    const ids = listDomainTools({ service }).map((tool) => tool.id).sort();
    expect(ids).toEqual([...ALL_DOMAIN_TOOL_IDS].sort());
  });

  it("returns immutable FoundationToolResult without throwing on failure", async () => {
    const { service } = createTestDomainToolHarness();
    const result = await executeDomainTool({
      service,
      request: createDomainToolRequest({
        toolId: DomainToolIds.RECOVERY_ANALYZE,
        parameters: {},
      }),
    });

    expect(result.status).toBe("failed");
    expect(Object.isFrozen(result)).toBe(true);
    expect(result.error).not.toBeNull();
  });

  it("does not expose adapter internals through public describe API", () => {
    const { service } = createTestDomainToolHarness();
    const descriptor = describeDomainTool({
      service,
      toolId: DomainToolIds.ATHLETE_BUILD_HISTORY,
    });
    expect(descriptor).toEqual(
      expect.objectContaining({
        id: DomainToolIds.ATHLETE_BUILD_HISTORY,
        category: "domain",
      }),
    );
    expect(descriptor).not.toHaveProperty("execute");
    expect(descriptor).not.toHaveProperty("adapter");
  });

  it("keeps mapping failures separate from domain invoker failures", async () => {
    const { service, calls } = createTestDomainToolHarness();
    const before = calls.length;
    await executeDomainTool({
      service,
      request: createDomainToolRequest({
        toolId: DomainToolIds.COACH_PREPARE_CONTEXT,
        parameters: {},
      }),
    });
    expect(calls.length).toBe(before);
  });
});
