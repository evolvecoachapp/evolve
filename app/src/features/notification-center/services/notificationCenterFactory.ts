import { backendNotificationCenterService } from "../providers/BackendNotificationCenterService";
import { localNotificationCenterService } from "../providers/LocalNotificationCenterService";
import { mockNotificationCenterService } from "../providers/MockNotificationCenterService";
import type {
  NotificationCenterProviderId,
  NotificationCenterService,
} from "./NotificationCenterService";

function resolveProviderId(): NotificationCenterProviderId {
  const candidate = process.env.EXPO_PUBLIC_NOTIFICATION_CENTER_PROVIDER;
  if (candidate === "backend" || candidate === "local" || candidate === "mock") {
    return candidate;
  }
  return "mock";
}

export function createNotificationCenterService(): NotificationCenterService {
  const providerId = resolveProviderId();
  if (providerId === "backend") {
    return backendNotificationCenterService;
  }
  if (providerId === "local") {
    return localNotificationCenterService;
  }
  return mockNotificationCenterService;
}
