import {
  describeDomainTool,
  executeDomainTool,
  listDomainTools,
} from "../application";
import { DomainToolIds } from "../models/DomainToolIds";
import {
  createDomainToolRequest,
  createTestDomainToolHarness,
} from "../testSupport/fixtures";

describe("domain-tools application API", () => {
  it("executeDomainTool runs through public API", async () => {
    const { service, calls } = createTestDomainToolHarness();

    const result = await executeDomainTool({
      service,
      request: createDomainToolRequest({
        toolId: DomainToolIds.WORKOUT_GENERATE,
        parameters: { request: { athleteContext: { id: "a1" } } },
      }),
    });

    expect(result.status).toBe("succeeded");
    expect(result.output?.data).toEqual(
      expect.objectContaining({ tag: "workout-generate" }),
    );
    expect(calls).toContain("generateWorkoutProgram");
  });

  it("listDomainTools and describeDomainTool expose descriptors only", () => {
    const { service } = createTestDomainToolHarness();

    const tools = listDomainTools({ service });
    expect(tools.length).toBeGreaterThanOrEqual(10);
    expect(
      describeDomainTool({
        service,
        toolId: DomainToolIds.COACH_PREPARE_CONTEXT,
      })?.id,
    ).toBe(DomainToolIds.COACH_PREPARE_CONTEXT);
    expect(
      describeDomainTool({ service, toolId: "domain.missing.tool" }),
    ).toBeNull();
  });

  it("executeDomainTool fails for unsupported tools", async () => {
    const { service } = createTestDomainToolHarness();
    const result = await executeDomainTool({
      service,
      request: createDomainToolRequest({
        toolId: "domain.nutrition.plan",
        parameters: {},
      }),
    });
    expect(result.status).toBe("failed");
    expect(result.error?.code).toBe("unsupported_tool");
  });
});
