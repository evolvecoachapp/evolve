import {
  BACKEND_ROUTES,
  createBackendEndpoint,
  type BackendEndpoint,
  type BackendRoute,
} from "../models";

const ROUTE_NAMES: Readonly<Record<BackendRoute, string>> = Object.freeze({
  "/auth": "Auth",
  "/workout": "Workout",
  "/nutrition": "Nutrition",
  "/recovery": "Recovery",
  "/coach": "Coach",
  "/sync": "Sync",
  "/profile": "Profile",
  "/settings": "Settings",
});

/**
 * Canonical mock backend endpoints — route representations only.
 */
export function createDefaultBackendEndpoints(): readonly BackendEndpoint[] {
  return Object.freeze(
    BACKEND_ROUTES.map((route) =>
      createBackendEndpoint({
        endpointId: `endpoint${route.replace("/", "-")}`,
        route,
        name: ROUTE_NAMES[route],
        metadata: Object.freeze({ provider: "mock" }),
      }),
    ),
  );
}

export { BACKEND_ROUTES, isBackendRoute, type BackendRoute } from "../models";
export { createBackendEndpoint, type BackendEndpoint } from "../models";
