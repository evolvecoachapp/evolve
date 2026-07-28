import {
  createCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import {
  BackendFactory,
  getBackend,
  getBackendHealth,
  getBackendCapabilities,
  listBackendEndpoints,
  validateBackend,
} from "../application";
import { MockBackendProvider } from "../provider/MockBackendProvider";
import { BackendProviderFactory } from "../provider/BackendProviderFactory";
import { BackendValidator } from "../provider/BackendValidator";
import { BackendRequestDispatcher } from "../provider/BackendRequestDispatcher";
import { BackendResponseMapper } from "../responses/BackendResponseMapper";
import {
  BACKEND_PROVIDER_TOKENS,
  BackendRegistry,
  createBackendRegistration,
  createBackendRegistry,
  BackendRegistrationError,
  BackendValidationError,
} from "../registry";
import {
  BACKEND_ROUTES,
  createBackendRequest,
  createBackendEndpoint,
  createBackendCapabilities,
} from "../models";
import { createDefaultBackendEndpoints } from "../routing";

describe("Backend API Adapter integration (Sprint 30.5)", () => {
  afterEach(() => {
    resetCompositionRoot();
  });

  describe("provider", () => {
    it("sends execute and dispatch deterministically", () => {
      const provider = new MockBackendProvider();
      const send = provider.send({
        route: "/workout",
        operation: "send",
      });
      const execute = provider.execute({
        route: "/nutrition",
        operation: "execute",
      });
      const dispatch = provider.dispatch({
        route: "/coach",
        operation: "dispatch",
      });

      expect(send.success).toBe(true);
      expect(send.value).toMatch(/^mock-response-/);
      expect(execute.success).toBe(true);
      expect(dispatch.success).toBe(true);
    });

    it("returns typed request results via dispatcher", () => {
      const provider = new MockBackendProvider();
      const request = createBackendRequest({
        requestId: "req-1",
        route: "/auth",
        operation: "dispatch",
      });
      const result = provider.dispatchRequest(request);
      expect(result.success).toBe(true);
      expect(result.value?.kind).toBe("Success");
      expect(result.value?.route).toBe("/auth");
      expect(Object.isFrozen(result.value)).toBe(true);
    });

    it("maps forced response kinds without transport", () => {
      const provider = new MockBackendProvider();
      const result = provider.sendRequest(
        createBackendRequest({
          requestId: "req-unauth",
          route: "/profile",
          payload: Object.freeze({ kind: "Unauthorized" }),
        }),
      );
      expect(result.success).toBe(false);
      expect(result.value?.kind).toBe("Unauthorized");
    });
  });

  describe("routing", () => {
    it("lists canonical routes only", () => {
      const endpoints = createDefaultBackendEndpoints();
      expect(endpoints.map((e) => e.route)).toEqual([...BACKEND_ROUTES]);
      expect(BACKEND_ROUTES).toEqual([
        "/auth",
        "/workout",
        "/nutrition",
        "/recovery",
        "/coach",
        "/sync",
        "/profile",
        "/settings",
      ]);
    });
  });

  describe("responses", () => {
    it("maps success and failure kinds", () => {
      const mapper = new BackendResponseMapper();
      const request = createBackendRequest({
        requestId: "r1",
        route: "/sync",
      });
      const success = mapper.map({
        request,
        responseId: "resp-1",
        kind: "Success",
        status: "success",
      });
      const failure = mapper.map({
        request,
        responseId: "resp-2",
        kind: "Failure",
        status: "failure",
        errorCode: "Failure",
        errorMessage: "failed",
      });
      expect(success.kind).toBe("Success");
      expect(success.error).toBeNull();
      expect(failure.kind).toBe("Failure");
      expect(failure.error?.code).toBe("Failure");
      expect(Object.isFrozen(success)).toBe(true);
      expect(Object.isFrozen(failure)).toBe(true);
    });
  });

  describe("registry", () => {
    it("registers MockBackendProvider with metadata", () => {
      const { registry, provider } = BackendFactory.create();
      expect(registry.list()).toHaveLength(BACKEND_PROVIDER_TOKENS.length);
      expect(registry.has("mock")).toBe(true);
      expect(registry.resolve("mock")).toBe(provider);
      expect(registry.resolveRegistration("mock")?.metadata.backend).toBe(
        "mock",
      );
      expect(registry.validate().valid).toBe(true);
    });

    it("rejects duplicate provider registrations", () => {
      const provider = BackendProviderFactory.create();
      const registry = createBackendRegistry();
      const registration = createBackendRegistration({
        token: "mock",
        name: "MockBackendProvider",
        version: "1.0.0",
        providerId: "mock",
      });
      registry.register(registration, provider);
      expect(() => registry.register(registration, provider)).toThrow(
        BackendRegistrationError,
      );
    });

    it("rejects contract compliance failures", () => {
      const registry = new BackendRegistry();
      const invalidProvider = {
        adapterId: "storage" as const,
        providerId: "mock" as const,
        capabilityFlags: createBackendCapabilities(),
        send: () => ({
          success: false,
          value: null,
          errorCode: null,
          message: null,
        }),
        execute: () => ({
          success: false,
          value: null,
          errorCode: null,
          message: null,
        }),
        dispatch: () => ({
          success: false,
          value: null,
          errorCode: null,
          message: null,
        }),
        health: () => ({
          success: true,
          value: "ready",
          errorCode: null,
          message: null,
        }),
        capabilities: () => ({
          success: true,
          value: Object.freeze({}),
          errorCode: null,
          message: null,
        }),
        listEndpoints: () => ({
          success: true,
          value: [],
          errorCode: null,
          message: null,
        }),
        sendRequest: () => ({
          success: false,
          value: null,
          errorCode: null,
          message: null,
        }),
        executeRequest: () => ({
          success: false,
          value: null,
          errorCode: null,
          message: null,
        }),
        dispatchRequest: () => ({
          success: false,
          value: null,
          errorCode: null,
          message: null,
        }),
        getHealth: () => ({
          success: true,
          value: null,
          errorCode: null,
          message: null,
        }),
        getCapabilities: () => ({
          success: true,
          value: null,
          errorCode: null,
          message: null,
        }),
        getEndpoints: () => ({
          success: true,
          value: [],
          errorCode: null,
          message: null,
        }),
      };
      expect(() =>
        registry.register(
          createBackendRegistration({
            token: "mock",
            name: "MockBackendProvider",
            version: "1.0.0",
            providerId: "mock",
          }),
          invalidProvider as never,
        ),
      ).toThrow(BackendValidationError);
    });
  });

  describe("composition root", () => {
    it("registers MockBackendProvider, BackendRegistry, BackendFactory", () => {
      const root = createCompositionRoot();
      const registry = root.getBackendRegistry();
      const provider = root.getMockBackendProvider();
      const factory = root.getBackendFactory();

      expect(registry.validate().valid).toBe(true);
      expect(provider).toBeInstanceOf(MockBackendProvider);
      expect(provider.adapterId).toBe("backend");
      expect(factory.create).toEqual(expect.any(Function));
      expect(root.registry.getMockBackendProvider()).toBe(provider);
    });
  });

  describe("application APIs", () => {
    it("exposes getBackend / health / capabilities / endpoints", () => {
      const provider = getBackend();
      expect(provider.adapterId).toBe("backend");

      const health = getBackendHealth({ provider });
      expect(health.healthy).toBe(true);
      expect(health.status).toBe("ready");

      const caps = getBackendCapabilities({ provider });
      expect(caps.supportsSend).toBe(true);
      expect(caps.supportsDispatch).toBe(true);

      const endpoints = listBackendEndpoints({ provider });
      expect(endpoints).toHaveLength(BACKEND_ROUTES.length);
      expect(endpoints[0]?.route).toBe("/auth");
    });

    it("validates missing provider", () => {
      const validation = validateBackend({
        registry: null,
        provider: null,
      });
      expect(validation.valid).toBe(false);
      expect(validation.errors).toEqual(
        expect.arrayContaining(["Missing provider"]),
      );
    });

    it("validates a healthy bundle", () => {
      const validation = validateBackend();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });
  });

  describe("validation", () => {
    it("detects duplicate endpoints and missing metadata", () => {
      const validator = new BackendValidator();
      const duplicate = [
        createBackendEndpoint({
          endpointId: "a",
          route: "/auth",
          name: "Auth",
        }),
        createBackendEndpoint({
          endpointId: "b",
          route: "/auth",
          name: "Auth2",
        }),
      ];
      expect(validator.validateEndpoints(duplicate).errors).toEqual(
        expect.arrayContaining(["duplicate endpoints: /auth"]),
      );

      expect(validator.validateRequest(null).errors).toEqual(
        expect.arrayContaining(["invalid request"]),
      );

      const incomplete = createBackendRequest({
        requestId: "",
        route: "/workout",
      });
      expect(validator.validateRequest(incomplete).errors).toEqual(
        expect.arrayContaining(["missing immutable fields: requestId"]),
      );
    });

    it("detects invalid capabilities and unsupported operations", () => {
      const validator = new BackendValidator();
      expect(validator.validateCapabilities(null).errors).toEqual(
        expect.arrayContaining(["invalid capabilities"]),
      );
      const disabled = createBackendCapabilities({
        supportsSend: false,
        supportsExecute: true,
        supportsDispatch: true,
        supportsHealth: true,
        supportsOffline: true,
        supportsListEndpoints: true,
      });
      expect(validator.validateCapabilities(disabled).errors).toEqual(
        expect.arrayContaining(["unsupported operations"]),
      );
    });

    it("dispatcher returns ValidationError for invalid requests", () => {
      const dispatcher = new BackendRequestDispatcher();
      const result = dispatcher.dispatch(
        createBackendRequest({
          requestId: "",
          route: "/auth",
        }),
      );
      expect(result.success).toBe(false);
      expect(result.value?.kind).toBe("ValidationError");
    });
  });

  describe("immutability", () => {
    it("freezes models and registrations", () => {
      const { registry, provider } = BackendFactory.create();
      const request = createBackendRequest({
        requestId: "freeze-1",
        route: "/settings",
      });
      const response = provider.dispatchRequest(request).value!;
      const health = provider.getHealth().value!;
      const endpoints = provider.getEndpoints().value!;

      expect(Object.isFrozen(request)).toBe(true);
      expect(Object.isFrozen(request.payload)).toBe(true);
      expect(Object.isFrozen(response)).toBe(true);
      expect(Object.isFrozen(health)).toBe(true);
      expect(Object.isFrozen(endpoints)).toBe(true);

      const registration = registry.resolveRegistration("mock");
      expect(Object.isFrozen(registration)).toBe(true);
      expect(Object.isFrozen(registration!.metadata)).toBe(true);
    });

    it("freezes validation results", () => {
      const validation = validateBackend();
      expect(Object.isFrozen(validation)).toBe(true);
      expect(Object.isFrozen(validation.errors)).toBe(true);
    });
  });

  describe("contract compliance", () => {
    it("implements BackendAdapter surface", () => {
      const provider = getBackend();
      expect(provider.adapterId).toBe("backend");
      expect(typeof provider.send).toBe("function");
      expect(typeof provider.execute).toBe("function");
      expect(typeof provider.dispatch).toBe("function");
      expect(typeof provider.health).toBe("function");
      expect(typeof provider.capabilities).toBe("function");
      expect(typeof provider.listEndpoints).toBe("function");
    });
  });
});
