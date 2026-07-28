/**
 * Canonical backend route path representations.
 * Routes only — no URL building, no HTTP verbs, no transport.
 */
export const BACKEND_ROUTES = [
  "/auth",
  "/workout",
  "/nutrition",
  "/recovery",
  "/coach",
  "/sync",
  "/profile",
  "/settings",
] as const;

export type BackendRoute = (typeof BACKEND_ROUTES)[number];

export function isBackendRoute(value: string): value is BackendRoute {
  return (BACKEND_ROUTES as readonly string[]).includes(value);
}
