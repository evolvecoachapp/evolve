import { mapNotificationCenterData, type NotificationCenterData } from "../mappers";
import { notificationCenterService, type NotificationCenterService } from "../services";

export interface LoadNotificationsDeps {
  readonly service?: NotificationCenterService;
}

export async function loadNotifications(deps: LoadNotificationsDeps = {}): Promise<NotificationCenterData> {
  const service = deps.service ?? notificationCenterService;
  const dto = await service.getNotifications();
  return mapNotificationCenterData(dto);
}
