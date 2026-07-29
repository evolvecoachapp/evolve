import { loadNotifications, type LoadNotificationsDeps } from "./LoadNotifications";

export async function refreshNotifications(deps: LoadNotificationsDeps = {}) {
  return loadNotifications(deps);
}
