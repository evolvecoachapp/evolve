import {
  createCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import {
  SynchronizationFactory,
  getSynchronization,
  getSynchronizationQueue,
  getSynchronizationState,
  getSynchronizationStatistics,
  validateSynchronization,
} from "../application";
import { SynchronizationEngineFactory } from "../engine/SynchronizationEngineFactory";
import { SynchronizationValidator } from "../engine/SynchronizationValidator";
import {
  SYNCHRONIZATION_PROVIDER_TOKENS,
  SynchronizationRegistry,
  createSynchronizationProviderRegistration,
  createSynchronizationRegistry,
  SynchronizationProviderRegistrationError,
  SynchronizationProviderValidationError,
} from "../registry";
import {
  createSynchronizationConflict,
  createSynchronizationOperation,
  createSynchronizationPolicy,
  SYNCHRONIZATION_CONFLICT_TYPES,
  SYNCHRONIZATION_POLICIES,
} from "../models";
import { canTransitionSynchronizationState } from "../state";

describe("Synchronization Adapter integration (Sprint 30.4)", () => {
  afterEach(() => {
    resetCompositionRoot();
  });

  describe("queue", () => {
    it("enqueues operations in FIFO order", () => {
      const engine = SynchronizationEngineFactory.create();
      engine.enqueue({ type: "push", payload: { a: "1" } });
      engine.enqueue({ type: "pull" });
      engine.enqueue({ type: "sync", payload: { b: "2" } });

      const queue = engine.getQueue().value!;
      expect(queue.size).toBe(3);
      expect(queue.operations.map((op) => op.type)).toEqual([
        "push",
        "pull",
        "sync",
      ]);
      expect(Object.isFrozen(queue)).toBe(true);
      expect(Object.isFrozen(queue.operations)).toBe(true);
    });

    it("peeks without removing and dequeues FIFO", () => {
      const engine = SynchronizationEngineFactory.create();
      engine.enqueue({ type: "push", payload: { k: "v" } });
      engine.enqueue({ type: "pull" });

      const peeked = engine.peek().value!;
      expect(peeked.type).toBe("push");
      expect(engine.getQueue().value!.size).toBe(2);

      const dequeued = engine.dequeue().value!;
      expect(dequeued?.type).toBe("push");
      expect(engine.getQueue().value!.size).toBe(1);
      expect(engine.peek().value!.type).toBe("pull");
    });
  });

  describe("operations", () => {
    it("supports markCompleted / markFailed / cancel / retry / clear", () => {
      const engine = SynchronizationEngineFactory.create();
      const first = engine.enqueue({ type: "push" }).value!;
      const second = engine.enqueue({ type: "pull" }).value!;
      const third = engine.enqueue({ type: "sync" }).value!;

      expect(engine.markCompleted(first.operationId).success).toBe(true);
      expect(engine.markFailed(second.operationId).success).toBe(true);
      expect(engine.cancel(third.operationId).success).toBe(true);

      const retried = engine.retry(second.operationId);
      expect(retried.success).toBe(true);
      expect(retried.value?.status).toBe("pending");
      expect(retried.value?.retryCount).toBe(1);

      expect(engine.clear().success).toBe(true);
      expect(engine.getQueue().value!.size).toBe(0);
      expect(engine.getState().value).toBe("idle");
    });

    it("rejects duplicate operation ids", () => {
      const engine = SynchronizationEngineFactory.create();
      engine.enqueue({ type: "push", operationId: "op-1" });
      const duplicate = engine.enqueue({
        type: "pull",
        operationId: "op-1",
      });
      expect(duplicate.success).toBe(false);
      expect(duplicate.errorCode).toBe("duplicate_operation");
    });
  });

  describe("batch", () => {
    it("creates and completes a local batch", () => {
      const engine = SynchronizationEngineFactory.create();
      const a = engine.enqueue({ type: "push" }).value!;
      const b = engine.enqueue({ type: "pull" }).value!;

      const batch = engine.createBatch([a.operationId, b.operationId]);
      expect(batch.success).toBe(true);
      expect(batch.value?.operationIds).toEqual([
        a.operationId,
        b.operationId,
      ]);
      expect(Object.isFrozen(batch.value)).toBe(true);

      const completed = engine.completeBatch(batch.value!.batchId);
      expect(completed.success).toBe(true);
      expect(completed.value?.state).toBe("completed");
    });

    it("rejects empty batches", () => {
      const engine = SynchronizationEngineFactory.create();
      const batch = engine.createBatch([]);
      expect(batch.success).toBe(false);
      expect(batch.errorCode).toBe("empty_batch");
    });
  });

  describe("state", () => {
    it("transitions lifecycle states deterministically", () => {
      const engine = SynchronizationEngineFactory.create();
      expect(engine.getState().value).toBe("idle");

      expect(engine.transition("pending").success).toBe(true);
      expect(engine.transition("running").success).toBe(true);
      expect(engine.transition("completed").success).toBe(true);
      expect(engine.getCheckpoint().value?.state).toBe("completed");
      expect(engine.transition("idle").success).toBe(true);
    });

    it("rejects invalid transitions", () => {
      const engine = SynchronizationEngineFactory.create();
      const result = engine.transition("running");
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe("invalid_transition");
      expect(canTransitionSynchronizationState("idle", "running")).toBe(false);
    });
  });

  describe("policies", () => {
    it("represents all policies without execution", () => {
      const engine = SynchronizationEngineFactory.create();
      expect(SYNCHRONIZATION_POLICIES).toEqual([
        "Manual",
        "Immediate",
        "OfflineFirst",
        "WiFiOnly",
        "Background",
        "Disabled",
      ]);

      for (const policy of SYNCHRONIZATION_POLICIES) {
        const result = engine.setPolicy(createSynchronizationPolicy(policy));
        expect(result.success).toBe(true);
        expect(engine.getPolicy().value).toBe(policy);
      }
    });
  });

  describe("conflicts", () => {
    it("records conflict models without resolution", () => {
      const engine = SynchronizationEngineFactory.create();
      expect(SYNCHRONIZATION_CONFLICT_TYPES).toContain("LocalNewer");
      expect(SYNCHRONIZATION_CONFLICT_TYPES).toContain("VersionMismatch");

      const conflict = createSynchronizationConflict({
        conflictId: "c1",
        type: "MergeRequired",
        entityKey: "athlete:1",
        localVersion: "1",
        remoteVersion: "2",
        createdAt: "1970-01-01T00:00:00.000Z",
      });
      const recorded = engine.recordConflict(conflict);
      expect(recorded.success).toBe(true);
      expect(engine.getConflicts().value).toHaveLength(1);
      expect(Object.isFrozen(conflict)).toBe(true);
    });
  });

  describe("registry", () => {
    it("registers SynchronizationEngine with metadata", () => {
      const { registry, engine } = SynchronizationFactory.create();
      expect(registry.list()).toHaveLength(
        SYNCHRONIZATION_PROVIDER_TOKENS.length,
      );
      expect(registry.has("local")).toBe(true);
      expect(registry.resolve("local")).toBe(engine);
      expect(registry.resolveRegistration("local")?.metadata.backend).toBe(
        "local",
      );
      expect(registry.validate().valid).toBe(true);
    });

    it("rejects duplicate provider registrations", () => {
      const engine = SynchronizationEngineFactory.create();
      const registry = createSynchronizationRegistry();
      const registration = createSynchronizationProviderRegistration({
        token: "local",
        name: "SynchronizationEngine",
        version: "1.0.0",
        providerId: "local",
      });
      registry.register(registration, engine);
      expect(() => registry.register(registration, engine)).toThrow(
        SynchronizationProviderRegistrationError,
      );
    });

    it("rejects contract compliance failures", () => {
      const registry = new SynchronizationRegistry();
      const invalidEngine = {
        adapterId: "storage" as const,
        providerId: "local" as const,
        capabilities: {
          supportsOffline: true,
          supportsEncryption: false,
          supportsBatch: true,
          supportsConflicts: true,
          supportsCheckpoint: true,
          supportsQueue: true,
        },
        push: () => ({
          success: true,
          value: null,
          errorCode: null,
          message: null,
        }),
        pull: () => ({
          success: true,
          value: {},
          errorCode: null,
          message: null,
        }),
        getStatus: () => ({
          success: true,
          value: "idle",
          errorCode: null,
          message: null,
        }),
      };
      expect(() =>
        registry.register(
          createSynchronizationProviderRegistration({
            token: "local",
            name: "SynchronizationEngine",
            version: "1.0.0",
            providerId: "local",
          }),
          invalidEngine as never,
        ),
      ).toThrow(SynchronizationProviderValidationError);
    });
  });

  describe("composition root", () => {
    it("registers SynchronizationEngine, SynchronizationRegistry, SynchronizationFactory", () => {
      const root = createCompositionRoot();
      const registry = root.getSynchronizationRegistry();
      const engine = root.getSynchronizationEngine();
      const factory = root.getSynchronizationFactory();

      expect(registry.validate().valid).toBe(true);
      expect(engine.adapterId).toBe("synchronization");
      expect(engine.providerId).toBe("local");
      expect(factory.create).toEqual(expect.any(Function));
      expect(root.registry.getSynchronizationEngine()).toBe(engine);
    });
  });

  describe("application APIs", () => {
    it("exposes getSynchronization / queue / state / statistics", () => {
      const engine = getSynchronization();
      expect(engine.adapterId).toBe("synchronization");

      engine.enqueue({ type: "push", payload: { x: "1" } });
      expect(getSynchronizationQueue({ engine }).size).toBe(1);
      expect(getSynchronizationState({ engine })).toBe("pending");
      expect(getSynchronizationStatistics({ engine }).pendingCount).toBe(1);
    });

    it("validates missing provider", () => {
      const validation = validateSynchronization({
        registry: null,
        engine: null,
      });
      expect(validation.valid).toBe(false);
      expect(validation.errors).toEqual(
        expect.arrayContaining(["Missing provider"]),
      );
    });

    it("validates a healthy bundle", () => {
      const validation = validateSynchronization();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });
  });

  describe("validation", () => {
    it("detects invalid queue and missing immutable fields", () => {
      const validator = new SynchronizationValidator();
      expect(validator.validateQueue(null).valid).toBe(false);
      expect(validator.validateQueue(null).errors).toEqual(
        expect.arrayContaining(["invalid queue"]),
      );

      const incomplete = createSynchronizationOperation({
        operationId: "",
        type: "push",
        createdAt: "",
      });
      expect(validator.validateOperation(incomplete).errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining("missing immutable fields"),
        ]),
      );
    });

    it("detects invalid transitions and missing metadata", () => {
      const validator = new SynchronizationValidator();
      expect(
        validator.validateTransition("idle", "completed").errors,
      ).toEqual(expect.arrayContaining(["invalid transition: idle -> completed"]));

      expect(validator.validateConflict(null).errors).toEqual(
        expect.arrayContaining(["invalid conflict"]),
      );
    });
  });

  describe("immutability", () => {
    it("freezes models and registrations", () => {
      const { registry, engine } = SynchronizationFactory.create();
      engine.enqueue({ type: "push", payload: { a: "1" } });
      const queue = engine.getQueue().value!;
      const operation = queue.operations[0]!;

      expect(Object.isFrozen(queue)).toBe(true);
      expect(Object.isFrozen(operation)).toBe(true);
      expect(Object.isFrozen(operation.payload)).toBe(true);
      expect(Object.isFrozen(operation.metadata)).toBe(true);

      const registration = registry.resolveRegistration("local");
      expect(Object.isFrozen(registration)).toBe(true);
      expect(Object.isFrozen(registration!.metadata)).toBe(true);
    });

    it("freezes validation results", () => {
      const validation = validateSynchronization();
      expect(Object.isFrozen(validation)).toBe(true);
      expect(Object.isFrozen(validation.errors)).toBe(true);
    });
  });

  describe("contract compliance", () => {
    it("implements SynchronizationAdapter surface without networking", () => {
      const engine = getSynchronization();
      expect(engine.adapterId).toBe("synchronization");
      expect(typeof engine.push).toBe("function");
      expect(typeof engine.pull).toBe("function");
      expect(typeof engine.getStatus).toBe("function");

      const push = engine.push({ key: "value" });
      expect(push.success).toBe(true);
      const pull = engine.pull();
      expect(pull.success).toBe(true);
      expect(pull.value).toEqual({});
      const status = engine.getStatus();
      expect(status.success).toBe(true);
      expect(typeof status.value).toBe("string");
    });
  });
});
