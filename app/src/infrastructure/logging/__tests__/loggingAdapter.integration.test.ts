import {
  createCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import {
  LoggerFactory,
  getLogger,
  log,
  getLogStatistics,
  clearLogs,
  validateLogging,
} from "../application";
import { MockLogger } from "../logger/MockLogger";
import { LoggerInstanceFactory } from "../logger/LoggerInstanceFactory";
import { LoggerValidator } from "../logger/LoggerValidator";
import { LogDispatcher } from "../logger/LogDispatcher";
import {
  LOGGER_TOKENS,
  LoggerRegistry,
  createLoggerRegistration,
  createLoggerRegistry,
  LoggerRegistrationError,
  LoggerValidationError,
} from "../registry";
import {
  LOG_LEVELS,
  LOG_SCOPES,
  createLogContext,
  createLogEvent,
  createLogCapabilities,
  createLogStatistics,
  createScopedLogEvent,
} from "../models";

describe("Logging & Observability Adapter integration (Sprint 30.6)", () => {
  afterEach(() => {
    resetCompositionRoot();
  });

  describe("logger", () => {
    it("emits all levels deterministically", () => {
      const logger = new MockLogger();
      expect(logger.trace("t", { scope: "Application" }).success).toBe(true);
      expect(logger.debug("d", { scope: "Workout" }).success).toBe(true);
      expect(logger.info("i", { scope: "Nutrition" }).success).toBe(true);
      expect(logger.warn("w", { scope: "Recovery" }).success).toBe(true);
      expect(logger.error("e", { scope: "Coach" }).success).toBe(true);
      expect(logger.fatal("f", { scope: "Backend" }).success).toBe(true);

      const entries = logger.getEntries().value!;
      expect(entries).toHaveLength(6);
      expect(entries.map((e) => e.level)).toEqual([
        "Trace",
        "Debug",
        "Information",
        "Warning",
        "Error",
        "Fatal",
      ]);
    });

    it("supports flush clear and statistics without sinks", () => {
      const logger = new MockLogger();
      logger.info("hello", { scope: "Application" });
      expect(logger.flush().success).toBe(true);
      expect(logger.statistics().success).toBe(true);
      expect(logger.statistics().value?.totalCount).toBe("1");
      expect(logger.clear().success).toBe(true);
      expect(logger.getEntries().value).toHaveLength(0);
    });
  });

  describe("levels", () => {
    it("represents canonical levels only", () => {
      expect(LOG_LEVELS).toEqual([
        "Trace",
        "Debug",
        "Information",
        "Warning",
        "Error",
        "Fatal",
      ]);
    });
  });

  describe("context", () => {
    it("supports immutable scoped context", () => {
      expect(LOG_SCOPES).toEqual([
        "Workout",
        "Nutrition",
        "Recovery",
        "Coach",
        "Synchronization",
        "Authentication",
        "Backend",
        "Application",
      ]);

      const context = createLogContext({
        scope: "Synchronization",
        attributes: Object.freeze({ op: "enqueue" }),
      });
      expect(Object.isFrozen(context)).toBe(true);
      expect(Object.isFrozen(context.attributes)).toBe(true);
    });
  });

  describe("registry", () => {
    it("registers MockLogger with metadata", () => {
      const { registry, logger } = LoggerFactory.create();
      expect(registry.list()).toHaveLength(LOGGER_TOKENS.length);
      expect(registry.has("mock")).toBe(true);
      expect(registry.resolve("mock")).toBe(logger);
      expect(registry.resolveRegistration("mock")?.metadata.backend).toBe(
        "mock",
      );
      expect(registry.validate().valid).toBe(true);
    });

    it("rejects duplicate logger registrations", () => {
      const logger = LoggerInstanceFactory.create();
      const registry = createLoggerRegistry();
      const registration = createLoggerRegistration({
        token: "mock",
        name: "MockLogger",
        version: "1.0.0",
        loggerId: "mock",
      });
      registry.register(registration, logger);
      expect(() => registry.register(registration, logger)).toThrow(
        LoggerRegistrationError,
      );
    });

    it("rejects contract compliance failures", () => {
      const registry = new LoggerRegistry();
      const invalidLogger = {
        adapterId: "storage" as const,
        loggerId: "mock" as const,
        capabilities: createLogCapabilities(),
        trace: () => ({
          success: true,
          value: null,
          errorCode: null,
          message: null,
        }),
        debug: () => ({
          success: true,
          value: null,
          errorCode: null,
          message: null,
        }),
        info: () => ({
          success: true,
          value: null,
          errorCode: null,
          message: null,
        }),
        warn: () => ({
          success: true,
          value: null,
          errorCode: null,
          message: null,
        }),
        error: () => ({
          success: true,
          value: null,
          errorCode: null,
          message: null,
        }),
        fatal: () => ({
          success: true,
          value: null,
          errorCode: null,
          message: null,
        }),
        flush: () => ({
          success: true,
          value: null,
          errorCode: null,
          message: null,
        }),
        clear: () => ({
          success: true,
          value: null,
          errorCode: null,
          message: null,
        }),
        statistics: () => ({
          success: true,
          value: Object.freeze({}),
          errorCode: null,
          message: null,
        }),
        log: () => ({
          success: false,
          value: null,
          errorCode: null,
          message: null,
        }),
        logMessage: () => ({
          success: false,
          value: null,
          errorCode: null,
          message: null,
        }),
        getStatistics: () => ({
          success: true,
          value: createLogStatistics(),
          errorCode: null,
          message: null,
        }),
        getEntries: () => ({
          success: true,
          value: [],
          errorCode: null,
          message: null,
        }),
        flushEntries: () => ({
          success: true,
          value: 0,
          errorCode: null,
          message: null,
        }),
        clearEntries: () => ({
          success: true,
          value: null,
          errorCode: null,
          message: null,
        }),
        validate: () => ({ valid: true, errors: Object.freeze([]) }),
      };
      expect(() =>
        registry.register(
          createLoggerRegistration({
            token: "mock",
            name: "MockLogger",
            version: "1.0.0",
            loggerId: "mock",
          }),
          invalidLogger as never,
        ),
      ).toThrow(LoggerValidationError);
    });
  });

  describe("composition root", () => {
    it("registers MockLogger, LoggerRegistry, LoggerFactory", () => {
      const root = createCompositionRoot();
      const registry = root.getLoggerRegistry();
      const mockLogger = root.getMockLogger();
      const factory = root.getLoggerFactory();

      expect(registry.validate().valid).toBe(true);
      expect(mockLogger).toBeInstanceOf(MockLogger);
      expect(mockLogger.adapterId).toBe("logging");
      expect(factory.create).toEqual(expect.any(Function));
      expect(root.registry.getMockLogger()).toBe(mockLogger);
    });
  });

  describe("application APIs", () => {
    it("exposes getLogger / log / statistics / clearLogs", () => {
      const logger = getLogger();
      expect(logger.adapterId).toBe("logging");

      const event = createScopedLogEvent({
        level: "Information",
        message: "api-log",
        scope: "Authentication",
      });
      const result = log(event, { logger });
      expect(result.success).toBe(true);
      expect(result.value?.message).toBe("api-log");

      const stats = getLogStatistics({ logger });
      expect(stats.totalCount).toBe(1);
      expect(stats.countsByLevel.Information).toBe(1);

      clearLogs({ logger });
      expect(getLogStatistics({ logger }).totalCount).toBe(0);
    });

    it("validates missing logger", () => {
      const validation = validateLogging({
        registry: null,
        logger: null,
      });
      expect(validation.valid).toBe(false);
      expect(validation.errors).toEqual(
        expect.arrayContaining(["Missing logger"]),
      );
    });

    it("validates a healthy bundle", () => {
      const validation = validateLogging();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });
  });

  describe("validation", () => {
    it("detects invalid level context event and missing metadata", () => {
      const validator = new LoggerValidator();
      expect(validator.validateLevel("Nope").errors).toEqual(
        expect.arrayContaining(["invalid level"]),
      );
      expect(validator.validateScope("Nope").errors).toEqual(
        expect.arrayContaining(["invalid context"]),
      );
      expect(validator.validateEvent(null).errors).toEqual(
        expect.arrayContaining(["invalid event"]),
      );

      const incomplete = createLogEvent({
        level: "Debug",
        message: "",
        context: createLogContext({ scope: "Application" }),
      });
      expect(validator.validateEvent(incomplete).errors).toEqual(
        expect.arrayContaining(["invalid event: message required"]),
      );
    });

    it("detects invalid capabilities and unsupported operations", () => {
      const validator = new LoggerValidator();
      expect(validator.validateCapabilities(null).errors).toEqual(
        expect.arrayContaining(["invalid capabilities"]),
      );
      const disabled = createLogCapabilities({
        supportsTrace: false,
        supportsDebug: true,
        supportsInformation: true,
        supportsWarning: true,
        supportsError: true,
        supportsFatal: true,
        supportsFlush: true,
        supportsClear: true,
        supportsStatistics: true,
        supportsOffline: true,
      });
      expect(validator.validateCapabilities(disabled).errors).toEqual(
        expect.arrayContaining(["unsupported operations"]),
      );
    });

    it("dispatcher returns validation_error for invalid events", () => {
      const dispatcher = new LogDispatcher();
      const result = dispatcher.dispatch(
        createLogEvent({
          level: "Information",
          message: "",
          context: createLogContext({ scope: "Application" }),
        }),
      );
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe("validation_error");
    });
  });

  describe("immutability", () => {
    it("freezes models and registrations", () => {
      const { registry, logger } = LoggerFactory.create();
      const event = createLogEvent({
        level: "Warning",
        message: "freeze",
        context: createLogContext({ scope: "Coach" }),
      });
      const entry = logger.log(event).value!;
      const stats = logger.getStatistics().value!;
      const entries = logger.getEntries().value!;

      expect(Object.isFrozen(event)).toBe(true);
      expect(Object.isFrozen(event.context)).toBe(true);
      expect(Object.isFrozen(entry)).toBe(true);
      expect(Object.isFrozen(stats)).toBe(true);
      expect(Object.isFrozen(entries)).toBe(true);

      const registration = registry.resolveRegistration("mock");
      expect(Object.isFrozen(registration)).toBe(true);
      expect(Object.isFrozen(registration!.metadata)).toBe(true);
    });

    it("freezes validation results", () => {
      const validation = validateLogging();
      expect(Object.isFrozen(validation)).toBe(true);
      expect(Object.isFrozen(validation.errors)).toBe(true);
    });
  });

  describe("statistics", () => {
    it("aggregates counts by level", () => {
      const logger = new MockLogger();
      logger.debug("a");
      logger.info("b");
      logger.info("c");
      logger.error("d");
      const stats = logger.getStatistics().value!;
      expect(stats.totalCount).toBe(4);
      expect(stats.countsByLevel.Debug).toBe(1);
      expect(stats.countsByLevel.Information).toBe(2);
      expect(stats.countsByLevel.Error).toBe(1);
      expect(stats.lastEntryId).toMatch(/^mock-log-/);
    });
  });

  describe("contract compliance", () => {
    it("implements LoggingAdapter surface", () => {
      const logger = getLogger();
      expect(logger.adapterId).toBe("logging");
      expect(typeof logger.trace).toBe("function");
      expect(typeof logger.debug).toBe("function");
      expect(typeof logger.info).toBe("function");
      expect(typeof logger.warn).toBe("function");
      expect(typeof logger.error).toBe("function");
      expect(typeof logger.fatal).toBe("function");
      expect(typeof logger.flush).toBe("function");
      expect(typeof logger.clear).toBe("function");
      expect(typeof logger.statistics).toBe("function");
    });
  });
});
