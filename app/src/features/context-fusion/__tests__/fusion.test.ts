import { ContextOperationKinds } from "../models/ContextResult";
import { ContextRequestKinds } from "../models/ContextRequest";
import {
  createContextRequest,
  createTestContextFusionService,
} from "../testSupport/fixtures";

describe("context-fusion fusion", () => {
  it("builds immutable unified context via engine facade", () => {
    const service = createTestContextFusionService();
    const result = service.buildUnifiedContext(
      createContextRequest({ kind: ContextRequestKinds.BUILD }),
    );
    expect(result.success).toBe(true);
    expect(result.operation).toBe(ContextOperationKinds.BUILD);
    expect(result.context).not.toBeNull();
    expect(Object.isFrozen(result.context)).toBe(true);
    expect(result.context!.sources.length).toBeGreaterThanOrEqual(6);
    expect(result.decisionEngineContext).not.toBeNull();
  });

  it("merges into existing session context", () => {
    const service = createTestContextFusionService();
    const built = service.buildUnifiedContext(createContextRequest());
    expect(built.success).toBe(true);
    const merged = service.mergeContexts(
      createContextRequest({
        id: "request:merge",
        kind: ContextRequestKinds.MERGE,
      }),
    );
    expect(merged.success).toBe(true);
    expect(merged.context!.version.revision).toBeGreaterThan(
      built.context!.version.revision,
    );
  });
});
