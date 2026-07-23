import { buildActionPlan, summarizeActionPlan } from "../application";
import {
  createRichCoachResponseFixture,
  createTestEngineHarness,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("action-engine regression", () => {
  it("identical CoachResponse yields identical plan step ids", () => {
    const { service } = createTestEngineHarness();
    const response = createRichCoachResponseFixture({ id: "coach:reg:1" });

    const a = buildActionPlan({
      service,
      response,
      createdAt: FIXED_TIMESTAMP,
      planId: "plan:reg:1",
    });
    const b = buildActionPlan({
      service,
      response,
      createdAt: FIXED_TIMESTAMP,
      planId: "plan:reg:1",
    });

    expect(a.plan.steps.map((s) => s.id)).toEqual(
      b.plan.steps.map((s) => s.id),
    );
    expect(a.plan.intent).toBe(b.plan.intent);
    expect(summarizeActionPlan({ service, plan: a.plan })).toEqual(
      summarizeActionPlan({ service, plan: b.plan }),
    );
  });

  it("never mutates input CoachResponse", () => {
    const { service } = createTestEngineHarness();
    const response = createRichCoachResponseFixture();
    const before = JSON.stringify(response);

    buildActionPlan({
      service,
      response,
      createdAt: FIXED_TIMESTAMP,
    });

    expect(JSON.stringify(response)).toBe(before);
    expect(Object.isFrozen(response)).toBe(true);
  });
});
