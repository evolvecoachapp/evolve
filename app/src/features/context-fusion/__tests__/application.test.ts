import {
  buildUnifiedContext,
  createContextSnapshot,
  describeContext,
  mergeContexts,
  validateUnifiedContext,
} from "../application";
import { ContextOperationKinds } from "../models/ContextResult";
import { ContextRequestKinds } from "../models/ContextRequest";
import {
  createContextRequest,
  createTestContextFusionService,
} from "../testSupport/fixtures";

describe("context-fusion application", () => {
  it("exposes public API build → merge → snapshot → describe → validate", () => {
    const service = createTestContextFusionService();

    const built = buildUnifiedContext({
      service,
      request: createContextRequest({ kind: ContextRequestKinds.BUILD }),
    });
    expect(built.success).toBe(true);
    expect(built.operation).toBe(ContextOperationKinds.BUILD);
    expect(built.decisionEngineContext).not.toBeNull();

    const merged = mergeContexts({
      service,
      request: createContextRequest({
        id: "request:merge",
        kind: ContextRequestKinds.MERGE,
        reason: "refresh sources",
      }),
    });
    expect(merged.success).toBe(true);
    expect(merged.operation).toBe(ContextOperationKinds.MERGE);
    expect(merged.context!.version.revision).toBeGreaterThan(
      built.context!.version.revision,
    );

    const snap = createContextSnapshot({
      service,
      request: createContextRequest({
        id: "request:snapshot",
        kind: ContextRequestKinds.SNAPSHOT,
      }),
    });
    expect(snap.success).toBe(true);
    expect(snap.snapshot).not.toBeNull();
    expect(Object.isFrozen(snap.snapshot)).toBe(true);

    const caps = describeContext({ service });
    expect(caps.name).toBe("Context Fusion Engine");
    expect(caps.capabilities.length).toBeGreaterThan(0);

    const validated = validateUnifiedContext({
      service,
      request: createContextRequest({
        id: "request:validate",
        kind: ContextRequestKinds.VALIDATE,
      }),
    });
    expect(validated.operation).toBe(ContextOperationKinds.VALIDATE);
    expect(validated.success).toBe(true);
  });
});
