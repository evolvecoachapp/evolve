/**
 * Static allowlist of production route paths that exist in the Expo Router
 * tree (`app/app/**`). Several feature dashboards model future navigation
 * `destination` fields before the corresponding screen is built (documented
 * "navigation placeholder" pattern — see PROJECT_STATE Sprint 27.1+). When a
 * screen actually wires one of those destinations to `router.push`, navigating
 * to a destination that has no matching route lands on the router's
 * not-found screen. `isReachableRoute` lets a screen skip navigation for a
 * destination that is not wired to a real route yet, without hand-rolling an
 * allowlist per screen or building the destination screen prematurely.
 *
 * Update this list whenever a new route is added under `app/app/(app)/` that
 * a feature dashboard should be able to navigate to.
 */
const REACHABLE_ROUTES: ReadonlySet<string> = new Set([
  "/(app)/(tabs)",
  "/(app)/(tabs)/index",
  "/(app)/(tabs)/workout",
  "/(app)/(tabs)/nutrition",
  "/(app)/(tabs)/coach",
  "/(app)/(tabs)/progress",
  "/(app)/(tabs)/profile",
  "/(app)/goals",
  "/(app)/setup",
  "/(app)/recovery",
  "/(app)/notifications",
  "/(app)/settings",
  "/(app)/settings/appearance",
  "/(app)/settings/appearance/theme",
  "/(app)/workout/analytics",
  "/(app)/workout/complete",
  "/(app)/workout/detail",
  "/(app)/workout/history",
  "/(app)/workout/records",
  "/(app)/workout/session",
  "/(app)/workout/summary",
]);

/** Strips a query string so `destination?withParams=1` still resolves against the path allowlist. */
function stripQuery(destination: string): string {
  const queryIndex = destination.indexOf("?");
  return queryIndex === -1 ? destination : destination.slice(0, queryIndex);
}

/** Returns true only when `destination` matches a route that actually exists in the router tree. */
export function isReachableRoute(destination: string | null | undefined): boolean {
  if (!destination) {
    return false;
  }
  return REACHABLE_ROUTES.has(stripQuery(destination));
}
