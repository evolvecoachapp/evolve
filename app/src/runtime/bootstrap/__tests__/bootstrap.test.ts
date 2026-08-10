import { resetCompositionRoot } from "../../../core/composition/createCompositionRoot";
import { SERVICE_TOKENS } from "../../../core/composition/registry/ServiceMap";
import { bootstrapRuntime, getBootstrapStatus } from "../application";
import { BOOTSTRAP_STATUS } from "../BootstrapStatus";
import { RuntimeBootstrap, resetRuntimeBootstrap } from "../RuntimeBootstrap";
import { RuntimeBootstrapError } from "../RuntimeBootstrapError";
import { RUNTIME_INITIALIZATION_PHASES } from "../RuntimeInitialization";

describe("RuntimeBootstrap", () => {
  afterEach(() => {
    resetRuntimeBootstrap();
    resetCompositionRoot();
  });

  it("bootstraps the runtime through composition root creation and validation", () => {
    const result = RuntimeBootstrap.bootstrap({
      clock: () => "2026-08-10T10:00:00.000Z",
    });

    expect(result.status).toBe("ready");
    expect(result.serviceTokenCount).toBe(SERVICE_TOKENS.length);
    expect(result.validatedAt).toBe("2026-08-10T10:00:00.000Z");
    expect(result.phases).toEqual([...RUNTIME_INITIALIZATION_PHASES]);
    expect(getBootstrapStatus()).toBe(BOOTSTRAP_STATUS.ready);
  });

  it("rejects duplicate bootstrap attempts", () => {
    RuntimeBootstrap.bootstrap();

    expect(() => RuntimeBootstrap.bootstrap()).toThrow(RuntimeBootstrapError);
    expect(() => RuntimeBootstrap.bootstrap()).toThrow(/already started/i);
  });

  it("exposes bootstrapRuntime as an idempotent application API", async () => {
    const first = await bootstrapRuntime({
      clock: () => "2026-08-10T10:00:00.000Z",
    });
    const second = await bootstrapRuntime();

    expect(second).toBe(first);
    expect(getBootstrapStatus()).toBe(BOOTSTRAP_STATUS.ready);
  });
});
