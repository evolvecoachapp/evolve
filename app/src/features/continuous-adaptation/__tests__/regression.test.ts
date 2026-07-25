import {
  createAdaptationSnapshot,
  describeAdaptation,
  detectAdaptation,
  evaluateAdaptation,
  validateAdaptation,
} from "../application";
import * as publicApi from "../index";
import { AdaptationInputKinds } from "../models/AdaptationInput";
import {
  createAdaptationInput,
  createTestContinuousAdaptationEngineService,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("continuous-adaptation regression", () => {
  it("keeps public root surface limited to models + application + service", () => {
    expect(typeof publicApi.evaluateAdaptation).toBe("function");
    expect(typeof publicApi.detectAdaptation).toBe("function");
    expect(typeof publicApi.describeAdaptation).toBe("function");
    expect(typeof publicApi.createAdaptationSnapshot).toBe("function");
    expect(typeof publicApi.validateAdaptation).toBe("function");
    expect(publicApi.ContinuousAdaptationEngineService).toBeDefined();
    expect(typeof publicApi.createContinuousAdaptationEngineService).toBe("function");
    expect(publicApi.AdaptationInputKinds).toBeDefined();
    expect((publicApi as Record<string, unknown>).AdaptationCoordinator).toBeUndefined();
    expect((publicApi as Record<string, unknown>).observeState).toBeUndefined();
  });

  it("is deterministic for fixed clock + fixtures", () => {
    const service = createTestContinuousAdaptationEngineService();
    const input = createAdaptationInput({ kind: AdaptationInputKinds.EVALUATE });
    const a = evaluateAdaptation({ service, input });
    const b = evaluateAdaptation({
      service: createTestContinuousAdaptationEngineService(),
      input,
    });
    expect(a.success).toBe(true);
    expect(b.success).toBe(true);
    expect(a.createdAt).toBe(FIXED_TIMESTAMP);
    expect(a.decisions[0]!.id).toBe(b.decisions[0]!.id);
    expect(a.decisions[0]!.signalKeys).toEqual(b.decisions[0]!.signalKeys);
    expect(a.snapshot!.id).toBe(b.snapshot!.id);

    expect(detectAdaptation({ service, input }).success).toBe(true);
    expect(createAdaptationSnapshot({ service, input }).success).toBe(true);
    expect(validateAdaptation({ service, input }).success).toBe(true);
    expect(describeAdaptation({ service }).version).toBe("23.1.0");
  });
});
