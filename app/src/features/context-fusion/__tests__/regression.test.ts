import { buildUnifiedContext } from "../application";
import {
  createContextRequest,
  createTestContextFusionService,
} from "../testSupport/fixtures";

describe("context-fusion regression", () => {
  it("does not mutate prior context when merging", () => {
    const service = createTestContextFusionService();
    const built = buildUnifiedContext({
      service,
      request: createContextRequest(),
    });
    const beforeRevision = built.context!.version.revision;
    const beforeSources = built.context!.sources.length;
    const merged = buildUnifiedContext({
      service,
      request: createContextRequest({
        id: "request:reg:build2",
        contextId: "context:athlete:2",
      }),
    });
    expect(built.context!.version.revision).toBe(beforeRevision);
    expect(built.context!.sources.length).toBe(beforeSources);
    expect(merged.success).toBe(true);
    expect(Object.isFrozen(built.context)).toBe(true);
    expect(Object.isFrozen(merged.context)).toBe(true);
  });

  it("exposes only fusion concerns in public descriptor", () => {
    const service = createTestContextFusionService();
    const caps = service.describeContext();
    expect(caps.capabilities).toEqual(
      expect.arrayContaining([
        "buildUnifiedContext",
        "mergeContexts",
        "validateUnifiedContext",
        "describeContext",
        "createContextSnapshot",
      ]),
    );
    expect(caps.capabilities.join(" ")).not.toMatch(/openai|prompt|persist/i);
  });
});
